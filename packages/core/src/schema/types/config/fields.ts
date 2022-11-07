import { CacheHint } from 'apollo-server-types';
import {BaseListTypeInfo, PickerContextFromListTypeInfo} from '../type-info';
import { MaybeItemFunction, MaybeSessionFunction } from './lists';
import { FieldHooks } from './hooks';
import { FieldAccessControl } from '../../core/access-control';
import {FieldTypeFunc} from "../next-fields";
import {MaybePromise} from "../utils";

export type BaseFields<ListTypeInfo extends BaseListTypeInfo> = {
    [key: string]: FieldTypeFunc<ListTypeInfo>;
};

export type FilterOrderArgs<ListTypeInfo extends BaseListTypeInfo> = {
    context: PickerContextFromListTypeInfo<ListTypeInfo>;
    session: PickerContextFromListTypeInfo<ListTypeInfo>['session'];
    listKey: string;
    fieldKey: string;
};
export type CommonFieldConfig<ListTypeInfo extends BaseListTypeInfo> = {
    access?: FieldAccessControl<ListTypeInfo>;
    hooks?: FieldHooks<ListTypeInfo>;
    label?: string;
    ui?: {
        description?: string;
        views?: string;
        createView?: { fieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo> };
        itemView?: { fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ListTypeInfo> };
        listView?: { fieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo> };
    };
    graphql?: {
        cacheHint?: CacheHint;
        // Setting any of these values will remove the corresponding input/output types from the GraphQL schema.
        // Output Types
        //   'read': Does this field exist on the Item type? Will also disable filtering/ordering/admimMeta
        // Input Types
        //   'create': Does this field exist in the create Input type?
        //   'update': Does this field exist in the update Input type?
        //
        // If `true` then the field will be completely removed from all types.
        //
        // Default: undefined
        omit?: true | readonly ('read' | 'create' | 'update')[];
    };
    // Disabled by default...
    isFilterable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>);
    isOrderable?: boolean | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>);
};
