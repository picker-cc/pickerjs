import {Injectable, OnModuleDestroy} from '@nestjs/common';
import {Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {PickerEvent} from './picker-event';
import {Type} from "@picker-cc/common/lib/shared-types";

export type EventHandler<T extends PickerEvent> = (event: T) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export class EventBus implements OnModuleDestroy {
  private subscriberMap = new Map<Type<PickerEvent>, Array<EventHandler<any>>>();
  private eventStream = new Subject<PickerEvent>();
  private destroy$ = new Subject<any>();

  /**
   * @description
   * 发布任何订阅者都可以响应的事件。
   * @param event
   */
  publish<T extends PickerEvent>(event: T): void {
    const eventType = (event as any).constructor;
    const handlers = this.subscriberMap.get(eventType);
    if (handlers) {
      const length = handlers.length;
      for (let i = 0; i < length; i++) {
        handlers[i](event);
      }
    }
    this.eventStream.next(event);
  }

  /**
   * @description
   * 返回给定类型的RxJS可观察事件流。
   */
  ofType<T extends PickerEvent>(type: Type<T>): Observable<T> {
    return this.eventStream.asObservable().pipe(
      takeUntil(this.destroy$),
      filter(e => (e as any).constructor === type),
    ) as Observable<T>;
  }

  // /**
  //  * @description
  //  * Deprecated: use `ofType()` instead.
  //  *
  //  * 订阅给定的事件类型。返回一个可以使用的退订函数
  //  * 取消订阅事件的处理程序。
  //  *
  //  * @deprecated
  //  */
  // subscribe<T extends PickerEvent>(type: Type<T>, handler: EventHandler<T>): UnsubscribeFn {
  //   const handlers = this.subscriberMap.get(type) || [];
  //   if (!handlers.includes(handler)) {
  //     handlers.push(handler);
  //   }
  //   this.subscriberMap.set(type, handlers);
  //   return () => this.subscriberMap.set(type, handlers.filters(h => h !== handler));
  // }

  /** @internal */
  onModuleDestroy(): any {
    this.destroy$.next({});
  }
}
