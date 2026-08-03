import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Helper middleware for JWT token verify if provided
const optionalAuth = (req, res, next) => {
  req.user = { id: 'anonymous', name: 'Anonymous', role: 'user' };
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      req.user = { id: 'user-auth', name: 'Registered User', role: 'user' };
    }
  }
  next();
};

// 1. Get Notifications
router.get('/notifications/user', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return res.json([]);

    const notifications = data.map((n) => ({
      id: n.id,
      recipientId: n.recipient_id,
      senderName: n.sender_name,
      type: n.type,
      articleId: n.article_id,
      articleTitle: n.article_title,
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    res.json(notifications);
  } catch (error) {
    res.json([]);
  }
});

// Mark notification read
router.put('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  res.json({ message: 'Marked as read' });
});

// Mark all notifications read
router.put('/notifications/read-all', async (req, res) => {
  await supabase.from('notifications').update({ is_read: true }).neq('id', '00000000-0000-0000-0000-000000000000');
  res.json({ message: 'All notifications marked as read' });
});

// 2. Get Posts list
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const category = req.query.category;
    const keyword = req.query.keyword;

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query.range(from, to);

    if (error || !data) {
      return res.status(500).json({ message: 'Error fetching articles', error: error?.message });
    }

    const totalPosts = count || data.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    const posts = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || (item.content ? item.content.slice(0, 120) + '...' : ''),
      content: item.content || '',
      category: item.category || 'General',
      image: item.image || item.thumbnail_url || '/src/assets/aii.png',
      author: item.author || 'Admin',
      date: new Date(item.created_at || Date.now()).toLocaleDateString('th-TH'),
      likes: item.likes || 0,
      likedBy: [],
    }));

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

// 3. Get Single Post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'ไม่พบบทความนี้ในระบบ' });
    }

    res.json({
      id: data.id,
      title: data.title,
      description: data.description || '',
      content: data.content || '',
      category: data.category || 'General',
      image: data.image || data.thumbnail_url || '/src/assets/aii.png',
      author: data.author || 'Admin',
      date: new Date(data.created_at || Date.now()).toLocaleDateString('th-TH'),
      likes: data.likes || 0,
      likedBy: [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving post', error: error.message });
  }
});

// 4. Like / Unlike Post
router.post('/:postId/like', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data: article } = await supabase.from('articles').select('likes').eq('id', postId).single();
    const newLikes = (article?.likes || 0) + 1;

    await supabase.from('articles').update({ likes: newLikes }).eq('id', postId);

    res.json({
      likes: newLikes,
      isLiked: true,
      likedBy: [userId],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating like', error: error.message });
  }
});

// 5. Get Comments for Post
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) return res.json([]);

    const comments = data.map((c) => ({
      id: c.id,
      articleId: c.article_id,
      userId: c.user_id,
      userName: c.user_name,
      userAvatar: c.user_avatar,
      content: c.content,
      createdAt: c.created_at,
    }));

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving comments', error: error.message });
  }
});

// 6. Create Comment
router.post('/:postId/comments', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'ข้อความความคิดเห็นห้ามว่าง' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id: postId,
        user_id: 'user-' + Date.now(),
        user_name: 'ผู้ใช้ทั่วไป',
        user_avatar: '',
        content: content.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ message: 'Failed to create comment', error: error?.message });
    }

    res.status(201).json({
      id: data.id,
      articleId: data.article_id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      content: data.content,
      createdAt: data.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating comment', error: error.message });
  }
});

// 7. Delete Comment
router.delete('/:postId/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    await supabase.from('comments').delete().eq('id', commentId);
    res.json({ message: 'Deleted comment successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting comment', error: error.message });
  }
});

export default router;
