export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  thumbnailUrl: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY_CURRENT_USER = 'mock_current_user_session';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://holographic-blog-backend.vercel.app/api';
const API_BASE = `${BASE_URL}/admin`;

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    } catch (e) {
      console.error('Error parsing session for auth headers:', e);
    }
  }
  return headers;
};

// ==========================================
// CATEGORIES CRUD API
// ==========================================

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

export const createCategory = async (name: string): Promise<Category> => {
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create category');
  }

  return response.json();
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update category');
  }

  return response.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete category');
  }
};

// ==========================================
// ARTICLES CRUD API
// ==========================================

export const getArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${API_BASE}/articles`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
};

export const getArticleById = async (id: string): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'ไม่พบบทความที่ระบุ');
  }
  return response.json();
};

export const createArticle = async (
  title: string, 
  content: string, 
  category: string, 
  thumbnailUrl: string, 
  status: 'draft' | 'published',
  author: string
): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, category, thumbnailUrl, status, author }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create article');
  }

  return response.json();
};

export const updateArticle = async (
  id: string,
  title: string, 
  content: string, 
  category: string, 
  thumbnailUrl: string, 
  status: 'draft' | 'published'
): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, category, thumbnailUrl, status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update article');
  }

  return response.json();
};

export const deleteArticle = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete article');
  }
};

