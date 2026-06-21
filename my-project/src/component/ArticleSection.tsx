import { useState } from 'react';
import BlogCard from './BlogCard';
import { blogPosts } from '../data/blogPosts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function ArticleSection() {
  // 1. สร้าง array ของ category ตามที่กำหนด
  const categories = ["Highlight", "Anime", "Technology"];
  
  // 2. สร้าง state สำหรับเก็บ category ปัจจุบัน
  const [selectedCategory, setSelectedCategory] = useState('Highlight');
  const [searchVal, setSearchVal] = useState('');

  // กรองบทความตาม category ที่เลือก และคำค้นหา (search input)
  const filteredPosts = blogPosts.filter((post: any) => {
    const matchesCategory = selectedCategory === 'Highlight' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      post.description.toLowerCase().includes(searchVal.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="flex flex-col gap-5 w-full" id="article-section">
      <h2 className="text-2xl font-extrabold tracking-[-0.5px] text-custom-text-primary text-left" id="article-section-title">
        Latest articles
      </h2>
      
      <div className="bg-custom-footer-bg rounded-2xl py-4 px-6 flex justify-between items-center gap-5 transition-all duration-300 border border-custom-border max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4 max-[768px]:p-4" id="filter-bar">
        {/* Left Side: Category Tabs (Desktop & Mobile Sync) */}
        <div className="flex gap-4 items-center flex-wrap max-[768px]:justify-center max-[768px]:gap-2" id="category-tabs">
          {/* Todo 1 - Desktop: categories.map() แทนการเขียน button ซ้ำ */}
          <div className="hidden md:flex space-x-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 transition-colors rounded-sm text-sm font-medium cursor-pointer ${
                    isSelected
                      ? "bg-custom-tab-active-bg text-custom-text-primary"
                      : "bg-transparent text-custom-text-muted hover:text-custom-text-primary hover:bg-custom-tab-active-bg/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Todo 2 - Mobile: categories.map() แทนการเขียน SelectItem ซ้ำ */}
          <div className="md:hidden w-full">
            <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
              <SelectTrigger className="w-full py-3 rounded-sm text-muted-foreground bg-custom-navbar-bg border-custom-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-custom-navbar-bg border-custom-border text-custom-text-primary">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="focus:bg-custom-tab-active-bg focus:text-custom-text-primary">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Side: Search Input */}
        <div className="relative w-full max-w-[280px] max-[768px]:max-w-none" id="search-wrapper">
          <input
            type="text"
            placeholder="Search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full text-sm font-medium py-2.5 pl-4 pr-10 rounded-[10px] border border-custom-border bg-custom-navbar-bg text-custom-text-primary outline-none transition-all duration-250 placeholder:text-custom-text-muted focus:border-custom-text-primary focus:shadow-[0_0_0_3px_rgba(28,26,23,0.05)]"
            id="search-input"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-custom-text-muted" id="search-icon-container">
            <svg
              viewBox="0 0 24 24"
              className="w-[15px] h-[15px] fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
      </div>

      {/* Grid container for Blog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10" id="blog-cards-grid">
        {/* Render filteredPosts by mapping and spreading props */}
        {filteredPosts.map((post: any) => (
          <BlogCard key={post.id} {...post} />
        ))}
      </div>
    </section>
  );
}

