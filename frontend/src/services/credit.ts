import { api } from "./api";

export type CreditCertificate = {
  id: string;
  projectName: string;
  quantity: number;
  certification: string;
  issuedDate: string;
  expiresAt: string;
  status: "VALID" | "EXPIRED" | "PENDING";
};

export const creditService = {
  async getPortfolio(userId: string) {
    try {
      const { data } = await api.get<CreditCertificate[]>(
        `/credits/portfolio/${userId}`
      );
      return data;
    } catch (error) {
      console.warn("credits portfolio endpoint not available", error);
      return [];
    }
  },

  async getCertificates() {
    try {
      const { data } = await api.get<CreditCertificate[]>(`/credits`);
      return data;
    } catch (error) {
      console.warn("credits list endpoint not available", error);
      return [];
    }
  }
  ,
  async createCredit(payload: Partial<CreditCertificate>) {
    try {
      const { data } = await api.post<CreditCertificate>(`/carbon-credits`, payload);
      return data;
    } catch (error) {
      console.warn("create credit endpoint not available", error);
      throw error;
    }
  }
};

