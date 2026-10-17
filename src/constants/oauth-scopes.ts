export const OAUTH_SCOPE_LABELS: Record<string, string> = {
  openid: "auth:oauth.scopes.openid",
  profile: "auth:oauth.scopes.profile",
  offline_access: "auth:oauth.scopes.offline_access",
  "profile:read": "auth:oauth.scopes.profileRead",
  "library:read": "auth:oauth.scopes.libraryRead",
  "progress:write": "auth:oauth.scopes.progressWrite",
};

export const OAUTH_DEVELOPER_SCOPES = Object.keys(OAUTH_SCOPE_LABELS);
