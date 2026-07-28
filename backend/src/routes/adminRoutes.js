import express from 'express';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to verify if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Helpers for lookup by customId or _id
const findCategoryById = async (id) => {
  let cat = await Category.findOne({ customId: id });
  if (!cat && id.match(/^[0-9a-fA-F]{24}$/)) {
    cat = await Category.findById(id);
  }
  return cat;
};

const findArticleById = async (id) => {
  let art = await Article.findOne({ customId: id });
  if (!art && id.match(/^[0-9a-fA-F]{24}$/)) {
    art = await Article.findById(id);
  }
  return art;
};

// ==========================================
// CATEGORIES ADMIN READ & WRITE
// ==========================================

// 1. Get Categories (Public/Admin GET)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving categories', error: error.message });
  }
});

// 2. Create Category (Admin POST)
router.post('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const nameExists = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (nameExists) {
      return res.status(400).json({ message: 'มีหมวดหมู่นี้อยู่แล้วในระบบ' });
    }

    const newCategory = await Category.create({
      customId: `cat-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim()
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating category', error: error.message });
  }
});

// 3. Update Category (Admin PUT)
router.put('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await findCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข' });
    }

    // Check duplicate name excluding current category
    const nameExists = await Category.findOne({
      _id: { $ne: category._id },
      name: new RegExp(`^${name.trim()}$`, 'i')
    });
    if (nameExists) {
      return res.status(400).json({ message: 'มีหมวดหมู่นี้อยู่แล้วในระบบ' });
    }

    const oldName = category.name;
    category.name = name.trim();
    await category.save();

    // Update related articles
    await Article.updateMany({ category: oldName }, { category: name.trim() });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating category', error: error.message });
  }
});

// 4. Delete Category (Admin DELETE)
router.delete('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await findCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่ที่ต้องการลบ' });
    }

    await Category.deleteOne({ _id: category._id });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting category', error: error.message });
  }
});

// ==========================================
// ARTICLES ADMIN READ & WRITE
// ==========================================

// 5. Get Articles list (Admin GET)
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving articles', error: error.message });
  }
});

// 6. Get Article by ID (Admin GET)
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await findArticleById(id);

    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความที่ระบุ' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving article', error: error.message });
  }
});

// 7. Create Article (Admin POST)
router.post('/articles', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, content, category, thumbnailUrl, status, author } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'ชื่อเรื่องห้ามว่าง' });
    }

    const newArticle = await Article.create({
      customId: `art-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      content: (content || '').trim(),
      category: category || '',
      thumbnailUrl: thumbnailUrl || '',
      status: status || 'draft',
      author: author || 'Admin'
    });

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating article', error: error.message });
  }
});

// 8. Update Article (Admin PUT)
router.put('/articles/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, thumbnailUrl, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'ชื่อเรื่องห้ามว่าง' });
    }

    const article = await findArticleById(id);
    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความที่ต้องการแก้ไข' });
    }

    article.title = title.trim();
    article.content = (content || '').trim();
    article.category = category || '';
    if (thumbnailUrl !== undefined) article.thumbnailUrl = thumbnailUrl;
    if (status !== undefined) article.status = status;

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating article', error: error.message });
  }
});

// 9. Delete Article (Admin DELETE)
router.delete('/articles/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await findArticleById(id);

    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความที่ต้องการลบ' });
    }

    await Article.deleteOne({ _id: article._id });
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting article', error: error.message });
  }
});

export default router;
