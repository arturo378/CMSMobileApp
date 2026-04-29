import { request } from './client';
import { ShippingPaper, ShippingChemical } from './types';

export interface CreateShippingPaperBody {
  createdBy: string;
  originwarehousenumber: string;
  destinationwarehousenumber: string;
  trucknumber?: string;
  gps?: string;
  comments?: string;
  date: string;
  active: 0 | 1;
}

export async function createShippingPaper(body: CreateShippingPaperBody): Promise<ShippingPaper> {
  return request<ShippingPaper>('/api/shipping-papers', {
    method: 'POST',
    body,
  });
}

export async function updateShippingPaper(id: string, patch: Partial<ShippingPaper>): Promise<ShippingPaper> {
  return request<ShippingPaper>(`/api/shipping-papers/${id}`, {
    method: 'PUT',
    body: patch,
  });
}

export async function addShippingChemical(
  shippingPaper: string,
  chemical: string,
  quantity: number
): Promise<ShippingChemical> {
  return request<ShippingChemical>('/api/shipping-chemicals', {
    method: 'POST',
    body: { shippingPaper, chemical, quantity },
  });
}
