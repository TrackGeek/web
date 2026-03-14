import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export namespace ApiTypes {
  export type PaymentFrequency = "Monthly" | "OneTime";
  
  export interface Product {
    id: string;
    title: string;
    name: string;
    description: string;
    imageUrl: string | null;
    prices: {
      id: string;
      frequency: PaymentFrequency;
      value: {
        raw: number;
        formatted: string;
      };
    }[]
  }
  
  export interface GetProductsResponse {
    products: Product[];
  }
  
  export interface CreatePerkPaymentRequest {
    priceId: string;
    productId: string;
    frequency: PaymentFrequency;
  }
  
  export interface CreatePerkPaymentResponse {
    payment: {
      id: string;
      url: string;
    }
  }
  
  export interface CreateDonatePaymentRequest {
    value: number;
    productId: string;
  }
  
  export interface CreateDonatePaymentResponse {
    payment: {
      id: string;
      url: string;
    }
  }
}

export const apiEndpoints = {
  getProducts: "/stripe/product",
  createPerkPayment: "/payment/perk",
  createDonatePayment: "/payment/donate",
  updateProfileAvatar: "/profile/avatar",
  deleteProfileAvatar: "/profile/avatar",
  updateProfileBanner: "/profile/banner",
  deleteProfileBanner: "/profile/banner",
};
