import { request } from './client';
import { Delivery, DeliveryChemical } from './types';

export interface CreateDeliveryBody {
  company: string;
  lease: string;
  well: string;
  createdBy: string;
  invoicenum?: string;
  gps?: string;
  comments?: string;
  date: string;
  active: 0 | 1;
}

export async function createDelivery(body: CreateDeliveryBody): Promise<Delivery> {
  return request<Delivery>('/api/deliveries', {
    method: 'POST',
    body,
  });
}

export async function addDeliveryChemical(
  delivery: string,
  chemical: string,
  quantity: number
): Promise<DeliveryChemical> {
  return request<DeliveryChemical>('/api/delivery-chemicals', {
    method: 'POST',
    body: { delivery, chemical, quantity },
  });
}
