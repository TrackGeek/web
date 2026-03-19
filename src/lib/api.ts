import axios from "axios";
import { DEFAULT_LANGUAGE, LANGUAGE_TOKEN } from "./i18n/config";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-TrackGeek-Language": window?.localStorage?.getItem(LANGUAGE_TOKEN) ?? DEFAULT_LANGUAGE,
    "X-TrackGeek-Version": "1.0.0",
  },
});

export namespace ApiTypes {
  export type PaymentFrequency = "Monthly" | "OneTime";

  export interface PriceValue {
    raw: number;
    formatted: string;
    currency: string;
  }

  export interface Price {
    id: string;
    productId: string;
    value: {
      converted: PriceValue;
      original: PriceValue;
    };
  }

  export type Perk = Price & {
    name: string;
  };

  export interface GetPricesResponse {
    prices: Price[];
  }

  export interface GetPerksResponse {
    perks: Perk[];
  }

  export interface CreatePaymentRequest {
    frequency: PaymentFrequency;
    value: number;
  }

  export interface CreatePaymentResponse {
    payment: {
      id: string;
      url: string;
    };
  }

  export interface GetCurrentSubscriptionResponse {
    subscription: {
      id: string;
      status: string;
      renewsAt: string;
      product: {
        id: string;
        name: string;
      };
      price: PriceValue;
    };
  }

  export interface GetCurrencyResponse {
    currency: string;
  }

  export type PaymentStatus = "Pending" | "Succeeded" | "Failed";

  export interface Payment {
    id: string;
    name: string;
    value: number;
    currency: string;
    status: PaymentStatus;
    frequency: PaymentFrequency;
    stripeInvoiceUrl: string | null;
    stripeCheckoutSessionUrl: string;
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string;
    stripeCustomerId: string;
    stripeProductId: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile: {
        id: string;
        avatarUrl: string | null;
      };
    };
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface PaginatedResponse<T> {
    total: number;
    count: number;
    pages: number;
    inPage: number;
    itemsInPage: number;
    itemsPerPage: number;
    items: T[];
  }

  export interface GetPaymentsResponse {
    payments: PaginatedResponse<Payment>;
  }

  export interface GetPaymentDetailsResponse {
    payment: Payment;
  }
}

export const apiEndpoints = {
  getCurrency: "/stripe/currency",
  getPrices: "/stripe/price",
  getPerks: "/perk",
  getCurrentSubscription: "/stripe/subscription",
  cancelCurrentSubscription: "/stripe/subscription",
  createPayment: "/payment",
  getPayments: "/payment",
  getPaymentDetails: (id: string) => `/payment/detail/${id}`,
  updateProfileAvatar: "/profile/avatar",
  deleteProfileAvatar: "/profile/avatar",
  updateProfileBanner: "/profile/banner",
  deleteProfileBanner: "/profile/banner",
};
