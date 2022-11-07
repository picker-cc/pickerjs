import {BaseListTypeInfo, PickerContextFromListTypeInfo} from '../type-info';
import {MaybePromise} from "../utils";

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: PickerContextFromListTypeInfo<ListTypeInfo>;
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: string;
};

// 列表钩子
export type ListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   * 用于在应用默认值和访问控制后，**修改用于创建和更新操作的输入**
   */
  resolveInput?: ResolveInputListHook<ListTypeInfo>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   * 用于在所有resolveInput钩子解析后**验证创建和更新操作的输入**
   */
  validateInput?: ValidateInputHook<ListTypeInfo>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<ListTypeInfo>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationHook<ListTypeInfo>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationHook<ListTypeInfo>;
};

// TODO: probably maybe don't do this and write it out manually
// (this is also incorrect because the return value is wrong for many of them)
type AddFieldPathToObj<T extends (arg: any) => any> = T extends (args: infer Args) => infer Result
  ? (args: Args & { fieldKey: string }) => Result
  : never;

type AddFieldPathArgToAllPropsOnObj<T extends Record<string, (arg: any) => any>> = {
  [Key in keyof T]: AddFieldPathToObj<T[Key]>;
};

type FieldKeysForList<ListTypeInfo extends BaseListTypeInfo> =
  | keyof ListTypeInfo['prisma']['create']
  | keyof ListTypeInfo['prisma']['update'];

export type FieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends FieldKeysForList<ListTypeInfo> = FieldKeysForList<ListTypeInfo>
> = AddFieldPathArgToAllPropsOnObj<{
  /**
   * 用于**modified input** 在应用默认值和访问控制后的创建和更新操作
   */
  resolveInput?: ResolveInputFieldHook<ListTypeInfo, FieldKey>;
  /**
   * 用于所有在 resolveInput 钩子解析后 **validate 和更新操作的 input**
   */
  validateInput?: ValidateInputHook<ListTypeInfo>;
  /**
   * 用于 **validate** 在访问控制发生后可以进行删除操作
   */
  validateDelete?: ValidateDeleteHook<ListTypeInfo>;
  /**
   * 用于在所有 validateInput 钩子都解析后，在创建、更新或删除操作之前 **cause side effects ** 发生作用
   */
  beforeOperation?: BeforeOperationHook<ListTypeInfo>;
  /**
   * 用于在创建、更新或删除操作发生后 "cause side effects ** 发生作用
   */
  afterOperation?: AfterOperationHook<ListTypeInfo>;
}>;

type ArgsForCreateOrUpdateOperation<ListTypeInfo extends BaseListTypeInfo> =
  | {
      operation: 'create';
      // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
    // 从技术上讲，创建的时候不会有这个选项但把它设为可选而不是不设，会给用户带来更好的体验因为这样人们就会看到正确的类型即使他们还没有细化创建的操作类型
      item?: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       * 应用在 **before** 默认值之前的 GraphQL Input
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    }
  | {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };

type ResolveInputListHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ListTypeInfo> & CommonArgs<ListTypeInfo>
) => MaybePromise<ListTypeInfo['prisma']['create'] | ListTypeInfo['prisma']['update']>;

type ResolveInputFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends FieldKeysForList<ListTypeInfo>
> = (args: ArgsForCreateOrUpdateOperation<ListTypeInfo> & CommonArgs<ListTypeInfo>) => MaybePromise<
  | ListTypeInfo['prisma']['create'][FieldKey]
  | ListTypeInfo['prisma']['update'][FieldKey]
  | undefined // undefined represents 'don't do anything'
>;

type ValidateInputHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ListTypeInfo> & {
    addValidationError: (error: string) => void;
  } & CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type ValidateDeleteHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: {
    operation: 'delete';
    item: ListTypeInfo['item'];
    addValidationError: (error: string) => void;
  } & CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type BeforeOperationHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ListTypeInfo>
    | {
        operation: 'delete';
        item: ListTypeInfo['item'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type AfterOperationHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ListTypeInfo>
    | {
        operation: 'delete';
        // technically this will never actually exist for a delete
        // but making it optional rather than not here
        // makes for a better experience
        // because then people will see the right type even if they haven't refined the type of operation to 'delete'
        item: undefined;
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    ({ operation: 'delete' } | { operation: 'create' | 'update'; item: ListTypeInfo['item'] }) &
    (
      | // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      { operation: 'create'; originalItem: undefined }
      | { operation: 'delete' | 'update'; originalItem: ListTypeInfo['item'] }
    ) &
    CommonArgs<ListTypeInfo>
) => Promise<void> | void;
