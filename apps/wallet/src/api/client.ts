import {
  API_ROUTES,
  type CreateHolderRequest,
  type CreateHolderResponse,
  type CreateShareRequest,
  type CreateShareResponse,
  type GetShareResponse,
  type IssueCredentialRequest,
  type IssueCredentialResponse,
  type ListHolderCredentialsResponse,
  type RevokeCredentialRequest,
  type RevokeCredentialResponse,
  type VerifyCredentialRequest,
  type VerifyCredentialResponse,
} from '@mi-billetera/shared';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function resolveRoute(route: string, params?: Record<string, string>): string {
  let path = route;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }
  return `${baseUrl}${path}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createHolder(
  body: CreateHolderRequest,
): Promise<CreateHolderResponse> {
  return request<CreateHolderResponse>(resolveRoute(API_ROUTES.holders), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listHolderCredentials(
  holderId: string,
): Promise<ListHolderCredentialsResponse> {
  return request<ListHolderCredentialsResponse>(
    resolveRoute(API_ROUTES.holderCredentials, { id: holderId }),
  );
}

export async function issueCredential(
  body: IssueCredentialRequest,
): Promise<IssueCredentialResponse> {
  return request<IssueCredentialResponse>(
    resolveRoute(API_ROUTES.issueCredential),
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function verifyCredential(
  body: VerifyCredentialRequest,
): Promise<VerifyCredentialResponse> {
  return request<VerifyCredentialResponse>(
    resolveRoute(API_ROUTES.verifyCredential),
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function revokeCredential(
  body: RevokeCredentialRequest,
): Promise<RevokeCredentialResponse> {
  return request<RevokeCredentialResponse>(
    resolveRoute(API_ROUTES.revokeCredential),
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function createShare(
  body: CreateShareRequest,
): Promise<CreateShareResponse> {
  return request<CreateShareResponse>(resolveRoute(API_ROUTES.shares), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getShare(token: string): Promise<GetShareResponse> {
  return request<GetShareResponse>(
    resolveRoute(API_ROUTES.getShare, { token }),
  );
}
