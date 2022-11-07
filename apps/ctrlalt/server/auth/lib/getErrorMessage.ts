import { AuthTokenRedemptionErrorCode } from '../types';

export function getAuthTokenErrorMessage({ code }: { code: AuthTokenRedemptionErrorCode }): string {
  switch (code) {
    case 'FAILURE':
      return '认证令牌赎回失败。';
    case 'TOKEN_EXPIRED':
      return '提供的认证令牌已过期。';
    case 'TOKEN_REDEEMED':
      return '认证令牌是一次性使用的，并且提供的认证令牌已经被赎回。';
  }
}
