export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: UserRole;
  preferredLang: string;
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; total?: number };
  error: null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
