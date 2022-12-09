import { AuthTokenRedemptionErrorCode } from '../types';

// eslint-disable-next-line consistent-return
export function getAuthTokenErrorMessage({ code }: { code: AuthTokenRedemptionErrorCode }): string {
  // eslint-disable-next-line default-case
  switch (code) {
    case 'FAILURE':
      return 'Auth token redemption failed.';
    case 'TOKEN_EXPIRED':
      return 'The auth token provided has expired.';
    case 'TOKEN_REDEEMED':
      return 'Auth tokens are single use and the auth token provided has already been redeemed.';
  }
}
