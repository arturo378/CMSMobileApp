import { request } from './client';
import { Paginated, WarehouseChemical } from './types';

export async function listByWarehouse(warehouseId: string): Promise<WarehouseChemical[]> {
  const res = await request<Paginated<WarehouseChemical>>('/api/warehouse-chemicals', {
    method: 'GET',
    query: { warehouse: warehouseId, limit: 100 },
  });
  return res.data;
}

export async function updateQuantity(id: string, quantity: number): Promise<WarehouseChemical> {
  return request<WarehouseChemical>(`/api/warehouse-chemicals/${id}`, {
    method: 'PUT',
    body: { quantity },
  });
}

export async function createWarehouseChemical(
  warehouse: string,
  chemical: string,
  quantity: number
): Promise<WarehouseChemical> {
  return request<WarehouseChemical>('/api/warehouse-chemicals', {
    method: 'POST',
    body: { warehouse, chemical, quantity },
  });
}
