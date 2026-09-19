import Medusa from '@medusajs/js-sdk';

export const backendUrl = __BACKEND_URL__ ?? '/';
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? '';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('medusa_auth_token') || '';
};

const decodeJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];

    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 < Date.now();
};

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey: publishableApiKey
});

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== 'undefined') {
  (window as any).__sdk = sdk;
}

export const importProductsQuery = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const currentToken = getAuthToken();

  const response = await fetch(`${backendUrl}/vendor/products/import`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(currentToken ? { authorization: `Bearer ${currentToken}` } : {}),
      'x-publishable-api-key': publishableApiKey
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Product import failed');
  }

  return response.json();
};

export const uploadFilesQuery = async (files: any[]) => {
  const formData = new FormData();

  for (const { file } of files) {
    formData.append('files', file);
  }

  const currentToken = getAuthToken();

  const response = await fetch(`${backendUrl}/vendor/uploads`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(currentToken ? { authorization: `Bearer ${currentToken}` } : {}),
      'x-publishable-api-key': publishableApiKey
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      if (isTokenExpired(currentToken)) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('medusa_auth_token');
          window.location.href = '/login?reason=Unauthorized';
        }
      }
    }
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchQuery = async (
  url: string,
  {
    method,
    body,
    query,
    headers
  }: {
    method: 'GET' | 'POST' | 'DELETE';
    body?: object;
    query?: Record<string, string | number | object>;
    headers?: { [key: string]: string };
  }
) => {
  const bearer = getAuthToken();
  const params = Object.entries(query || {}).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        // Send arrays as multiple query parameters with bracket notation
        // This allows backends to parse them as arrays: status[]=draft&status[]=published
        const arrayParams = value
          .map(item => `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`)
          .join('&');
        if (acc) {
          acc += '&' + arrayParams;
        } else {
          acc = arrayParams;
        }
      } else {
        const separator = acc ? '&' : '';
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        acc += `${separator}${encodeURIComponent(key)}=${encodeURIComponent(serializedValue)}`;
      }
    }
    return acc;
  }, '');
  const response = await fetch(`${backendUrl}${url}${params && `?${params}`}`, {
    method: method,
    headers: {
      ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      'Content-Type': 'application/json',
      'x-publishable-api-key': publishableApiKey,
      ...headers
    },
    body: body ? JSON.stringify(body) : null,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      if (isTokenExpired(bearer)) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('medusa_auth_token');
          window.location.href = '/login?reason=Unauthorized';
        }
        return;
      }

      throw {
        type: 'NO_PERMISSION',
        message: errorData.message || 'Unauthorized'
      };
    }

    const error = new Error(errorData.message || 'Server error');
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  return response.json();
};
