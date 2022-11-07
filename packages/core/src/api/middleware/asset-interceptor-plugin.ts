import {
    ApolloServerPlugin,
    BaseContext, GraphQLRequestContext, GraphQLRequestListener, GraphQLServerListener, GraphQLServiceContext
} from 'apollo-server-plugin-base';
import {DocumentNode, GraphQLNamedType, isUnionType} from 'graphql';

import {AssetStorageStrategy, ConfigService} from '../../config';
import {GraphqlValueTransformer} from '../common/graphql-value-transformer';

/**
 * 转换输出，以便通过{@link AssetStorageStrategy.toAbsoluteUrl} 运行任何资产实例。
 */
export class AssetInterceptorPlugin implements ApolloServerPlugin {
    private graphqlValueTransformer: GraphqlValueTransformer;
    private readonly toAbsoluteUrl: AssetStorageStrategy['toAbsoluteUrl'] | undefined;

    constructor(private configService: ConfigService) {
        const {assetOptions} = this.configService;
        if (assetOptions.assetStorageStrategy.toAbsoluteUrl) {
            this.toAbsoluteUrl = assetOptions.assetStorageStrategy.toAbsoluteUrl.bind(
                assetOptions.assetStorageStrategy,
            );
        }
    }

    // serverWillStart(service: GraphQLServiceContext) {
    //     this.graphqlValueTransformer = new GraphqlValueTransformer(service.schema);
    // }
    serverWillStart(service: GraphQLServiceContext): Promise<GraphQLServerListener | void> {
        return new Promise<GraphQLServerListener | void>(() => {
            this.graphqlValueTransformer = new GraphqlValueTransformer(service.schema);
        })
    }

    requestDidStart(requestContext: GraphQLRequestContext<BaseContext>): Promise<GraphQLRequestListener<BaseContext> | void> {
        return new Promise<GraphQLRequestListener<BaseContext> | void>(() => {
            return {
                willSendResponse: (requestContext: any) => {
                    const {document} = requestContext;
                    if (document) {
                        const data = requestContext.response.data;
                        const req = requestContext.context.req;
                        if (data) {
                            this.prefixAssetUrls(req, document, data);
                        }
                    }
                }
            }
        })
    }

    private prefixAssetUrls(request: any, document: DocumentNode, data: Record<string, any>) {
        const typeTree = this.graphqlValueTransformer.getOutputTypeTree(document);
        const toAbsoluteUrl = this.toAbsoluteUrl;
        if (!toAbsoluteUrl) {
            return;
        }
        this.graphqlValueTransformer.transformValues(typeTree, data, (value, type) => {
            // const isAssetType = type && type.name === 'Asset';
            if (!type) {
                return value
            }
            const isAssetType = this.isAssetType(type)
            const isUnionWithAssetType = isUnionType(type) && type.getTypes().find(t => this.isAssetType(t));
            if (isAssetType || isUnionWithAssetType) {
                if (value && !Array.isArray(value)) {
                    if (value.preview) {
                        value.preview = toAbsoluteUrl(request, value.preview);
                    }
                    if (value.source) {
                        value.source = toAbsoluteUrl(request, value.source);
                    }
                }
            }
            // if (isAssetType) {
            //     if (value && !Array.isArray(value)) {
            //         if (value.preview) {
            //             value.preview = toAbsoluteUrl(request, value.preview);
            //         }
            //         if (value.source) {
            //             value.source = toAbsoluteUrl(request, value.source);
            //         }
            //     }
            // }
            // const isSearchResultType = type && type.name === 'SearchResult';
            // if (isSearchResultType) {
            //     if (value && !Array.isArray(value)) {
            //         if (value.productAsset) {
            //             value.productAsset.preview = toAbsoluteUrl(request, value.productAsset.preview);
            //         }
            //         if (value.productVariantAsset) {
            //             value.productVariantAsset.preview = toAbsoluteUrl(
            //                 request,
            //                 value.productVariantAsset.preview,
            //             );
            //         }
            //     }
            // }
            return value;
        });
    }

    private isAssetType(type: GraphQLNamedType): boolean {
        const assetTypeNames = ['Asset', 'SearchResultAsset'];
        return assetTypeNames.includes(type.name);
    }
}
