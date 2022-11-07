import FormData from 'form-data';
import fs from 'fs';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import fetch, { RequestInit, Response } from 'node-fetch';
import { stringify } from 'querystring';

import { QueryParams } from './types';
import {PickerConfig} from "@picker-cc/core";
import {SUPER_ADMIN_USER_IDENTIFIER, SUPER_ADMIN_USER_PASSWORD} from "@picker-cc/common/lib/shared-constants";
import { createUploadPostData } from './utils/create-upload-post-data';

const LOGIN = gql`
    mutation($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            ... on CurrentUser {
                id
                identifier
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`;

// tslint:disable:no-console
/**
 * @description
 * 一个用于填充和查询测试数据的简单 GraphQL Client
 *
 * @docsCategory testing
 */
export class SimpleGraphQLClient {
    private authToken: string;
    private channelToken: string | null = null;
    private headers: { [key: string]: any } = {};

    constructor(private pickerConfig: Required<PickerConfig>, private apiUrl: string = '') {}

    /**
     * @description
     * 设置要在每个GraphQL请求中使用的authToken。
     */
    setAuthToken(token: string) {
        this.authToken = token;
        this.headers.Authorization = `Bearer ${this.authToken}`;
    }

    // /**
    //  * @description
    //  * Sets the authToken to be used in each GraphQL request.
    //  */
    // setChannelToken(token: string | null) {
    //     this.channelToken = token;
        // if (this.pickerConfig.apiOptions.channelTokenKey) {
        //     this.headers[this.pickerConfig.apiOptions.channelTokenKey] = this.channelToken;
        // }
    // }

    /**
     * @description
     * 返回当前正在使用的authToken。
     */
    getAuthToken(): string {
        return this.authToken;
    }

    /**
     * @description
     * 执行 query 和 mutation 查询操作
     */
    async query<T = any, V = Record<string, any>>(
        query: DocumentNode,
        variables?: V,
        queryParams?: QueryParams,
    ): Promise<T> {
        const response = await this.makeGraphQlRequest(query, variables, queryParams);
        const result = await this.getResult(response);

        if (response.ok && !result.errors && result.data) {
            return result.data;
        } else {
            const errorResult = typeof result === 'string' ? { error: result } : result;
            throw new ClientError(
                { ...errorResult, status: response.status },
                { query: print(query), variables },
            );
        }
    }

    /**
     * @description
     * 对给定的 URL 执行一个原始 HTTP 请求，但也包括 authToken 的headers
     * 如果它们已被设置。用于测试非 non-GraphQL endpoints
     * 例如:使用 REST 插件中的 controllers
     */
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = { 'Content-Type': 'application/json', ...this.headers, ...options.headers };

        const response = await fetch(url, {
            ...options,
            headers,
        });
        const authToken = response.headers.get(this.pickerConfig.authOptions.authTokenHeaderKey || '');
        if (authToken != null) {
            this.setAuthToken(authToken);
        }
        return response;
    }

    /**
     * @description
     * 执行 query 或 mutation 并返回结果状态码
     */
    async queryStatus<T = any, V = Record<string, any>>(query: DocumentNode, variables?: V): Promise<number> {
        const response = await this.makeGraphQlRequest(query, variables);
        return response.status;
    }

    /**
     * @description
     * 尝试使用指定的凭据登录
     */
    async asUserWithCredentials(username: string, password: string) {
        // first log out as the current user
        if (this.authToken) {
            await this.query(
                gql`
                    mutation {
                        logout
                    }
                `,
            );
        }
        const result = await this.query(LOGIN, { username, password });
        console.log(result)
        // if (result.login.channels?.length === 1) {
        //     this.setChannelToken(result.login.channels[0].token);
        // }
        return result.login;
    }

    /**
     * @description
     * 以SuperAdmin用户登录。
     */
    async asSuperAdmin() {
        const { superadminCredentials } = this.pickerConfig.authOptions;
        await this.asUserWithCredentials(
            superadminCredentials?.identifier ?? SUPER_ADMIN_USER_IDENTIFIER,
            superadminCredentials?.password ?? SUPER_ADMIN_USER_PASSWORD,
        );
    }

    /**
     * @description
     * 注销登录，以便将客户端视为匿名用户
     */
    async asAnonymousUser() {
        await this.query(
            gql`
                mutation {
                    logout
                }
            `,
        );
    }

    private async makeGraphQlRequest(
        query: DocumentNode,
        variables?: { [key: string]: any },
        queryParams?: QueryParams,
    ): Promise<Response> {
        const queryString = print(query);
        const body = JSON.stringify({
            query: queryString,
            variables: variables ? variables : undefined,
        });

        const url = queryParams ? this.apiUrl + `?${stringify(queryParams)}` : this.apiUrl;
        console.log(body)

        return this.fetch(url, {
            method: 'POST',
            body,
        });
    }

    private async getResult(response: Response): Promise<any> {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.startsWith('application/json')) {
            return response.json();
        } else {
            return response.text();
        }
    }

    /**
     * @description
     * 使用 mutation 执行文件上传
     *
     * Upload spec: https://github.com/jaydenseric/graphql-multipart-request-spec
     * Discussion of issue: https://github.com/jaydenseric/apollo-upload-client/issues/32
     */
    async fileUploadMutation(options: {
        mutation: DocumentNode;
        filePaths: string[];
        mapVariables: (filePaths: string[]) => any;
    }): Promise<any> {
        const { mutation, filePaths, mapVariables } = options;

        const postData = createUploadPostData(mutation, filePaths, mapVariables);
        const body = new FormData();
        body.append('operations', JSON.stringify(postData.operations));
        body.append(
            'map',
            '{' +
                Object.entries(postData.map)
                    .map(([i, path]) => `"${i}":["${path}"]`)
                    .join(',') +
                '}',
        );
        for (const filePath of postData.filePaths) {
            const file = fs.readFileSync(filePath.file);
            body.append(filePath.name, file, { filename: filePath.file });
        }

        const result = await fetch(this.apiUrl, {
            method: 'POST',
            body,
            headers: {
                ...this.headers,
            },
        });

        const response: any = await result.json();
        if (response.errors && response.errors.length) {
            const error = response.errors[0];
            throw new Error(error.message);
        }
        return response.data;
    }
}

export class ClientError extends Error {
    constructor(public response: any, public request: any) {
        super(ClientError.extractMessage(response));
    }
    private static extractMessage(response: any): string {
        if (response.errors) {
            return response.errors[0].message;
        } else {
            return `GraphQL Error (Code: ${response.status})`;
        }
    }
}
