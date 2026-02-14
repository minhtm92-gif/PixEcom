export interface TokenPayload {
  sub: string;
  email: string;
  isSuperadmin: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isSuperadmin: boolean;
}
