// frontend/src/services/wallet.ts

import { api } from "./api";

export type WalletSummary = {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    lastUpdated: string;
};

export type WalletTransaction = {
    id: string;
    type: "TOP_UP" | "PURCHASE" | "SALE";
    amount: number;
    balanceAfter: number;
    description?: string;
    createdAt: string;
};

export type WalletBalanceResponse = {
    userId: number;
    carbonBalance?: number;
    balance?: number;
};

const parseBalance = (payload: WalletBalanceResponse) =>
    Number(payload.carbonBalance ?? payload.balance ?? 0);

export const walletService = {
    async getWallet(userId: string): Promise<WalletSummary> {
        const { data } = await api.get<WalletBalanceResponse>(
            `/wallet/${userId}/balance`
        );

        return {
            id: String(data.userId),
            userId: String(data.userId),
            balance: parseBalance(data),
            currency: "CO2e",
            lastUpdated: new Date().toISOString(),
        };
    },

    async getTransactions(userId: string): Promise<WalletTransaction[]> {
        const { data } = await api.get<any[]>(`/transactions/mine`, {
            params: { userId },
        });

        return (data ?? []).map((tx: any) => ({
            id: String(tx.id ?? `wallet-${Date.now()}`),
            type: String(tx.buyerId ?? "") === userId ? "PURCHASE" : "SALE",
            amount: Number(tx.amount ?? 0),
            balanceAfter: 0, // nếu BE chưa trả thì tạm để 0
            description: tx.listingTitle ?? "Transaction",
            createdAt: tx.createdAt ?? new Date().toISOString(),
        }));
    },

    // Demo topup (không qua VNPAY), dùng khi chọn Direct Credit
    async topUp(userId: string, amount: number): Promise<WalletSummary> {
        const { data } = await api.post<WalletBalanceResponse>(
            `/wallet/${userId}/credit`,
            null,
            {
                params: { amount },
            }
        );

        return {
            id: String(data.userId),
            userId: String(data.userId),
            balance: parseBalance(data),
            currency: "CO2e",
            lastUpdated: new Date().toISOString(),
        };
    },
};
