/**
 * Mock Admin Database Service
 * ทำหน้าที่จัดการข้อมูลบทความ (Articles) และหมวดหมู่ (Categories) จำลองโดยบันทึกลงใน localStorage
 */
import { blogPosts } from '../data/blogPosts';

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

const STORAGE_KEY_ARTICLES = 'mock_admin_articles';
const STORAGE_KEY_CATEGORIES = 'mock_admin_categories';

// ==========================================
// CATEGORIES DATABASE HELPER
// ==========================================

export const getCategoriesFromDB = (): Category[] => {
  const categoriesJson = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (categoriesJson) {
    return JSON.parse(categoriesJson);
  }
  // หมวดหมู่เริ่มต้น (Default Mock Categories)
  const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Highlight', createdAt: new Date().toISOString() },
    { id: 'cat-2', name: 'Anime', createdAt: new Date().toISOString() },
    { id: 'cat-3', name: 'Technology', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
  return defaultCategories;
};

const saveCategoriesToDB = (categories: Category[]) => {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
};

// ==========================================
// ARTICLES DATABASE HELPER
// ==========================================

export const getArticlesFromDB = (): Article[] => {
  const articlesJson = localStorage.getItem(STORAGE_KEY_ARTICLES);
  if (articlesJson) {
    return JSON.parse(articlesJson);
  }
  // บทความเริ่มต้น (Default Mock Articles)
  const defaultArticles: Article[] = blogPosts.map((post) => ({
    id: `art-${post.id}`,
    title: post.title,
    content: post.content,
    category: post.category,
    thumbnailUrl: post.image,
    status: 'published',
    author: post.author,
    createdAt: new Date(Date.now() - post.id * 12 * 60 * 60 * 1000).toISOString()
  }));
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(defaultArticles));
  return defaultArticles;
};

const saveArticlesToDB = (articles: Article[]) => {
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
};

// ==========================================
// CATEGORIES CRUD API SIMULATIONS
// ==========================================

export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getCategoriesFromDB());
    }, 500);
  });
};

export const createCategory = (name: string): Promise<Category> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const categories = getCategoriesFromDB();
      
      // ตรวจสอบชื่อซ้ำ
      const nameExists = categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
      if (nameExists) {
        return reject(new Error('มีหมวดหมู่นี้อยู่แล้วในระบบ'));
      }

      const newCategory: Category = {
        id: `cat-${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        createdAt: new Date().toISOString()
      };

      categories.push(newCategory);
      saveCategoriesToDB(categories);
      resolve(newCategory);
    }, 800);
  });
};

export const updateCategory = (id: string, name: string): Promise<Category> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const categories = getCategoriesFromDB();
      const catIndex = categories.findIndex((c) => c.id === id);

      if (catIndex === -1) {
        return reject(new Error('ไม่พบหมวดหมู่ที่ต้องการแก้ไข'));
      }

      // ตรวจสอบชื่อซ้ำ (ยกเว้นไอดีตัวเอง)
      const nameExists = categories.some((c) => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase());
      if (nameExists) {
        return reject(new Error('มีหมวดหมู่นี้อยู่แล้วในระบบ'));
      }

      // อัปเดตข้อมูลบทความที่อิงตามหมวดหมู่นี้ด้วย
      const oldName = categories[catIndex].name;
      const articles = getArticlesFromDB();
      const updatedArticles = articles.map((art) => 
        art.category === oldName ? { ...art, category: name.trim() } : art
      );
      saveArticlesToDB(updatedArticles);

      // อัปเดตหมวดหมู่
      categories[catIndex].name = name.trim();
      saveCategoriesToDB(categories);

      resolve(categories[catIndex]);
    }, 800);
  });
};

export const deleteCategory = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const categories = getCategoriesFromDB();
      const catIndex = categories.findIndex((c) => c.id === id);

      if (catIndex === -1) {
        return reject(new Error('ไม่พบหมวดหมู่ที่ต้องการลบ'));
      }

      categories.splice(catIndex, 1);
      saveCategoriesToDB(categories);
      resolve();
    }, 800);
  });
};

// ==========================================
// ARTICLES CRUD API SIMULATIONS
// ==========================================

export const getArticles = (): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getArticlesFromDB());
    }, 600);
  });
};

export const getArticleById = (id: string): Promise<Article> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const articles = getArticlesFromDB();
      const article = articles.find((a) => a.id === id);
      if (!article) {
        return reject(new Error('ไม่พบบทความที่ระบุ'));
      }
      resolve(article);
    }, 500);
  });
};

export const createArticle = (
  title: string, 
  content: string, 
  category: string, 
  thumbnailUrl: string, 
  status: 'draft' | 'published',
  author: string
): Promise<Article> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!title.trim()) {
        return reject(new Error('ชื่อเรื่องห้ามว่าง'));
      }

      const articles = getArticlesFromDB();
      const newArticle: Article = {
        id: `art-${Math.random().toString(36).substring(2, 9)}`,
        title: title.trim(),
        content: content.trim(),
        category,
        thumbnailUrl,
        status,
        author,
        createdAt: new Date().toISOString()
      };

      articles.unshift(newArticle); // แทรกลงด้านหน้า
      saveArticlesToDB(articles);
      resolve(newArticle);
    }, 1000);
  });
};

export const updateArticle = (
  id: string,
  title: string, 
  content: string, 
  category: string, 
  thumbnailUrl: string, 
  status: 'draft' | 'published'
): Promise<Article> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!title.trim()) {
        return reject(new Error('ชื่อเรื่องห้ามว่าง'));
      }

      const articles = getArticlesFromDB();
      const artIndex = articles.findIndex((a) => a.id === id);

      if (artIndex === -1) {
        return reject(new Error('ไม่พบบทความที่ต้องการแก้ไข'));
      }

      // รักษาภาพเดิมไว้ถ้าไม่ได้ส่งมาใหม่
      const finalThumbnailUrl = thumbnailUrl || articles[artIndex].thumbnailUrl;

      articles[artIndex] = {
        ...articles[artIndex],
        title: title.trim(),
        content: content.trim(),
        category,
        thumbnailUrl: finalThumbnailUrl,
        status,
      };

      saveArticlesToDB(articles);
      resolve(articles[artIndex]);
    }, 1000);
  });
};

export const deleteArticle = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const articles = getArticlesFromDB();
      const artIndex = articles.findIndex((a) => a.id === id);

      if (artIndex === -1) {
        return reject(new Error('ไม่พบบทความที่ต้องการลบ'));
      }

      articles.splice(artIndex, 1);
      saveArticlesToDB(articles);
      resolve();
    }, 800);
  });
};
