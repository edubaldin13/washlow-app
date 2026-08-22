import { ApiService } from './ApiService';

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LoginUserRequest {
  email: string;
}

export class UserService extends ApiService {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  base: string = 'Users';

  async register(request: CreateUserRequest): Promise<UserResponse> {
    return this.post<UserResponse>(this.base, request);
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    return this.post<UserResponse>(`${this.base}/login`, request);
  }

  async getUserById(id: number): Promise<UserResponse> {
    return this.get<UserResponse>(`${this.base}/${id}`);
  }
}
