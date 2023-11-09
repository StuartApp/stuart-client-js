declare class Environment {
  static SANDBOX(): string;
  static PRODUCTION(): string;
}

declare class Authenticator {
  constructor(
    environment: string,
    apiClientId: string,
    apiClientSecret: string
  );
  getAccessToken(): Promise<any>;
}

declare class ApiResponse {
  constructor(statusCode: any, body: any, headers: any);
  success(): boolean;
}

declare class HttpClient {
  constructor(authenticator: any);
  performGet(resource: any, params?: any): Promise<any>;
  performPost(resource: any, body: any): Promise<any>;
  url(resource: any): any;
  defaultHeaders(accessToken: any): {
    Authorization: string;
    "User-Agent": string;
    "Content-Type": string;
  };
}

export { Environment, Authenticator, ApiResponse, HttpClient };
