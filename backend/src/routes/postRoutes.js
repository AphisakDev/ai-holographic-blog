import express from 'express';
import Article from '../models/Article.js';

const router = express.Router();

// Helper to find article by customId or _id
const findArticleById = async (id) => {
  let article = await Article.findOne({ customId: id });
  if (!article && id.match(/^[0-9a-fA-F]{24}$/)) {
    article = await Article.findById(id);
  }
  return article;
};

// 1. Get Posts list with pagination, category, and search query filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category;
    const keyword = req.query.keyword;

    const query = { status: 'published' };

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (keyword) {
      const kwRegex = new RegExp(keyword, 'i');
      query.$or = [{ title: kwRegex }, { content: kwRegex }];
    }

    const totalPosts = await Article.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const posts = articles.map(a => {
      const json = a.toJSON();
      return {
        id: json.id,
        image: json.thumbnailUrl || '/src/assets/aii.png',
        category: json.category,
        title: json.title,
        description: (json.content || '').substring(0, 140) + ((json.content || '').length > 140 ? '...' : ''),
        author: json.author,
        date: new Date(json.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
        likes: json.likes || 15,
        content: json.content,
      };
    });

    res.json({
      totalPosts,
      totalPages,
      currentPage: page,
      limit,
      posts,
      nextPage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving posts', error: error.message });
  }
});

// 2. Get Single Post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const article = await findArticleById(postId);

    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความนี้ในระบบ' });
    }

    const json = article.toJSON();

    res.json({
      id: json.id,
      image: json.thumbnailUrl || '/src/assets/aii.png',
      category: json.category,
      title: json.title,
      description: (json.content || '').substring(0, 140) + ((json.content || '').length > 140 ? '...' : ''),
      author: json.author,
      date: new Date(json.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      likes: json.likes || 15,
      content: json.content,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving post', error: error.message });
  }
});

export default router;
