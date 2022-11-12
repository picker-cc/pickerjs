import { EventBus } from '../../event-bus';
import { PickerContext } from './picker-context';
import { BaseItem } from './next-fields';

type GraphQLInput = Record<string, any>;

export interface BaseListTypeInfo {
  key: string;
  fields: string;
  item: BaseItem;
  inputs: {
    create: GraphQLInput;
    update: GraphQLInput;
    where: GraphQLInput;
    uniqueWhere: { readonly id?: string | null } & GraphQLInput;
    orderBy: Record<string, 'asc' | 'desc' | null>;
  };
  /**
   * WARNING: may be renamed in patch
   */
  prisma: {
    create: Record<string, any>;
    update: Record<string, any>;
  };
  injector?: any;
  eventBus?: EventBus;
  all: BasePickerTypeInfo;
}

export type BaseModelTypeInfo = BaseListTypeInfo;

export type PickerContextFromListTypeInfo<ListTypeInfo extends BaseListTypeInfo> = PickerContext<ListTypeInfo['all']>;

export interface BasePickerTypeInfo {
  lists: Record<string, BaseListTypeInfo>;
  prisma: any;
}
