import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const CategoryFilter = () => {
  // 1. สร้าง useState ชื่อ category ค่าเริ่มต้นเป็น "Highlight"
  const [category, setCategory] = useState<string>('Highlight');

  // รายการ Category
  const categories = ['Highlight', 'Tech', 'Lifestyle'];

  return (
    <div className="flex flex-col gap-4 p-4 border border-custom-border rounded-xl bg-custom-navbar-bg shadow-sm" id="category-filter">
      {/* 2. Desktop — แสดงปุ่ม Filter 3 ปุ่ม */}
      <div className="hidden md:flex items-center gap-2" id="category-filter-desktop">
        {categories.map((categoryName) => {
          const isSelected = category === categoryName;
          return (
            <button
              key={categoryName}
              disabled={isSelected}
              onClick={() => setCategory(categoryName)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {categoryName}
            </button>
          );
        })}
      </div>

      {/* 3. Mobile — แสดง <Select> จาก shadcn/ui */}
      <div className="block md:hidden w-full" id="category-filter-mobile">
        <Select value={category} onValueChange={(value) => value && setCategory(value)}>
          <SelectTrigger className="w-full text-custom-text-primary border-custom-border bg-custom-bg">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-custom-navbar-bg border-custom-border text-custom-text-primary">
            <SelectItem value="Highlight">Highlight</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Lifestyle">Lifestyle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. แสดงข้อความ "Selected: {category}" เพื่อ debug */}
      <div className="text-sm font-medium text-custom-text-muted mt-2" id="category-filter-debug">
        Selected: {category}
      </div>
    </div>
  );
};

export default CategoryFilter;
