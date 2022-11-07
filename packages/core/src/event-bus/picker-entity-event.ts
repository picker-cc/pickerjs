import { RequestContext } from '../api';
import { PickerEvent } from './picker-event';


/**
 * @description
 * EventBus 系统使用的所有实体事件的基类
 * * 对于事件类型 `'updated'` 的实体是应用补丁之前的实体（如果没有其他文档说明）
 * * 对于事件类型 `'deleted'` 输入很可能是 `id: ID`
 * @docsCategory events
 * */
export abstract class PickerEntityEvent<Entity, Input = any> extends PickerEvent {
    public readonly entity: Entity;
    public readonly type: 'created' | 'updated' | 'deleted';
    public readonly ctx: RequestContext;
    public readonly input?: Input;

    protected constructor(
        entity: Entity,
        type: 'created' | 'updated' | 'deleted',
        ctx: RequestContext,
        input?: Input,
    ) {
        super();
        this.entity = entity;
        this.type = type;
        this.ctx = ctx;
        this.input = input;
    }
}
