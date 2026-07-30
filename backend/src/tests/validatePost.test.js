import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCreatePost } from '../middlewares/validatePost.js';

// Helper to mock express req, res, next
const createMockReqRes = (body) => {
  const req = { body };
  let responseData = null;
  let responseStatus = null;
  let nextCalled = false;

  const res = {
    status(statusCode) {
      responseStatus = statusCode;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getResult: () => ({ status: responseStatus, data: responseData, nextCalled }) };
};

const validPayload = {
  title: 'บทความ AI เทคโนโลยีแห่งอนาคต',
  image: 'https://example.com/cover.jpg',
  category_id: 1,
  description: 'สรุปเทคโนโลยี AI ล่าสุด',
  content: 'เนื้อหาเกี่ยวกับ AI และโลกอนาคต...',
  status_id: 1
};

test('Validation Rule 1: title required and string', async (t) => {
  await t.test('missing title returns 400 Title is required', () => {
    const payload = { ...validPayload };
    delete payload.title;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Title is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('title not string returns 400 Title must be a string', () => {
    const payload = { ...validPayload, title: 12345 };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Title must be a string');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule 2: image required and string', async (t) => {
  await t.test('missing image returns 400 Image is required', () => {
    const payload = { ...validPayload };
    delete payload.image;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Image is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('image not string returns 400 Image must be a string', () => {
    const payload = { ...validPayload, image: true };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Image must be a string');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule 3: category_id required and number', async (t) => {
  await t.test('missing category_id returns 400 Category ID is required', () => {
    const payload = { ...validPayload };
    delete payload.category_id;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Category ID is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('category_id not number returns 400 Category ID must be a number', () => {
    const payload = { ...validPayload, category_id: '1' };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Category ID must be a number');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule 4: description required and string', async (t) => {
  await t.test('missing description returns 400 Description is required', () => {
    const payload = { ...validPayload };
    delete payload.description;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Description is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('description not string returns 400 Description must be a string', () => {
    const payload = { ...validPayload, description: ['test'] };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Description must be a string');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule 5: content required and string', async (t) => {
  await t.test('missing content returns 400 Content is required', () => {
    const payload = { ...validPayload };
    delete payload.content;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Content is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('content not string returns 400 Content must be a string', () => {
    const payload = { ...validPayload, content: { body: 'text' } };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Content must be a string');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule 6: status_id required and number', async (t) => {
  await t.test('missing status_id returns 400 Status ID is required', () => {
    const payload = { ...validPayload };
    delete payload.status_id;
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Status ID is required');
    assert.equal(result.nextCalled, false);
  });

  await t.test('status_id not number returns 400 Status ID must be a number', () => {
    const payload = { ...validPayload, status_id: 'draft' };
    const { req, res, next, getResult } = createMockReqRes(payload);
    validateCreatePost(req, res, next);
    const result = getResult();
    assert.equal(result.status, 400);
    assert.equal(result.data.message, 'Status ID must be a number');
    assert.equal(result.nextCalled, false);
  });
});

test('Validation Rule: valid payload passes to next()', () => {
  const { req, res, next, getResult } = createMockReqRes(validPayload);
  validateCreatePost(req, res, next);
  const result = getResult();
  assert.equal(result.status, null);
  assert.equal(result.nextCalled, true);
});
