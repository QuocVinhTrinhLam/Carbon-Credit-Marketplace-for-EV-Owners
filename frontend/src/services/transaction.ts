import { api } from "./api";

type TransactionResponse = {
  id: number;
  buyerId?: number;
  sellerId?: number;
  listingId?: number;
  listingTitle?: string;
  amount?: number;
  quantity?: number;
  pricePerCredit?: number;
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
  const totalAmount = Number(tx.amount ?? 0);
  const quantity = Number(tx.quantity ?? 1);
  // prefer explicit pricePerCredit returned by backend; otherwise derive from total/quantity
  const pricePerCredit = Number(tx.pricePerCredit ?? (quantity > 0 ? totalAmount / quantity : totalAmount));
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
    quantity,
    pricePerCredit,
    totalAmount,
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

  async buy(payload: { listingId: string; buyerId: string; quantity?: number; pricePerCredit?: number }) {
    const body: any = {
      listingId: Number(payload.listingId),
      buyerId: Number(payload.buyerId)
    };
    if (payload.quantity !== undefined) body.quantity = Number(payload.quantity);
    if (payload.pricePerCredit !== undefined) body.pricePerCredit = Number(payload.pricePerCredit);

    const { data } = await api.post<TransactionResponse>("/transactions", body);

    const transactionId = data?.id;

    if (!transactionId) {
      throw new Error("Transaction could not be created");
    }

    const { data: confirmedTransaction } = await api.post<TransactionResponse>(
      `/transactions/${transactionId}/confirm`
    );

    return mapTransaction(confirmedTransaction ?? data, String(payload.buyerId));
  }
};
