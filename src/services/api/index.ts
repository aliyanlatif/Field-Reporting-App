import { API_BASE_URL } from '../../config';
import { createApiClient } from './client';

export { createApiClient } from './client';
export const api = createApiClient({ baseUrl: API_BASE_URL });
