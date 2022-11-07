import fs from 'fs';
import path from 'path';
import ts, {HeritageClause} from 'typescript';

import {notNullOrUndefined} from '../../packages/common/src/shared-utils';

import {
    ClassInfo,
    DocsPage,
    InterfaceInfo,
    MemberInfo,
    MethodInfo,
    MethodParameterInfo,
    ParsedDeclaration,
    PropertyInfo,
    TypeAliasInfo,
    ValidDeclaration,
} from './typescript-docgen-types';

/**
 * 将 TypeScript 源文件解析为数据结构，然后再进行渲染成 markdown 文档。
 */
export class TypescriptDocsParser {
    private readonly atTokenPlaceholder = '__EscapedAtToken__';

    /**
     * 解析由 filepath 数组给出的 TypeScript 文件，并返回已解析的数据结构准备渲染。
     */
    parse(filePaths: string[]): DocsPage[] {
        const sourceFiles = filePaths.map((filePath) => {
            return ts.createSourceFile(
                filePath,
                this.replaceEscapedAtTokens(fs.readFileSync(filePath).toString()),
                ts.ScriptTarget.ES2015,
                true,
            );
        });

        const statements = this.getStatementsWithSourceLocation(sourceFiles);

        const pageMap = statements
            .map((statement) => {
                const info = this.parseDeclaration(
                    statement.statement,
                    statement.sourceFile,
                    statement.sourceLine,
                );
                return info;
            })
            .filter(notNullOrUndefined)
            .reduce((pages, declaration) => {
                const pageTitle = declaration.page || declaration.title;
                const existingPage = pages.get(pageTitle);
                if (existingPage) {
                    existingPage.declarations.push(declaration);
                } else {
                    const normalizedTitle = this.kebabCase(pageTitle);
                    const fileName = normalizedTitle === declaration.category ? '_index' : normalizedTitle;
                    pages.set(pageTitle, {
                        title: pageTitle,
                        category: declaration.category,
                        declarations: [ declaration ],
                        fileName,
                    });
                }
                return pages;
            }, new Map<string, DocsPage>());

        return Array.from(pageMap.values());
    }

    /**
     * 将解析的 SourceFiles 数组映射到语句中，每个语句包括对原始文件的引用。
     */
    private getStatementsWithSourceLocation(
        sourceFiles: ts.SourceFile[],
    ): Array<{ statement: ts.Statement; sourceFile: string; sourceLine: number }> {
        return sourceFiles.reduce((st, sf) => {
            const statementsWithSources = sf.statements.map((statement) => {
                const sourceFile = path.relative(path.join(__dirname, '..'), sf.fileName).replace(/\\/g, '/');
                const sourceLine = sf.getLineAndCharacterOfPosition(statement.getStart()).line + 1;
                return {statement, sourceFile, sourceLine};
            });
            return [ ...st, ...statementsWithSources ];
        }, [] as Array<{ statement: ts.Statement; sourceFile: string; sourceLine: number }>);
    }

    /**
     * 将 InterfaceDeclaration 解析为一个简单的对象，该对象可以呈现为 markdown。
     */
    private parseDeclaration(
        statement: ts.Statement,
        sourceFile: string,
        sourceLine: number,
    ): ParsedDeclaration | undefined {
        if (!this.isValidDeclaration(statement)) {
            return;
        }
        const category = this.getDocsCategory(statement);
        if (category === undefined) {
            return;
        }
        let title: string;
        if (ts.isVariableStatement(statement)) {
            title = statement.declarationList.declarations[0].name.getText();
        } else {
            title = statement.name ? statement.name.getText() : 'anonymous';
        }
        const fullText = this.getDeclarationFullText(statement);
        const weight = this.getDeclarationWeight(statement);
        const description = this.getDeclarationDescription(statement);
        const docsPage = this.getDocsPage(statement);
        const packageName = this.getPackageName(sourceFile);

        const info = {
            packageName,
            sourceFile,
            sourceLine,
            fullText,
            title,
            weight,
            category,
            description,
            page: docsPage,
        };

        if (ts.isInterfaceDeclaration(statement)) {
            return {
                ...info,
                kind: 'interface',
                extendsClause: this.getHeritageClause(statement, ts.SyntaxKind.ExtendsKeyword),
                members: this.parseMembers(statement.members),
            };
        } else if (ts.isTypeAliasDeclaration(statement)) {
            return {
                ...info,
                type: statement.type,
                kind: 'typeAlias',
                members: ts.isTypeLiteralNode(statement.type)
                    ? this.parseMembers(statement.type.members)
                    : undefined,
            };
        } else if (ts.isClassDeclaration(statement)) {
            return {
                ...info,
                kind: 'class',
                members: this.parseMembers(statement.members),
                extendsClause: this.getHeritageClause(statement, ts.SyntaxKind.ExtendsKeyword),
                implementsClause: this.getHeritageClause(statement, ts.SyntaxKind.ImplementsKeyword),
            };
        } else if (ts.isEnumDeclaration(statement)) {
            return {
                ...info,
                kind: 'enum' as 'enum',
                members: this.parseMembers(statement.members) as PropertyInfo[],
            };
        } else if (ts.isFunctionDeclaration(statement)) {
            const parameters = statement.parameters.map((p) => ({
                name: p.name.getText(),
                type: p.type ? p.type.getText() : '',
                optional: !!p.questionToken,
                initializer: p.initializer && p.initializer.getText(),
            }));
            return {
                ...info,
                kind: 'function',
                parameters,
                type: statement.type,
            };
        } else if (ts.isVariableStatement(statement)) {
            return {
                ...info,
                kind: 'variable',
            };
        }
    }

    /**
     * 返回类或接口的任何 "extends" 或 "implements" 子类
     */
    private getHeritageClause(
        statement: ts.ClassDeclaration | ts.InterfaceDeclaration,
        kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword,
    ): HeritageClause | undefined {
        const {heritageClauses} = statement;
        if (!heritageClauses) {
            return;
        }
        const clause = heritageClauses.find((cl) => cl.token === kind);
        if (!clause) {
            return;
        }
        return clause;
    }

    /**
     * 返回声明的名称加上任义类型参数
     */
    private getDeclarationFullText(declaration: ValidDeclaration): string {
        let name: string;
        if (ts.isVariableStatement(declaration)) {
            name = declaration.declarationList.declarations[0].name.getText();
        } else {
            name = declaration.name ? declaration.name.getText() : 'anonymous';
        }
        let typeParams = '';
        if (
            !ts.isEnumDeclaration(declaration) &&
            !ts.isVariableStatement(declaration) &&
            declaration.typeParameters
        ) {
            typeParams = '<' + declaration.typeParameters.map((tp) => tp.getText()).join(', ') + '>';
        }
        return name + typeParams;
    }

    private getPackageName(sourceFile: string): string {
        const matches = sourceFile.match(/\/packages\/([^/]+)\//);
        if (matches) {
            return `@vendure/${matches[1]}`;
        } else {
            return '';
        }
    }

    /**
     * 将接口成员数组解析为一个简单对象，该对象可以呈现为 markdown。
     */
    private parseMembers(
        members: ts.NodeArray<ts.TypeElement | ts.ClassElement | ts.EnumMember>,
    ): Array<PropertyInfo | MethodInfo> {
        const result: Array<PropertyInfo | MethodInfo> = [];

        for (const member of members) {
            const modifiers = member.modifiers ? member.modifiers.map((m) => m.getText()) : [];
            const isPrivate = modifiers.includes('private');
            if (
                !isPrivate &&
                (ts.isPropertySignature(member) ||
                    ts.isMethodSignature(member) ||
                    ts.isPropertyDeclaration(member) ||
                    ts.isMethodDeclaration(member) ||
                    ts.isConstructorDeclaration(member) ||
                    ts.isEnumMember(member) ||
                    ts.isGetAccessorDeclaration(member) ||
                    ts.isIndexSignatureDeclaration(member))
            ) {
                const name = member.name
                    ? member.name.getText()
                    : ts.isIndexSignatureDeclaration(member)
                        ? '[index]'
                        : 'constructor';
                let description = '';
                let type = '';
                let defaultValue = '';
                let parameters: MethodParameterInfo[] = [];
                let fullText = '';
                let isInternal = false;
                if (ts.isConstructorDeclaration(member)) {
                    fullText = 'constructor';
                } else if (ts.isMethodDeclaration(member)) {
                    fullText = member.name.getText();
                } else if (ts.isGetAccessorDeclaration(member)) {
                    fullText = `${member.name.getText()}: ${member.type ? member.type.getText() : 'void'}`;
                } else {
                    fullText = member.getText();
                }
                this.parseTags(member, {
                    description: (tag) => (description += tag.comment || ''),
                    example: (tag) => {
                        if (tag.comment) {
                            return (description += this.formatExampleCode(tag.comment.toString()))
                        }
                    },
                    default: (tag) => {
                        if (tag.comment) {
                            return (defaultValue = tag.comment.toString() || '')
                        }
                    },
                    internal: (tag) => (isInternal = true),
                });
                if (isInternal) {
                    continue;
                }
                if (!ts.isEnumMember(member) && member.type) {
                    type = member.type.getText();
                }
                const memberInfo: MemberInfo = {
                    fullText,
                    name,
                    description: this.restoreAtTokens(description),
                    type,
                    modifiers,
                };
                if (
                    ts.isMethodSignature(member) ||
                    ts.isMethodDeclaration(member) ||
                    ts.isConstructorDeclaration(member)
                ) {
                    parameters = member.parameters.map((p) => ({
                        name: p.name.getText(),
                        type: p.type ? p.type.getText() : '',
                        optional: !!p.questionToken,
                        initializer: p.initializer && p.initializer.getText(),
                    }));
                    result.push({
                        ...memberInfo,
                        kind: 'method',
                        parameters,
                    });
                } else {
                    result.push({
                        ...memberInfo,
                        kind: 'property',
                        defaultValue,
                    });
                }
            }
        }

        return result;
    }

    /**
     * 从接口中读取 @docsWeight JSDoc 标记
     */
    private getDeclarationWeight(statement: ValidDeclaration): number {
        let weight = 10;
        this.parseTags(statement, {
            docsWeight: (tag) => {
                if (tag.comment) {
                    return (weight = Number.parseInt(tag.comment.toString() || '10', 10))
                }
            },
        });
        return weight;
    }

    private getDocsPage(statement: ValidDeclaration): string | undefined {
        let docsPage: string | undefined;
        this.parseTags(statement, {
            docsPage: (tag) => {
                if (tag.comment) {
                    return (docsPage = tag.comment.toString())
                }
            },
        });
        return docsPage;
    }

    /**
     * 从接口中读取 @description JSDoc 标记
     */
    private getDeclarationDescription(statement: ValidDeclaration): string {
        let description = '';
        this.parseTags(statement, {
            description: (tag) => (description += tag.comment),
            example: (tag) => {
                if (tag.comment) {
                    return (description += this.formatExampleCode(tag.comment.toString()))
                }
            },
        });
        return this.restoreAtTokens(description);
    }

    /**
     * Extracts the "@docsCategory" value from the JSDoc comments if present.
     */
    private getDocsCategory(statement: ValidDeclaration): string | undefined {
        let category: string | undefined;
        this.parseTags(statement, {
            docsCategory: (tag) => {
                if (tag.comment) {
                    return (category = tag.comment.toString() || '')
                }
            },
        });
        return this.kebabCase(category);
    }

    /**
     * 文档生成器可以处理的语句类型的类型保护。
     */
    private isValidDeclaration(statement: ts.Statement): statement is ValidDeclaration {
        return (
            ts.isInterfaceDeclaration(statement) ||
            ts.isTypeAliasDeclaration(statement) ||
            ts.isClassDeclaration(statement) ||
            ts.isEnumDeclaration(statement) ||
            ts.isFunctionDeclaration(statement) ||
            ts.isVariableStatement(statement)
        );
    }

    /**
     * 解析 Node's JSDoc 标签，并针对任何匹配的标记名调用提供函数
     */
    private parseTags<T extends ts.Node>(
        node: T,
        tagMatcher: { [tagName: string]: (tag: ts.JSDocTag) => void },
    ): void {
        const jsDocTags = ts.getJSDocTags(node);
        for (const tag of jsDocTags) {
            const tagName = tag.tagName.text;
            if (tagMatcher[tagName]) {
                tagMatcher[tagName](tag);
            }
        }
    }

    /**
     * 确保所有代码示例者使用 unix-style 风格的行分隔符。
     */
    private formatExampleCode(example: string = ''): string {
        return '\n\n*Example*\n\n' + example.replace(/\r/g, '\n');
    }

    private kebabCase<T extends string | undefined>(input: T): T {
        if (input == null) {
            return input;
        }
        return input
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase() as T;
    }

    /**
     * TypeScript v3.5.1 版本开始会将标记注释中的所有 '@' 标记解释为一个新 tag。这是一个问题：
     * 比如当一个插件在它的描述中包含一些广西，如 "install @picker-cc/some-plugin 包"。在这里，
     * TypeScript 会将 "@picker-cc" 解释为 JSDoc tag，并从注释中删除它和所有剩余的文本。
     *
     * 解决方案是用一个替换字段串替换所有转义的 @ 标记 ("\@")，以便 TypeScript 处理它们作为常规的注释文本，
     * 然后一旦它解析了语句，我们就用 "@" 字符替换它们。
     */
    private replaceEscapedAtTokens(content: string): string {
        return content.replace(/\\@/g, this.atTokenPlaceholder);
    }

    /**
     * 恢复被 replaceEscapedAtTokens() 方法替换的 "@" 标记。
     */
    private restoreAtTokens(content: string): string {
        return content.replace(new RegExp(this.atTokenPlaceholder, 'g'), '@');
    }
}
