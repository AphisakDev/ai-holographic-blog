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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = `${BASE_URL}/posts`;

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

