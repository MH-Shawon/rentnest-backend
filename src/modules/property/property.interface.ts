export interface IPropertyQuery {
  searchTerm?: string;

  location?: string;
  category?: string;
  landlordId?: string;

  minPrice?: string;
  maxPrice?: string;

  isAvailable?: string;

  page?: string;
  limit?: string;

  sortBy?: "price" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface IIdParams {
  id: string;
}