import { PickerEvent, RequestContext } from '@pickerjs/core';
// import {publish} from "rxjs";
// import { UserCreateInput } from '.picker/types'
// import {} from '.picker/types'
export class UserEvent extends PickerEvent {
  constructor(
    public type: 'created' | 'updated' | 'deleted' | 'login',
    public ctx: RequestContext,
    public user: any // public bookmark: BookmarkCreateInput | BookmarkUpdateInput
  ) {
    super();
  }
}
