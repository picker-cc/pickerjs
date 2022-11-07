/**
 * @description
 * EventBus系统使用的所有事件的基类。
 *
 * @docsCategory events 事件
 */
export abstract class PickerEvent {
  public readonly createdAt: Date;

  protected constructor() {
    this.createdAt = new Date();
  }
}
