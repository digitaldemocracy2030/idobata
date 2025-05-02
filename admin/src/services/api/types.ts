export interface Theme {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateThemePayload {
  title: string;
  description?: string;
  slug: string;
  isActive?: boolean;
}

export interface UpdateThemePayload {
  title?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface SiteConfig {
  _id: string;
  title: string;
  aboutMessage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSiteConfigPayload {
  title: string;
  aboutMessage: string;
}

export interface VectorSearchResult {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  similarity: number;
}

export interface VectorSearchParams {
  queryText: string;
  itemType: "problem" | "solution";
  k?: number;
}

export interface ClusteringParams {
  itemType: "problem" | "solution";
  method?: "kmeans" | "hierarchical";
  params?: {
    n_clusters: number;
  };
}

export interface ClusterItem {
  id: string;
  text: string;
}

export interface Cluster {
  id: number;
  items: ClusterItem[];
}

export interface ClusteringResult {
  clusters: Cluster[];
}
