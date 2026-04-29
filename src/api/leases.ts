import { request } from './client';
import { Paginated, Lease } from './types';

export async function listLeases(companyId?: string): Promise<Lease[]> {
  const res = await request<Paginated<Lease>>('/api/leases', {
    method: 'GET',
    query: { limit: 100, company: companyId },
  });
  return res.data;
}
