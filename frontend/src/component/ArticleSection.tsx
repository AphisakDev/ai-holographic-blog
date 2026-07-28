import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { getPosts, type Post } from '../lib/api';
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-complete Search States
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to dynamically update height with smooth transition
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setContainerHeight(element.offsetHeight);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search value & fetch autocomplete results
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setDebouncedSearchVal('');
      return;
    }

    const handler = setTimeout(async () => {
      // 1. Update grid filter keyword
      setDebouncedSearchVal(searchKeyword);

      // 2. Fetch dropdown autocomplete results
      setIsSearchLoading(true);
      try {
        const response = await getPosts({ keyword: searchKeyword.trim(), limit: 10 });
        setSearchResults(response.posts);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search autocomplete failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword]);

  const fetchPosts = async (targetPage: number, resetList: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryParam = selectedCategory === 'Highlight' ? undefined : selectedCategory;
      const keywordParam = debouncedSearchVal.trim() || undefined;

      const response = await getPosts({
        page: targetPage,
        limit: 4,
        category: categoryParam,
        keyword: keywordParam,
      });

      if (resetList) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }

      setHasMore(response.currentPage < response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  // When category or search keyword changes, fetch page 1 and reset without layout collapsing
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, debouncedSearchVal]);

  // Pagination trigger
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <section className="flex flex-col gap-5 w-full" id="article-section">
      <h2 className="text-2xl font-extrabold tracking-[-0.5px] text-custom-text-primary text-left" id="article-section-title">
        Latest articles
      </h2>
      
      <div 
        style={{ overflow: 'visible', position: 'relative', zIndex: 30 }} 
        className="relative z-30 glass-panel rounded-2xl py-4 px-6 flex justify-between items-center gap-5 transition-all duration-300 border-custom-border max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4 max-[768px]:p-4 shadow-[0_8px_30px_rgba(79,216,224,0.08)]" 
        id="filter-bar"
      >
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
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-[#4fd8e0] text-[#020b1a]! border-[#4fd8e0]/40 shadow-[0_4px_12px_rgba(79,216,224,0.3)]"
                      : "glass-button opacity-70 hover:opacity-100"
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
              <SelectContent style={{ background: '#0a152d' }} className="border-custom-border text-custom-text-primary">
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
        <div className="relative w-full max-w-[280px] max-[768px]:max-w-none" id="search-wrapper" ref={searchWrapperRef}>
          <input
            type="text"
            placeholder="Search"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full text-sm font-medium py-2.5 pl-4 pr-10 rounded-full border border-custom-border bg-custom-navbar-bg/30 backdrop-blur-md text-custom-text-primary outline-none transition-all duration-250 placeholder:text-custom-text-muted focus:border-[#4fd8e0] focus:shadow-[0_0_15px_rgba(79,216,224,0.25)]"
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

          {/* Autocomplete Dropdown */}
          {searchKeyword.trim() !== '' && showDropdown && (
            <div 
              style={{ position: 'absolute', background: 'rgba(6, 15, 35, 0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} 
              className="absolute top-full left-0 right-0 z-50 mt-6 glass-panel rounded-[14px] shadow-[0_10px_30px_rgba(79,216,224,0.3)] overflow-hidden max-h-[300px] overflow-y-auto py-2" 
              id="search-results-dropdown"
            >
              {isSearchLoading ? (
                <div className="px-4 py-3 text-sm text-custom-text-muted text-center" id="search-loading">
                  กำลังค้นหา...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-custom-text-muted text-center" id="search-no-results">
                  ไม่พบบทความที่ตรงกับคำค้นหา
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-custom-border">
                  {searchResults.map((post) => (
                    <li key={post.id} className="w-full">
                      <Link
                        to={`/post/${post.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex w-full px-4 py-3 text-sm text-start text-custom-text-primary hover:bg-custom-footer-bg transition-colors duration-150 cursor-pointer"
                      >
                        <span className="line-clamp-2 w-full text-left">
                          {post.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {/* Physical spacer to prevent rounded bottom clipping */}
                  <div className="h-3 w-full pointer-events-none" />
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid container for Blog Cards */}
      <div 
        style={{ 
          height: containerHeight, 
          transition: 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1)' 
        }} 
        className="overflow-hidden w-full relative"
      >
        <div ref={contentRef} className="flex flex-col justify-start w-full min-h-[500px]">
          {posts.length === 0 && isLoading ? (
            <div className="flex justify-center items-center py-32" id="blog-posts-loading">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4fd8e0]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-32 text-red-500 font-medium" id="blog-posts-error">
              Error: {error}. Please try again later.
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 text-custom-text-muted font-medium" id="blog-posts-empty">
              No articles found.
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 transition-opacity duration-300 ${isLoading && page === 1 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`} id="blog-cards-grid">
                {posts.map((post: any, index: number) => (
                  <BlogCard key={post.id} {...post} index={index} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10" id="view-more-container">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isLoading}
                    className="glass-button text-sm py-2.5 px-6 rounded-full inline-flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    id="btn-view-more"
                  >
                    {isLoading ? "Loading..." : "View more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

