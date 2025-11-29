import { API_BASE_URL } from '../apiUrl';
import { api } from '../apiService';
import { AxiosError } from 'axios';

export interface DashboardMetrics {
  activeCards: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  missingReferrals: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  totalOffers: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  hiddenOffers: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface ChartDataPoint {
  month: string;
  added: number;
  updated: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  time: string;
  createdAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  chartData: ChartDataPoint[];
  recentActivities: RecentActivity[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
  statusCode: number;
}

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  try {
    const response = await api.get<DashboardResponse>(
      `${API_BASE_URL}/cards/dashboard/stats`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch dashboard stats'
    );
  }
};

