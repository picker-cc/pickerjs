import {
    ApolloServerPlugin,
    BaseContext,
    GraphQLRequestContext,
    GraphQLRequestListener
} from 'apollo-server-plugin-base';
import {GraphQLError} from 'graphql';

import {I18nService} from '../../i18n/i18n.service';

/**
 * 这个插件拦截传出的响应，并翻译任何错误消息请求到当前语言
 */
export class TranslateErrorsPlugin implements ApolloServerPlugin {
    constructor(private readonly i18nService: I18nService) {
    }

    // requestDidStart(): GraphQLRequestListener {
    //     return {
    //         willSendResponse: requestContext => {
    //             const { errors, context } = requestContext;
    //             if (errors) {
    //                 (requestContext.response as any).errors = errors.map(err => {
    //                     return this.i18nService.translateError(context.req, err as GraphQLError) as any;
    //                 });
    //             }
    //         },
    //     };
    // }

    async requestDidStart(
        requestContext: GraphQLRequestContext<BaseContext>
    ): Promise<GraphQLRequestListener<BaseContext> | void> {
        const i18nService = this.i18nService
        return {
            async willSendResponse(requestContext) {
                const {errors, context} = requestContext;
                if (errors) {
                    (requestContext.response as any).errors = errors.map(err => {
                        return i18nService.translateError(context.req, err as GraphQLError) as any;
                    });
                }
            }
        }
        // return new Promise<GraphQLRequestListener<BaseContext> | void>(() => {
        //     return {
        //         willSendResponse: requestContext => {
        //             const { errors, context } = requestContext;
        //             console.log(errors)
        //             console.log(context)
        //             if (errors) {
        //                 (requestContext.response as any).errors = errors.map(err => {
        //                     return this.i18nService.translateError(context.req, err as GraphQLError) as any;
        //                 });
        //             }
        //             return
        //         }
        //     }
        // })
    }
}
