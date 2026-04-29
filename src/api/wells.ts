import { request } from './client';
import { Paginated, Well } from './types';

export async function listWells(leaseId?: string): Promise<Well[]> {
  const res = await request<Paginated<Well>>('/api/wells', {
    method: 'GET',
    query: { limit: 100, lease: leaseId },
  });
  return res.data;
}
