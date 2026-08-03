import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ==========================================
// CATEGORIES ADMIN READ & WRITE
// ==========================================

// 1. Get Categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error || !data) {
      return res.json([
        { id: '1', name: 'Technology', createdAt: new Date().toISOString() },
        { id: '2', name: 'Design', createdAt: new Date().toISOString() },
        { id: '3', name: 'AI & Future', createdAt: new Date().toISOString() },
      ]);
    }
    const categories = data.map((item) => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at,
    }));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving categories', error: error.message });
  }
});

// 2. Create Category
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const { data, error } = await supabase.from('categories').insert({ name: name.trim() }).select().single();

    if (error || !data) {
      return res.status(400).json({ message: error?.message || 'มีหมวดหมู่นี้อยู่แล้วในระบบ' });
    }

    res.status(201).json({ id: data.id, name: data.name, createdAt: data.created_at });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating category', error: error.message });
  }
});

// 3. Update Category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const { data, error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', id).select().single();

    if (error || !data) {
      return res.status(400).json({ message: error?.message || 'Failed to update category' });
    }

    res.json({ id: data.id, name: data.name, createdAt: data.created_at });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating category', error: error.message });
  }
});

// 4. Delete Category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('categories').delete().eq('id', id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting category', error: error.message });
  }
});

// ==========================================
// ARTICLES ADMIN READ & WRITE
// ==========================================

// 5. Get Articles list
router.get('/articles', async (req, res) => {
  try {
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });

    if (error || !data) return res.json([]);

    const articles = data.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || '',
      category: item.category || 'General',
      thumbnailUrl: item.thumbnail_url || item.image || '/src/assets/aii.png',
      status: item.status || 'published',
      author: item.author || 'Admin',
      createdAt: item.created_at,
    }));

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving articles', error: error.message });
  }
});

// 6. Get Article by ID
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();

    if (error || !data) {
      return res.status(404).json({ message: 'ไม่พบบทความที่ระบุ' });
    }

    res.json({
      id: data.id,
      title: data.title,
      content: data.content || '',
      category: data.category || 'General',
      thumbnailUrl: data.thumbnail_url || data.image || '/src/assets/aii.png',
      status: data.status || 'published',
      author: data.author || 'Admin',
      createdAt: data.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving article', error: error.message });
  }
});

// 7. Create Article
router.post('/articles', async (req, res) => {
  try {
    const { title, content, category, thumbnailUrl, status, author } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'ชื่อเรื่องห้ามว่าง' });
    }

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: title.trim(),
        content: (content || '').trim(),
        category: category || '',
        thumbnail_url: thumbnailUrl || '',
        image: thumbnailUrl || '',
        status: status || 'published',
        author: author || 'Admin',
      })
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ message: 'Failed to create article', error: error?.message });
    }

    res.status(201).json({
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      author: data.author,
      createdAt: data.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating article', error: error.message });
  }
});

// 8. Update Article
router.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, thumbnailUrl, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'ชื่อเรื่องห้ามว่าง' });
    }

    const { data, error } = await supabase
      .from('articles')
      .update({
        title: title.trim(),
        content: (content || '').trim(),
        category: category || '',
        thumbnail_url: thumbnailUrl || '',
        image: thumbnailUrl || '',
        status: status || 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ message: 'Failed to update article', error: error?.message });
    }

    res.json({
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      author: data.author,
      createdAt: data.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating article', error: error.message });
  }
});

// 9. Delete Article
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('articles').delete().eq('id', id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting article', error: error.message });
  }
});

export default router;
