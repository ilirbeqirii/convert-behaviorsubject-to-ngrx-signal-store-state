export interface AuthInfoModel {
  username: string | null;
  accessToken: string;
  accessTokenValidTo: string;
  id: number;
  refreshToken: string;
  refreshTokenValidTo: string;
  mfaToken: boolean;
  role: any;
  tokenIssuanceTime: number;
  tokenValidityDuration: number;
  rememberMe: boolean;
}
