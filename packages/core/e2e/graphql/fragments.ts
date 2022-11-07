import gql from 'graphql-tag';

export const ADMINISTRATOR_FRAGMENT = gql`
    fragment Administrator on Administrator {
        id
        emailAddress
        name
        user {
            id
            identifier
            roles {
                code
                description
                permissions
            }
        }
    }
`;
export const ASSET_FRAGMENT = gql`
    fragment Asset on Asset {
        id
        name
        fileSize
        mimeType
        type
        preview
        source
    }
`;

// export const CURRENT_USER_FRAGMENT = gql`
//     fragment User on User {
//         id
//         identifier
//     }
// `;
export const USER_FRAGMENT = gql`
    fragment User on User {
        id
        identifier
    }
`;
export const CURRENT_USER_FRAGMENT = gql`
    fragment CurrentUser on CurrentUser {
        id
        identifier
    }
`;
