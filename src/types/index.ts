export interface Platform {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  platformId: string;
  platform: Platform;
  categoryId: string;
  category: Category;
  status: 'NOT_STARTED' | 'COMPLETED';
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface GeneratedIdea {
  id: string;
  content: string;
  suggestedPlatformId: string | null;
  suggestedPlatform: Platform | null;
  suggestedCategoryId: string | null;
  suggestedCategory: Category | null;
  isAccepted: boolean;
  createdAt: Date;
}
