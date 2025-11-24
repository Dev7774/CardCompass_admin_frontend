import { API_BASE_URL } from '../apiUrl';
import { api } from '../apiService';
import { AxiosError } from 'axios';

export interface CardFilters {
  page?: number;
  limit?: number;
  search?: string;
  issuer?: string;
  active?: boolean | string;
  featured?: boolean | string;
  network?: string;
  cardType?: string;
}

export interface Card {
  id: string;
  apiCardId: string;
  name: string;
  issuer: string;
  network: string | null;
  annualFee: number | null;
  rewards: string | null;
  purchaseAPR: string | null;
  balanceTransferAPR: string | null;
  creditScore: string | null;
  cardType: string | null;
  active: boolean;
  featured: boolean;
  lastApiSync: string | null;
  apiData: any;
  createdAt: string;
  updatedAt: string;
  currentOffer?: {
    signUpBonus: string | null;
    referralUrl: string | null;
  } | null;
  hasReferralLink?: boolean;
}

export interface CardsResponse {
  success: boolean;
  message: string;
  data: {
    data: Card[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  statusCode: number;
}

export const getCards = async (
  filters: CardFilters = {}
): Promise<CardsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.issuer) params.append('issuer', filters.issuer);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.network) params.append('network', filters.network);
    if (filters.cardType) params.append('cardType', filters.cardType);

    const response = await api.get<CardsResponse>(
      `${API_BASE_URL}/cards?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch cards'
    );
  }
};

export interface CardResponse {
  success: boolean;
  message: string;
  data: Card;
  statusCode: number;
}

export const getCardById = async (id: string): Promise<CardResponse> => {
  try {
    const response = await api.get<CardResponse>(
      `${API_BASE_URL}/cards/${id}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to fetch card'
    );
  }
};

export interface ApiCard {
  cardKey: string;
  cardName: string;
  cardIssuer: string;
  existsInDb?: boolean;
  cardId?: string | null;
  [key: string]: any;
}

export interface SearchApiCardsResponse {
  success: boolean;
  message: string;
  data: {
    cards: ApiCard[];
    count: number;
    searchTerm: string;
  };
  statusCode: number;
}

export const searchApiCards = async (
  search: string = ''
): Promise<SearchApiCardsResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await api.get<SearchApiCardsResponse>(
      `${API_BASE_URL}/cards/api/search?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to search API cards'
    );
  }
};

export interface Benefit {
  benefitTitle: string;
  benefitDesc?: string | null;
}

export interface EarnMultiplier {
  spendBonusCategoryGroup?: string | null;
  spendBonusSubcategoryGroup?: string | null;
  spendBonusCategoryName?: string | null;
  earnMultiplier?: number | null;
  spendBonusDesc?: string | null;
  isDateLimit?: boolean;
  limitBeginDate?: string | null;
  limitEndDate?: string | null;
  isSpendLimit?: boolean;
  spendLimit?: number | null;
  spendLimitResetPeriod?: string | null;
}

export interface AnnualSpendPerk {
  annualSpendDesc: string;
}

export interface CreateCardRequest {
  apiCardId: string;
  cardType?: string;
  active?: boolean;
  featured?: boolean;
}

export interface CreateManualCardRequest {
  cardKey?: string;
  cardName: string;
  cardIssuer: string;
  cardNetwork?: string | null;
  cardType?: string | null;
  cardUrl?: string | null;
  annualFee?: number | null;
  creditRange?: string | null;
  rewardsDescription?: string | null;
  introApr?: string | null;
  regularApr?: string | null;
  active?: boolean;
  featured?: boolean;
  internalNotes?: string | null;
  hasNoFxFee?: boolean;
  hasLoungeAccess?: boolean;
  hasFreeNight?: boolean;
  hasFreeCheckedBag?: boolean;
  hasTrustedTravelerCredit?: boolean;
  benefits?: Benefit[];
  earnMultipliers?: EarnMultiplier[];
  annualSpendPerks?: AnnualSpendPerk[];
}

export interface CreateCardResponse {
  success: boolean;
  message: string;
  data: Card;
  statusCode: number;
}

export const createCard = async (
  data: CreateCardRequest
): Promise<CreateCardResponse> => {
  try {
    const response = await api.post<CreateCardResponse>(
      `${API_BASE_URL}/cards`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to create card'
    );
  }
};

export interface UpdateCardRequest {
  cardName?: string;
  cardIssuer?: string;
  cardNetwork?: string | null;
  cardType?: string | null;
  cardUrl?: string | null;
  annualFee?: number | null;
  creditRange?: string | null;
  rewardsDescription?: string | null;
  introApr?: string | null;
  regularApr?: string | null;
  active?: boolean;
  featured?: boolean;
  internalNotes?: string | null;
  hasNoFxFee?: boolean;
  hasLoungeAccess?: boolean;
  hasFreeNight?: boolean;
  hasFreeCheckedBag?: boolean;
  hasTrustedTravelerCredit?: boolean;
  benefits?: Benefit[];
  earnMultipliers?: EarnMultiplier[];
  annualSpendPerks?: AnnualSpendPerk[];
}

export interface UpdateCardResponse {
  success: boolean;
  message: string;
  data: Card;
  statusCode: number;
}

export const createManualCard = async (
  data: CreateManualCardRequest
): Promise<CreateCardResponse> => {
  try {
    const response = await api.post<CreateCardResponse>(
      `${API_BASE_URL}/cards/manual`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to create card'
    );
  }
};

export const updateCard = async (
  id: string,
  data: UpdateCardRequest
): Promise<UpdateCardResponse> => {
  try {
    const response = await api.put<UpdateCardResponse>(
      `${API_BASE_URL}/cards/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || 'Failed to update card'
    );
  }
};

