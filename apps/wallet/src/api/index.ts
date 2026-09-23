import * as client from './client';
import * as mock from './mock';

const useMocks = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true';

export const api = useMocks ? mock : client;

export type ApiClient = typeof client;
