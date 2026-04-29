import { request } from './client';
import { Paginated, Warehouse } from './types';

export async function listWarehouses(): Promise<Warehouse[]> {
  const res = await request<Paginated<Warehouse>>('/api/warehouses', {
    method: 'GET',
    query: { limit: 100 },
  });
  return res.data;
}
