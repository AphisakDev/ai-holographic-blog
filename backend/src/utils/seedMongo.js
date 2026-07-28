import { readDB } from './dbHelper.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    const articleCount = await Article.countDocuments();

    if (userCount > 0 || articleCount > 0) {
      console.log('MongoDB already contains data. Skipping initial seeding.');
      return;
    }

    console.log('MongoDB is empty. Seeding initial data from db.json...');
    const dbData = await readDB();

    if (dbData.users && dbData.users.length > 0) {
      for (const u of dbData.users) {
        await User.create({
          customId: u.id,
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password,
          role: u.role || 'user',
          avatarUrl: u.avatarUrl || '',
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
        });
      }
      console.log(`Seeded ${dbData.users.length} users.`);
    }

    if (dbData.categories && dbData.categories.length > 0) {
      for (const c of dbData.categories) {
        await Category.create({
          customId: c.id,
          name: c.name,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
        });
      }
      console.log(`Seeded ${dbData.categories.length} categories.`);
    }

    if (dbData.articles && dbData.articles.length > 0) {
      for (const a of dbData.articles) {
        await Article.create({
          customId: a.id,
          title: a.title,
          content: a.content || '',
          category: a.category || '',
          thumbnailUrl: a.thumbnailUrl || '',
          status: a.status || 'draft',
          author: a.author || 'Admin',
          likes: a.likes || 15,
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
        });
      }
      console.log(`Seeded ${dbData.articles.length} articles.`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
