import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { EventBus } from '../../event-bus';
import { Injector } from '../../common';
import { InitialisedList } from '../types-for-lists';
import { GqlNames } from './utils';
import { BaseListTypeInfo, BasePickerTypeInfo } from './type-info';
import { SessionStrategy } from './session';

export type PickerContext<TypeInfo extends BasePickerTypeInfo = BasePickerTypeInfo> = {
  req?: IncomingMessage;
  res?: ServerResponse;
  db: PickerDbAPI<TypeInfo['lists']>;
  query: PickerListsAPI<TypeInfo['lists']>;
  graphql: PickerGraphQLAPI;
  sudo: () => PickerContext<TypeInfo>;
  exitSudo: () => PickerContext<TypeInfo>;
  withSession: (session: any) => PickerContext<TypeInfo>;
  withRequest: (req: IncomingMessage, res?: ServerResponse) => Promise<PickerContext<TypeInfo>>;
  prisma: TypeInfo['prisma'];
  eventBus?: EventBus;
  injector?: Injector;
  services?: any;
  files?: FilesContext;
  images?: ImagesContext;
  // totalResults: number;
  // maxTotalResults: number;
  /** @deprecated */
  gqlNames: (listKey: string) => GqlNames;
  experimental?: {
    /** @deprecated This value is only available if you have config.experimental.contextInitialisedLists = true.
     * This is not a stable API and may contain breaking changes in `patch` level releases.
     */
    initialisedLists: Record<string, InitialisedList>;
  };
  sessionStrategy?: SessionStrategy<any>;
  session?: any;
};

// List item API

// eslint-disable-next-line no-warning-comments
// TODO: Work out whether we can generate useful return types based on the GraphQL Query
// passed to List API functions (see `readonly Record<string, any>` below)

export type PickerListsAPI<PickerListsTypeInfo extends Record<string, BaseListTypeInfo>> = {
  [Key in keyof PickerListsTypeInfo]: {
    findMany(
      args?: {
        readonly where?: PickerListsTypeInfo[Key]['inputs']['where'];
        readonly take?: number;
        readonly skip?: number;
        readonly orderBy?:
          | PickerListsTypeInfo[Key]['inputs']['orderBy']
          | readonly PickerListsTypeInfo[Key]['inputs']['orderBy'][];
      } & ResolveFields
    ): Promise<readonly Record<string, any>[]>;
    findOne(
      args: {
        readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
      } & ResolveFields
    ): Promise<Record<string, any>>;
    count(args?: { readonly where?: PickerListsTypeInfo[Key]['inputs']['where'] }): Promise<number>;
    updateOne(
      args: {
        readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
        readonly data: PickerListsTypeInfo[Key]['inputs']['update'];
      } & ResolveFields
    ): Promise<Record<string, any>>;
    updateMany(
      args: {
        readonly data: readonly {
          readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
          readonly data: PickerListsTypeInfo[Key]['inputs']['update'];
        }[];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    createOne(
      args: { readonly data: PickerListsTypeInfo[Key]['inputs']['create'] } & ResolveFields
    ): Promise<Record<string, any>>;
    createMany(
      args: {
        readonly data: readonly PickerListsTypeInfo[Key]['inputs']['create'][];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    deleteOne(
      args: {
        readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
      } & ResolveFields
    ): Promise<Record<string, any> | null>;
    deleteMany(
      args: {
        readonly where: readonly PickerListsTypeInfo[Key]['inputs']['uniqueWhere'][];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
  };
};

interface ResolveFields {
  /**
   * @default 'id'
   */
  readonly query?: string;
}

export type PickerDbAPI<PickerListsTypeInfo extends Record<string, BaseListTypeInfo>> = {
  [Key in keyof PickerListsTypeInfo]: {
    findMany(args?: {
      readonly where?: PickerListsTypeInfo[Key]['inputs']['where'];
      readonly take?: number;
      readonly skip?: number;
      readonly orderBy?:
        | PickerListsTypeInfo[Key]['inputs']['orderBy']
        | readonly PickerListsTypeInfo[Key]['inputs']['orderBy'][];
    }): Promise<readonly PickerListsTypeInfo[Key]['item'][]>;
    findOne(args: {
      readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<PickerListsTypeInfo[Key]['item'] | null>;
    count(args?: { readonly where?: PickerListsTypeInfo[Key]['inputs']['where'] }): Promise<number>;
    updateOne(args: {
      readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
      readonly data: PickerListsTypeInfo[Key]['inputs']['update'];
    }): Promise<PickerListsTypeInfo[Key]['item']>;
    updateMany(args: {
      readonly data: readonly {
        readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
        readonly data: PickerListsTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<PickerListsTypeInfo[Key]['item'][]>;
    createOne(args: {
      readonly data: PickerListsTypeInfo[Key]['inputs']['create'];
    }): Promise<PickerListsTypeInfo[Key]['item']>;
    createMany(args: {
      readonly data: readonly PickerListsTypeInfo[Key]['inputs']['create'][];
    }): Promise<PickerListsTypeInfo[Key]['item'][]>;
    deleteOne(args: {
      readonly where: PickerListsTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<PickerListsTypeInfo[Key]['item']>;
    deleteMany(args: {
      readonly where: readonly PickerListsTypeInfo[Key]['inputs']['uniqueWhere'][];
    }): Promise<PickerListsTypeInfo[Key]['item'][]>;
  };
};

// GraphQL API
type GraphQLExecutionArguments<TData, TVariables> = {
  query: string | DocumentNode | TypedDocumentNode<TData, TVariables>;
  variables?: TVariables;
};
export interface PickerGraphQLAPI {
  schema: GraphQLSchema;
  // run: (args: GraphQLExecutionArguments) => Promise<Record<string, any>>;
  // raw: (args: GraphQLExecutionArguments) => Promise<ExecutionResult>;
  run: <TData, TVariables extends Record<string, any>>(
    args: GraphQLExecutionArguments<TData, TVariables>
  ) => Promise<TData>;
  raw: <TData, TVariables extends Record<string, any>>(
    args: GraphQLExecutionArguments<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>;
}

// Session API

export interface SessionContext<T> {
  // 注意:如果你使用 Picker 的内置会话实现，session是这样键入的，以确认默认的会话形状，但我们实际上不知道它会是什么样子。
  session?: { itemId: string; listKey: string; data?: Record<string, any> } | any;
  startSession(data: T): Promise<string>;
  endSession(): Promise<void>;
}

export type AssetMode = 'local' | 's3' | 'ali';

// Files API

export interface FileMetadata {
  filename: string;
  filesize: number;
}

export type FileData = {
  filename: string;
} & FileMetadata;

export type FilesContext = (storage: string) => {
  getUrl: (filename: string) => Promise<string>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<FileData>;
  deleteAtSource: (filename: string) => Promise<void>;
};

// Images API

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif';

export interface ImageMetadata {
  extension: ImageExtension;
  filesize: number;
  width: number;
  height: number;
}

export type ImageData = {
  id: string;
} & ImageMetadata;

export type ImagesContext = (storage: string) => {
  getUrl: (id: string, extension: ImageExtension) => Promise<string>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<ImageData>;
  deleteAtSource: (id: string, extension: ImageExtension) => Promise<void>;
};
