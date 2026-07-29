export interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
}

export interface Post {
  id: number | string;
  image: string;
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  likes: number;
  likedBy?: string[];
  content: string;
}

export interface GetPostsResponse {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  posts: Post[];
  nextPage: number | null;
}

export interface CommentItem {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface NotificationApiItem {
  id: string;
  recipientId: string;
  senderName: string;
  type: 'like' | 'comment' | 'article';
  articleId?: string;
  articleTitle?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const STORAGE_KEY_CURRENT_USER = 'mock_current_user_session';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://holographic-blog-backend.vercel.app/api';
const API_BASE = `${BASE_URL}/posts`;

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

export async function getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
  const url = new URL(API_BASE);
  if (params.page) url.searchParams.append('page', params.page.toString());
  if (params.limit) url.searchParams.append('limit', params.limit.toString());
  if (params.category) url.searchParams.append('category', params.category);
  if (params.keyword) url.searchParams.append('keyword', params.keyword);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch posts from backend');
  }
  return response.json();
}

export async function getPost(postId: string | number): Promise<Post> {
  const response = await fetch(`${API_BASE}/${postId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'ไม่พบบทความนี้ในระบบ');
  }
  return response.json();
}

export async function toggleLike(postId: string | number): Promise<{ likes: number; isLiked: boolean; likedBy: string[] }> {
  const response = await fetch(`${API_BASE}/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to toggle like');
  }

  return response.json();
}

export async function getComments(postId: string | number): Promise<CommentItem[]> {
  const response = await fetch(`${API_BASE}/${postId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
}

export async function createComment(postId: string | number, content: string): Promise<CommentItem> {
  const response = await fetch(`${API_BASE}/${postId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to post comment');
  }

  return response.json();
}

export async function deleteComment(postId: string | number, commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete comment');
  }
}

export async function getNotifications(): Promise<NotificationApiItem[]> {
  const response = await fetch(`${API_BASE}/notifications/user`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
}
