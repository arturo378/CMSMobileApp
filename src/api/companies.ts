import { request } from './client';
import { Paginated, Company } from './types';

export async function listCompanies(): Promise<Company[]> {
  const res = await request<Paginated<Company>>('/api/companies', {
    method: 'GET',
    query: { limit: 100 },
  });
  return res.data;
}
