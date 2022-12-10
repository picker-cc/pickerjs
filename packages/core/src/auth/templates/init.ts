import { AuthConfig } from '../types';
import { BaseListTypeInfo } from '../../schema/types';

type InitTemplateArgs = {
  listKey: string;
  initFirstItem: NonNullable<AuthConfig<BaseListTypeInfo>['initFirstItem']>;
};

export const initTemplate = ({ listKey, initFirstItem }: InitTemplateArgs) => {
  // -- TEMPLATE START
  return `import { getInitPage } from '@pickerjs/auth/pages/InitPage';

const fieldPaths = ${JSON.stringify(initFirstItem.fields)};

export default getInitPage(${JSON.stringify({
    listKey,
    fieldPaths: initFirstItem.fields,
    enableWelcome: !initFirstItem.skipPickerWelcome
  })});
`;
  // -- TEMPLATE END
};
