import express from 'express';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateCreatePost } from '../middlewares/validatePost.js';

const router = express.Router();

// Helper to find article by customId or _id
const findArticleById = async (id) => {
  let article = await Article.findOne({ customId: id });
  if (!article && id.match(/^[0-9a-fA-F]{24}$/)) {
    article = await Article.findById(id);
  }
  return article;
};

// ==========================================
// 1. Get Notifications for current user / admin
// ==========================================
router.get('/notifications/user', verifyToken, async (req, res) => {
  try {
    const isUserAdmin = req.user.role === 'admin';
    const query = isUserAdmin
      ? { $or: [{ recipientId: 'admin' }, { recipientId: req.user.id }] }
      : { recipientId: req.user.id };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notification', error: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', verifyToken, async (req, res) => {
  try {
    const isUserAdmin = req.user.role === 'admin';
    const query = isUserAdmin
      ? { $or: [{ recipientId: 'admin' }, { recipientId: req.user.id }] }
      : { recipientId: req.user.id };

    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notifications', error: error.message });
  }
});

// ==========================================
// 1.5 Create Post with Payload Validation
// ==========================================
router.post('/', validateCreatePost, async (req, res) => {
  try {
    const { title, image, category_id, description, content, status_id, author } = req.body;

    const newArticle = await Article.create({
      customId: `art-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      image: image.trim(),
      thumbnailUrl: image.trim(),
      category_id: category_id,
      category: `Category ${category_id}`,
      description: description.trim(),
      content: content.trim(),
      status_id: status_id,
      status: status_id === 1 ? 'published' : 'draft',
      author: author || 'Admin'
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: newArticle.customId || newArticle._id.toString(),
        title: newArticle.title,
        image: newArticle.image,
        category_id: newArticle.category_id,
        description: newArticle.description,
        content: newArticle.content,
        status_id: newArticle.status_id,
        createdAt: newArticle.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating post', error: error.message });
  }
});

// ==========================================
// 2. Get Posts list
// ==========================================
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
        likes: json.likes || 0,
        likedBy: json.likedBy || [],
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

// ==========================================
// 3. Get Single Post
// ==========================================
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
      likes: json.likes || 0,
      likedBy: json.likedBy || [],
      content: json.content,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving post', error: error.message });
  }
});

// ==========================================
// 4. Like / Unlike Article
// ==========================================
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const article = await findArticleById(postId);
    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความนี้ในระบบ' });
    }

    if (!article.likedBy) article.likedBy = [];

    const hasLiked = article.likedBy.includes(userId);

    if (hasLiked) {
      article.likedBy = article.likedBy.filter(id => id !== userId);
      article.likes = Math.max(0, (article.likes || 1) - 1);
    } else {
      article.likedBy.push(userId);
      article.likes = (article.likes || 0) + 1;

      // Create notification for admin
      await Notification.create({
        recipientId: 'admin',
        senderName: req.user.name,
        type: 'like',
        articleId: article.customId || article._id.toString(),
        articleTitle: article.title,
        message: `${req.user.name} ได้ถูกใจบทความ "${article.title}"`
      });
    }

    await article.save();

    res.json({
      likes: article.likes,
      isLiked: !hasLiked,
      likedBy: article.likedBy
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating like', error: error.message });
  }
});

// ==========================================
// 5. Comments API (Get, Create, Delete)
// ==========================================

// Get comments for article
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ articleId: postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving comments', error: error.message });
  }
});

// Create comment
router.post('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'ข้อความความคิดเห็นห้ามว่าง' });
    }

    const article = await findArticleById(postId);
    if (!article) {
      return res.status(404).json({ message: 'ไม่พบบทความนี้ในระบบ' });
    }

    const newComment = await Comment.create({
      articleId: postId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatarUrl || '',
      content: content.trim()
    });

    // Create notification for admin
    await Notification.create({
      recipientId: 'admin',
      senderName: req.user.name,
      type: 'comment',
      articleId: article.customId || article._id.toString(),
      articleTitle: article.title,
      message: `${req.user.name} ได้แสดงความคิดเห็นในบทความ "${article.title}": "${content.trim()}"`
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating comment', error: error.message });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'ไม่พบความคิดเห็นนี้' });
    }

    // Allow author of comment or admin to delete
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ลบความคิดเห็นนี้' });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Deleted comment successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting comment', error: error.message });
  }
});

export default router;
