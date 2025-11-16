import { api } from "./api";

type ListingResponse = {
  id: number;
  title: string;
  description: string;
  carbonAmount: string | number;
  price: string | number;
  status: "OPEN" | "DRAFT" | "CLOSED" | "SOLD" | string;
  createdAt: string;
  sellerId: number;
  sellerName?: string;
  sellerEmail?: string;
};

type PaginatedResponse<T> = {
  content?: T[];
};

export type Listing = {
  id: string;
  name: string;
  location: string;
  pricePerCredit: number;
  totalCredits: number;
  availableCredits: number;
  status: "ACTIVE" | "SOLD_OUT" | "DRAFT";
  certification: string;
  vintageYear: number;
  createdAt: string;
  updatedAt: string;
  summary: string;
  category: string;
};

function mapListing(response: ListingResponse): Listing {
  const price = Number(response.price ?? 0);
  const carbonAmount = Number(response.carbonAmount ?? 0);
  return {
    id: String(response.id),
    name: response.title ?? "Listing",
    location: response.sellerName ?? "Unknown location",
    pricePerCredit: price,
    totalCredits: carbonAmount,
    availableCredits: carbonAmount,
    status: response.status === "OPEN" ? "ACTIVE" : "DRAFT",
    certification: "Verified",
    vintageYear: new Date(response.createdAt ?? Date.now()).getFullYear(),
    createdAt: response.createdAt ?? new Date().toISOString(),
    updatedAt: response.createdAt ?? new Date().toISOString(),
    summary: response.description ?? "",
    category: "Carbon Credit"
  };
}

export const listingService = {
  async getListings() {
    const { data } = await api.get<PaginatedResponse<ListingResponse>>(
      "/listings/open",
      {
        params: { page: 0, size: 50 }
      }
    );
    const items = data?.content ?? [];
    return items.map(mapListing);
  },

  async getById(id: string) {
    const { data } = await api.get<ListingResponse>(`/listings/${id}`);
    return mapListing(data);
  }
};

