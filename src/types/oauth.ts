export interface AuthorizedOAuthApp {
  id: string;
  clientId: string;
  name: string | null;
  uri: string | null;
  scopes: string[];
  createdAt: string;
}

export interface NewOAuthClient {
  name: string;
  redirectUris: string[];
  confidential: boolean;
  scopes: string[];
}

export interface OAuthClientCredentials {
  client_id: string;
  client_secret?: string;
}
