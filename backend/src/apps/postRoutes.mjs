import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import protectAdmin from "../middlewares/protectAdmin.mjs";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import existingPostRoutes from "../routes/postRoutes.js";

dotenv.config();

// เชื่อมต่อ Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL || "https://kopapmgkkrbeuyylgwqj.supabase.co",
  process.env.SUPABASE_ANON_KEY || "sb_publishable_tER4jD_RAcyG-Unvo_d1gQ_7se-LR35"
);

const postRouter = Router();

// ตั้งค่า Multer สำหรับการอัปโหลดไฟล์
const multerUpload = multer({ storage: multer.memoryStorage() });

// กำหนดฟิลด์ที่จะรับไฟล์ (สามารถรับได้หลายฟิลด์)
const imageFileUpload = multerUpload.fields([
  { name: "imageFile", maxCount: 1 },
]);

// Route สำหรับการสร้างโพสต์ใหม่
postRouter.post("/", [imageFileUpload, protectAdmin], async (req, res) => {
  try {
    // 1) รับข้อมูลจาก request body และไฟล์ที่อัปโหลด
    const newPost = req.body;
    const file = req.files?.imageFile?.[0];

    let publicUrl = newPost.image || "";

    // 2) กำหนด bucket และ path ที่จะเก็บไฟล์ใน Supabase (ถ้ามีไฟล์)
    if (file) {
      const bucketName = "my-personal-blog";
      const filePath = `posts/${Date.now()}_${file.originalname}`; // สร้าง path ที่ไม่ซ้ำกัน

      // ตรวจสอบและสร้าง Bucket อัตโนมัติหากยังไม่มีใน Supabase
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && !buckets.some((b) => b.name === bucketName)) {
          await supabase.storage.createBucket(bucketName, { public: true });
        }
      } catch (bucketErr) {
        console.warn("Auto create bucket warning:", bucketErr.message);
      }

      // 3) อัปโหลดไฟล์ไปยัง Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // ป้องกันการเขียนทับไฟล์เดิม
        });

      if (error) {
        throw error;
      }

      // 4) ดึง URL สาธารณะของไฟล์ที่อัปโหลด
      const {
        data: { publicUrl: url },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      publicUrl = url;
    }

    // 5) บันทึกข้อมูลโพสต์ลงในฐานข้อมูล
    const query = `INSERT INTO posts (title, image, category_id, description, content, status_id)
      VALUES ($1, $2, $3, $4, $5, $6)`;

    const values = [
      newPost.title,
      publicUrl, // เก็บ URL ของรูปภาพ
      parseInt(newPost.category_id || 1),
      newPost.description,
      newPost.content,
      parseInt(newPost.status_id || 1),
    ];

    await connectionPool.query(query, values);

    // 6) ส่งผลลัพธ์กลับไปยัง client
    return res.status(201).json({ message: "Created post successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server could not create post",
      error: err.message,
    });
  }
});

// Mount existing GET/PUT/DELETE handlers for /posts
postRouter.use("/", existingPostRoutes);

export default postRouter;
