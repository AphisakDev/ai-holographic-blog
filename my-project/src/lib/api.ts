

import { blogPosts } from '../data/blogPosts';

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

const STORAGE_KEY_ARTICLES = 'mock_admin_articles';

export async function getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
  // จำลองความล่าช้าเครือข่าย 300ms
  await new Promise((resolve) => setTimeout(resolve, 300));

  const articlesJson = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let articles: any[] = [];
  if (articlesJson) {
    articles = JSON.parse(articlesJson);
  } else {
    // บทความเริ่มต้นหากยังไม่ได้ตั้งค่าคีย์ (Default Mock Articles)
    articles = blogPosts.map((post) => ({
      id: `art-${post.id}`,
      title: post.title,
      content: post.content,
      category: post.category,
      thumbnailUrl: post.image,
      status: 'published',
      author: post.author,
      createdAt: new Date(Date.now() - post.id * 12 * 60 * 60 * 1000).toISOString()
    }));
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  }

  // กรองเฉพาะบทความที่เผยแพร่แล้ว (Published)
  let filtered = articles.filter((a) => a.status === 'published');

  // กรองตามหมวดหมู่
  if (params.category) {
    filtered = filtered.filter(
      (a) => a.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // กรองตามคำค้นหา
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (a) => a.title.toLowerCase().includes(kw) || a.content.toLowerCase().includes(kw)
    );
  }

  // เรียงลำดับตามวันที่สร้างล่าสุด (Newest First)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // การแบ่งหน้า
  const page = params.page || 1;
  const limit = params.limit || 6;
  const startIndex = (page - 1) * limit;
  const paginatedPosts = filtered.slice(startIndex, startIndex + limit);

  // แมปเข้าสู่รูปแบบอินเทอร์เฟส Post
  const posts: Post[] = paginatedPosts.map((a) => ({
    id: a.id,
    image: a.thumbnailUrl || '/src/assets/aii.png', // ภาพดีฟอลต์พรีเมียมตัวการ์ตูน AI Hologram
    category: a.category,
    title: a.title,
    description: a.content.substring(0, 140) + (a.content.length > 140 ? '...' : ''),
    author: a.author,
    date: new Date(a.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    likes: 15,
    content: a.content,
  }));

  const totalPosts = filtered.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const nextPage = page < totalPages ? page + 1 : null;

  return {
    totalPosts,
    totalPages,
    currentPage: page,
    limit,
    posts,
    nextPage,
  };
}

export async function getPost(postId: string | number): Promise<Post> {
  // จำลองความล่าช้าเครือข่าย 200ms
  await new Promise((resolve) => setTimeout(resolve, 200));

  const articlesJson = localStorage.getItem(STORAGE_KEY_ARTICLES);
  let articles: any[] = [];
  if (articlesJson) {
    articles = JSON.parse(articlesJson);
  }

  const article = articles.find((a) => a.id.toString() === postId.toString());
  if (!article) {
    throw new Error('ไม่พบบทความนี้ในระบบ');
  }

  return {
    id: article.id,
    image: article.thumbnailUrl || '/src/assets/aii.png',
    category: article.category,
    title: article.title,
    description: article.content.substring(0, 140) + (article.content.length > 140 ? '...' : ''),
    author: article.author,
    date: new Date(article.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    likes: 15,
    content: article.content,
  };
}


