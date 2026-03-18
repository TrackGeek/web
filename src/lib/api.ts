import axios from "axios";
import { DEFAULT_LANGUAGE, LANGUAGE_TOKEN } from './i18n/config';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-TrackGeek-Language": window?.localStorage?.getItem(LANGUAGE_TOKEN) ?? DEFAULT_LANGUAGE,
    "X-TrackGeek-Version": "1.0.0",
    "X-TrackGeek-Platform": "web",
    "X-TrackGeek-Source": "website",
    "X-TrackGeek-UTM": new URLSearchParams(window.location.search).get("utm_source") ?? "direct",
  }
});

export namespace ApiTypes {
  export type PaymentType = "Donate" | "Perk";
  
  export type PaymentFrequency = "Monthly" | "OneTime";
  
  export interface Product {
    id: string;
    title: string;
    enum: string;
    description: string;
    imageUrl: string | null;
    prices: {
      id: string;
      frequency: PaymentFrequency;
      value: {
        raw: number;
        formatted: string;
        currency: string;
        discount: {
          promotionCodeId: string;
          discountedRaw: number;
          discountedFormatted: string;
          percentage: number | null;
        } | null;
      };
    }[]
  }
  
  export interface GetProductsResponse {
    products: Product[];
  }
  
  export interface CreatePaymentRequest {
    type: PaymentType;
    productId: string;
    priceId?: string;
    frequency?: PaymentFrequency;
    value?: number;
  }
  
  export interface CreatePaymentResponse {
    payment: {
      id: string;
      url: string;
    }
  }
  
  export interface GetCurrentSubscriptionResponse {
    subscription: {
      id: string;
      status: string;
      renewsAt: string;
      product: Product;
      price: {
        raw: number;
        formatted: string;
        currency: string;
      }
    };
  }
  
  export interface Payment {
    id: string;
    name: string;
    subtotalValue: number;
    discountValue: number | null;
    totalValue: number;
    currency: string;
    status: "Pending" | "Succeeded" | "Failed";
    frequency: PaymentFrequency;
    stripeInvoiceUrl: string | null;
    stripePaymentIntentId: string | null;
    stripePromotionCodeId: string | null;
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
    }
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

  export interface GetPaymentDetailResponse {
    payment: Payment;
  }
}

export const apiEndpoints = {
  getProducts: "/stripe/product",
  getCurrentSubscription: "/stripe/subscription",
  cancelCurrentSubscription: "/stripe/subscription",
  createPayment: "/payment",
  getPayments: "/payment",
  getPaymentByCheckoutSessionId: (checkoutSessionId: string) => `/payment/detail/${checkoutSessionId}`,
  updateProfileAvatar: "/profile/avatar",
  deleteProfileAvatar: "/profile/avatar",
  updateProfileBanner: "/profile/banner",
  deleteProfileBanner: "/profile/banner",
};
