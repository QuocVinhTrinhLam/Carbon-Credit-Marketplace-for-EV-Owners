import { api } from "./api";

export type CreateVnpayTopupRequest = {
  userId: number;
  amount: number; // VND
};

export type CreateVnpayTopupResponse = {
  success: boolean;
  paymentUrl: string;
  message?: string;
  error?: string;
};

export type VnpayReturnParams = {
  success: boolean;
  txnRef: string;
  amount: string;
  status: string;
  message: string;
};

export const paymentService = {
  /**
   * Tạo payment URL để redirect sang VNPay
   */
  async createVnpayTopup(
    userId: number,
    amount: number
  ): Promise<string> {
    try {
      const { data } = await api.post<CreateVnpayTopupResponse>(
        "/payment/vnpay/create",
        {
          userId,
          amount
        }
      );

      if (!data.success || !data.paymentUrl) {
        throw new Error(data.error || data.message || "Failed to create payment");
      }

      return data.paymentUrl;
    } catch (error: any) {
      // Extract detailed error message from response
      const errorData = error.response?.data;
      if (errorData) {
        const errorMsg = errorData.error || errorData.message || "Failed to create payment";
        const hint = errorData.hint ? `\n\n${errorData.hint}` : "";
        throw new Error(errorMsg + hint);
      }
      throw error;
    }
  },

  /**
   * Xác thực return params từ VNPay (optional, có thể xử lý trực tiếp trên frontend)
   */
  async verifyVnpayReturn(
    queryParams: URLSearchParams
  ): Promise<VnpayReturnParams> {
    const { data } = await api.get<VnpayReturnParams>("/payment/vnpay/return", {
      params: Object.fromEntries(queryParams.entries())
    });
    return data;
  }
};

