import { request } from './client';
import { Paginated, Chemical } from './types';

export async function listChemicals(): Promise<Chemical[]> {
  const res = await request<Paginated<Chemical>>('/api/chemicals', {
    method: 'GET',
    query: { limit: 100 },
  });
  return res.data;
}
