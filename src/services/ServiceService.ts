import { ApiService } from './ApiService';

export enum ServiceStatus {
  Free = 'Free',
  Using = 'Using',
}

export interface ServiceHistoryResponse {
  id: number;
  serviceId: number;
  startedByUserId: number;
  startedByUserName: string;
  startedByUserPhone: string;
  endedByUserId?: number;
  endedByUserName?: string;
  evidenceImageBase64: string;
  startedAt: string;
  endedAt?: string;
}

export interface ServiceResponse {
  id: number;
  name: string;
  imageBase64: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceDetailResponse extends ServiceResponse {
  history: ServiceHistoryResponse[];
}

export interface CreateServiceRequest {
  name: string;
  imageBase64: string;
}

export interface UpdateServiceRequest {
  name?: string;
  imageBase64?: string;
  status?: ServiceStatus;
  evidenceImageBase64?: string;
  userId?: number;
}

export interface AdminUpdateServiceRequest {
  name?: string;
  imageBase64?: string;
  userId: number;
}

export class ServiceService extends ApiService {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  base: string = 'Service';

  async getServices(): Promise<ServiceResponse[]> {
    return this.get<ServiceResponse[]>(this.base);
  }

  async getServiceDetail(id: number): Promise<ServiceDetailResponse> {
    return this.get<ServiceDetailResponse>(`${this.base}/${id}`);
  }

  async createService(request: CreateServiceRequest): Promise<ServiceResponse> {
    return this.post<ServiceResponse>(`${this.base}`, request);
  }

  async updateService(id: number, request: UpdateServiceRequest): Promise<ServiceResponse> {
    return this.put<ServiceResponse>(`${this.base}/${id}`, request);
  }

  async adminUpdateService(id: number, request: AdminUpdateServiceRequest): Promise<ServiceResponse> {
    return this.put<ServiceResponse>(`${this.base}/${id}/admin`, request);
  }

  async deleteService(id: number): Promise<void> {
    return this.delete(`${this.base}/${id}`);
  }
}
