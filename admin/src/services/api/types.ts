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

export interface Question {
  _id: string;
  themeId: string;
  questionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  _id: string;
  statement: string;
  themeId: string;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionWithProblems extends Question {
  relatedProblems?: Problem[];
}
