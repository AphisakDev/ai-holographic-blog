import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreatePostComponent() {
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    category_id: 1,
    status_id: 1,
  });
  const [imageFile, setImageFile] = useState<{ file: File } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันสำหรับจัดการเมื่อมีการเลือกไฟล์
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // ตรวจสอบประเภทของไฟล์
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WebP).");
      return;
    }

    // ตรวจสอบขนาดของไฟล์ (เช่น ขนาดไม่เกิน 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("The file is too large. Please upload an image smaller than 5MB.");
      return;
    }

    // เก็บข้อมูลไฟล์
    setImageFile({ file });
  };

  // ฟังก์ชันสำหรับจัดการเมื่อมีการเปลี่ยนแปลงค่าใน input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPost((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ฟังก์ชันสำหรับการบันทึกข้อมูลโพสต์
  const handleSave = async (statusId: number) => {
    if (!imageFile) {
      alert("Please select an image file.");
      return;
    }

    setIsLoading(true);

    // สร้าง FormData สำหรับการส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData();

    // เพิ่มข้อมูลทั้งหมดลงใน FormData
    formData.append("title", post.title);
    formData.append("category_id", String(post.category_id || 1));
    formData.append("description", post.description);
    formData.append("content", post.content);
    formData.append("status_id", String(statusId));
    formData.append("imageFile", imageFile.file); // เพิ่มไฟล์รูปภาพ

    try {
      // ดึง token ถ้ามี
      const token = localStorage.getItem("token") || "mock-jwt-admin-token";

      // ส่งข้อมูลไปยัง Backend
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const apiUrl = baseUrl.endsWith("/posts") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/posts`;

      await axios.post(
        apiUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}` // ถ้ามีการใช้ token สำหรับการยืนยันตัวตน
          },
        }
      );

      alert("Post created successfully!");
      navigate("/admin/articles"); // นำทางไปยังหน้ารายการโพสต์
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-custom-navbar-bg border border-custom-border rounded-2xl text-custom-text-primary shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-custom-text-primary">Create New Post</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {/* ส่วนแสดงตัวอย่างรูปภาพและปุ่มอัปโหลด */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-custom-text-primary uppercase tracking-wider">
            Thumbnail Image
          </label>
          <div className="space-y-3">
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile.file)}
                alt="Preview"
                className="w-full max-w-sm h-48 object-cover rounded-xl border border-custom-border shadow-md"
              />
            ) : (
              <div className="p-8 border-2 border-dashed border-custom-border rounded-xl text-center text-custom-text-muted bg-custom-bg">
                No image selected
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full text-sm text-custom-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-custom-accent/20 file:text-custom-text-primary hover:file:bg-custom-accent/30 cursor-pointer"
            />
          </div>
        </div>

        {/* ฟอร์มสำหรับกรอกข้อมูลโพสต์ */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-custom-text-primary">Title</label>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            placeholder="Enter post title..."
            className="w-full px-4 py-2.5 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-2 focus:ring-custom-accent/40"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-custom-text-primary">Description</label>
          <textarea
            name="description"
            value={post.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter short description..."
            className="w-full px-4 py-2.5 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-2 focus:ring-custom-accent/40"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-custom-text-primary">Content</label>
          <textarea
            name="content"
            value={post.content}
            onChange={handleInputChange}
            rows={6}
            placeholder="Enter post content..."
            className="w-full px-4 py-2.5 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-2 focus:ring-custom-accent/40"
          />
        </div>

        {/* ปุ่มสำหรับบันทึกข้อมูล */}
        <div className="flex gap-4 pt-4 border-t border-custom-border">
          <button
            type="button"
            onClick={() => handleSave(1)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full font-semibold border border-custom-btn-border text-custom-text-primary hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(2)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full font-semibold bg-custom-accent text-black hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-custom-accent/20"
          >
            {isLoading ? "Saving..." : "Save and Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostComponent;
