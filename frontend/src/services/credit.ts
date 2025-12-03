import { api } from "./api";

export type CreditCertificate = {
  id: string;
  ownerId: string | number;
  projectName: string;
  quantity: number;
  amount?: number;
  certification: string;
  certificationBody?: string;
  serialNumber?: string;
  notes?: string;
  issuedDate: string;
  expiresAt: string;
  status: "VALID" | "EXPIRED" | "EXPIRING_SOON" | "PENDING";
  certificateType: "ISSUED" | "REQUESTED";
};

export const creditService = {
  async getPortfolio(userId: string) {
    try {
      const { data } = await api.get<CreditCertificate[]>(
        `/certificates/user/${userId}`
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
  ,
  async requestCertificate(payload: {
    ownerId: number | string;
    amount: number;
    projectName?: string;
    certificationRef?: string;
    certificationBody?: string;
    serialNumber?: string;
    notes?: string;
  }) {
    try {
      const { data } = await api.post(`/certificates/request`, payload);
      return data;
    } catch (error) {
      console.warn("request certificate endpoint not available", error);
      throw error;
    }
  },
  async adminIssueCertificate(ownerId: number | string, payload: { amount: number; projectName?: string; certificationRef?: string; certificationBody?: string; serialNumber?: string; notes?: string }) {
    try {
      const { data } = await api.post(`/admin/certificates/${ownerId}/issue`, payload);
      return data;
    } catch (error) {
      console.warn("admin issue certificate endpoint not available", error);
      throw error;
    }
  },

  async getPendingCertificates() {
    try {
      const { data } = await api.get<CreditCertificate[]>(`/admin/certificates/pending`);
      return data;
    } catch (error) {
      console.warn("get pending certificates endpoint not available", error);
      return [];
    }
  },

  async approveCertificate(certificateId: number | string) {
    try {
      const { data } = await api.post(`/admin/certificates/${certificateId}/approve`);
      return data;
    } catch (error) {
      console.warn("approve certificate endpoint not available", error);
      throw error;
    }
  },

  async rejectCertificate(certificateId: number | string) {
    try {
      const { data } = await api.post(`/admin/certificates/${certificateId}/reject`);
      return data;
    } catch (error) {
      console.warn("reject certificate endpoint not available", error);
      throw error;
    }
  }
};
