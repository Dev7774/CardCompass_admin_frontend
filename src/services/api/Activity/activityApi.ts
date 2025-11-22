import { ACTIVITY_LOG_URL } from '../apiUrl';
import { api } from '../apiService';
import { AxiosError } from 'axios';

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  adminId?: string;
  entityType?: string;
  action?: string;
  search?: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: any;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ActivityLogResponse {
  success: boolean;
  message: string;
  data: {
    data: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  statusCode: number;
}

export const getActivityLogs = async (
  filters: ActivityLogFilters = {}
): Promise<ActivityLogResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.adminId) params.append('adminId', filters.adminId);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.action) params.append('action', filters.action);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get<ActivityLogResponse>(
      `${ACTIVITY_LOG_URL}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch activity logs'
    );
  }
};

