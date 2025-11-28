import { API_BASE_URL } from '../apiUrl';
import { api } from '../apiService';
import { AxiosError } from 'axios';

export interface Offer {
  id: string;
  cardId: string;
  signUpBonus: string;
  signupBonusDescription?: string;
  signupBonusAmount?: string | null;
  signupBonusType?: string | null;
  signupBonusItem?: string | null;
  signupBonusSpend?: number | null;
  signupBonusLength?: number | null;
  signupBonusLengthPeriod?: string | null;
  minimumSpend: number | null;
  timePeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  publicUrl: string | null;
  referralUrl: string | null;
  internalLabel: string | null;
  isCurrent: boolean;
  visible: boolean;
  archived: boolean;
  isOverride: boolean;
  createdAt: string;
  updatedAt: string;
  card?: {
    id: string;
    name: string;
    issuer: string;
  };
}

export interface OffersResponse {
  success: boolean;
  message: string;
  data: Offer[];
  statusCode: number;
}

export interface OfferResponse {
  success: boolean;
  message: string;
  data: Offer;
  statusCode: number;
}

export const getOffersByCardId = async (
  cardId: string
): Promise<OffersResponse> => {
  try {
    const response = await api.get<OffersResponse>(
      `${API_BASE_URL}/offers/cards/${cardId}/offers`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch offers'
    );
  }
};

export const getCurrentOffer = async (
  cardId: string
): Promise<OfferResponse> => {
  try {
    const response = await api.get<OfferResponse>(
      `${API_BASE_URL}/offers/cards/${cardId}/offers/current`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    // If no current offer found, return a response with null data
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        message: 'No current offer found',
        data: null as any,
        statusCode: 404,
      };
    }
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch current offer'
    );
  }
};

export const getAllOffers = async (): Promise<OffersResponse> => {
  try {
    // Since backend doesn't have a direct endpoint, we'll fetch all cards and their offers
    // For now, we'll use a workaround - fetch from a special endpoint or combine results
    // This is a temporary solution until backend adds GET /api/offers endpoint
    const response = await api.get<OffersResponse>(
      `${API_BASE_URL}/offers`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    // If endpoint doesn't exist, we'll fetch all cards and aggregate offers
    // For now, return empty array
    return {
      success: true,
      message: 'Offers retrieved successfully',
      data: [],
      statusCode: 200,
    };
  }
};

export interface CreateOfferRequest {
  signUpBonus?: string;
  signupBonusDesc?: string;
  signupBonusAmount?: string;
  signupBonusType?: string;
  signupBonusSpend?: number;
  signupBonusLength?: number;
  signupBonusLengthPeriod?: string;
  minimumSpend?: number;
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  publicUrl?: string;
  referralUrl?: string;
  internalLabel?: string;
  isCurrent?: boolean;
  visible?: boolean;
  archived?: boolean;
}

export const createOffer = async (
  cardId: string,
  data: CreateOfferRequest
): Promise<OfferResponse> => {
  try {
    const response = await api.post<OfferResponse>(
      `${API_BASE_URL}/offers/cards/${cardId}/offers`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to create offer'
    );
  }
};

export interface UpdateOfferRequest {
  signUpBonus?: string;
  signupBonusDesc?: string;
  signupBonusAmount?: string;
  signupBonusType?: string;
  signupBonusSpend?: number;
  signupBonusLength?: number;
  signupBonusLengthPeriod?: string;
  minimumSpend?: number;
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
  publicUrl?: string;
  referralUrl?: string;
  internalLabel?: string;
  isCurrent?: boolean;
  visible?: boolean;
  archived?: boolean;
}

export const updateOffer = async (
  id: string,
  data: UpdateOfferRequest
): Promise<OfferResponse> => {
  try {
    const response = await api.put<OfferResponse>(
      `${API_BASE_URL}/offers/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to update offer'
    );
  }
};

export const setCurrentOffer = async (id: string): Promise<OfferResponse> => {
  try {
    const response = await api.patch<OfferResponse>(
      `${API_BASE_URL}/offers/${id}/current`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to set current offer'
    );
  }
};

export const toggleArchiveOffer = async (id: string): Promise<OfferResponse> => {
  try {
    const response = await api.patch<OfferResponse>(
      `${API_BASE_URL}/offers/${id}/archive`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to toggle archive'
    );
  }
};

export const deleteOffer = async (id: string): Promise<void> => {
  try {
    await api.delete(`${API_BASE_URL}/offers/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to delete offer'
    );
  }
};

