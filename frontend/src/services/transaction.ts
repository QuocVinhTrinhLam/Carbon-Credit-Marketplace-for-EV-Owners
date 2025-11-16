import { api } from "./api";

type TransactionResponse = {
  id: number;
  buyerId?: number;
  sellerId?: number;
  listingId?: number;
  listingTitle?: string;
  amount?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt?: string;
};

export type Transaction = {
  id: string;
  listingId: string;
  listingName: string;
  type: "BUY" | "SELL";
  quantity: number;
  pricePerCredit: number;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
};

const mapTransaction = (tx: TransactionResponse, userId: string): Transaction => {
  const isBuyer = String(tx.buyerId ?? "") === userId;
  const amount = Number(tx.amount ?? 0);
  const status =
    tx.status === "COMPLETED"
      ? "COMPLETED"
      : tx.status === "CANCELLED"
        ? "FAILED"
        : "PENDING";

  return {
    id: String(tx.id ?? `temp-${Date.now()}`),
    listingId: String(tx.listingId ?? ""),
    listingName: tx.listingTitle ?? "Listing",
    type: isBuyer ? "BUY" : "SELL",
    quantity: 1,
    pricePerCredit: amount,
    totalAmount: amount,
    status,
    createdAt: tx.createdAt ?? new Date().toISOString()
  };
};

export const transactionService = {
  async getTransactions(userId: string) {
    const { data } = await api.get<TransactionResponse[]>(`/transactions/mine`, {
      params: { userId }
    });
    return (data ?? []).map((tx) => mapTransaction(tx, userId));
  },

  async buy(payload: { listingId: string; buyerId: string; quantity?: number }) {
    const { data } = await api.post<TransactionResponse>("/transactions", {
      listingId: Number(payload.listingId),
      buyerId: Number(payload.buyerId)
    });
    return mapTransaction(data, payload.buyerId);
  }
};
