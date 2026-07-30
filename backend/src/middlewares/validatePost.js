/**
 * Validation Middleware for Post Creation
 * 
 * Rules:
 * - title: Required, must be String
 * - image: Required, must be String
 * - category_id: Required, must be Number
 * - description: Required, must be String
 * - content: Required, must be String
 * - status_id: Required, must be Number
 * 
 * HTTP 400 Bad Request returned on validation failure.
 */

export const validateCreatePost = (req, res, next) => {
  const body = req.body || {};
  const { title, image, category_id, description, content, status_id } = body;

  // 1. Title Validation
  if (title === undefined || title === null || (typeof title === 'string' && title.trim() === '')) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (typeof title !== 'string') {
    return res.status(400).json({ message: 'Title must be a string' });
  }

  // 2. Image Validation
  if (image === undefined || image === null || (typeof image === 'string' && image.trim() === '')) {
    return res.status(400).json({ message: 'Image is required' });
  }
  if (typeof image !== 'string') {
    return res.status(400).json({ message: 'Image must be a string' });
  }

  // 3. Category ID Validation
  if (category_id === undefined || category_id === null || category_id === '') {
    return res.status(400).json({ message: 'Category ID is required' });
  }
  if (typeof category_id !== 'number' || Number.isNaN(category_id)) {
    return res.status(400).json({ message: 'Category ID must be a number' });
  }

  // 4. Description Validation
  if (description === undefined || description === null || (typeof description === 'string' && description.trim() === '')) {
    return res.status(400).json({ message: 'Description is required' });
  }
  if (typeof description !== 'string') {
    return res.status(400).json({ message: 'Description must be a string' });
  }

  // 5. Content Validation
  if (content === undefined || content === null || (typeof content === 'string' && content.trim() === '')) {
    return res.status(400).json({ message: 'Content is required' });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ message: 'Content must be a string' });
  }

  // 6. Status ID Validation
  if (status_id === undefined || status_id === null || status_id === '') {
    return res.status(400).json({ message: 'Status ID is required' });
  }
  if (typeof status_id !== 'number' || Number.isNaN(status_id)) {
    return res.status(400).json({ message: 'Status ID must be a number' });
  }

  next();
};
