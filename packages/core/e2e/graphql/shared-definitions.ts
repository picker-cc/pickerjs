import gql from 'graphql-tag';
import {CURRENT_USER_FRAGMENT, USER_FRAGMENT} from "./fragments";

export const ME = gql `
   query Me {
       me {
           ...User
       }
   }
   ${USER_FRAGMENT}
`

export const ATTEMPT_LOGIN = gql`
    mutation AttemptLogin($username: String!, $password: String!, $rememberMe: Boolean) {
        login(username: $username, password: $password, rememberMe: $rememberMe) {
            ...CurrentUser
        }
    }
    ${CURRENT_USER_FRAGMENT}
`;
