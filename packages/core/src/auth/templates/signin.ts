import { AuthGqlNames } from '../types';

export const signinTemplate = ({
  gqlNames,
  identityField,
  secretField
}: {
  gqlNames: AuthGqlNames;
  identityField: string;
  secretField: string;
}) => {
  // -- TEMPLATE START
  return `import { getSigninPage } from '@pickerjs/auth/pages/SigninPage'

export default getSigninPage(${JSON.stringify({
    identityField,
    secretField,
    mutationName: gqlNames.authenticateItemWithPassword,
    successTypename: gqlNames.ItemAuthenticationWithPasswordSuccess,
    failureTypename: gqlNames.ItemAuthenticationWithPasswordFailure
  })});
`;
  // -- TEMPLATE END
};
