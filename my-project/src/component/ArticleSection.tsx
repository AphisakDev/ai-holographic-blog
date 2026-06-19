import { useState } from 'react';

export default function ArticleSection() {
  const tabs = ['Highlight', 'Cat', 'Inspiration', 'Ganeral'];
  const [activeTab, setActiveTab] = useState('Highlight');
  const [searchVal, setSearchVal] = useState('');

  return (
    <section className="flex flex-col gap-5 w-full" id="article-section">
      <h2 className="text-2xl font-extrabold tracking-[-0.5px] text-custom-text-primary text-left" id="article-section-title">Latest articles</h2>
      
      <div className="bg-custom-footer-bg rounded-2xl py-4 px-6 flex justify-between items-center gap-5 transition-all duration-300 border border-custom-border max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4 max-[768px]:p-4" id="filter-bar">
        {/* Left Side: Category Tabs */}
        <div className="flex gap-4 items-center flex-wrap max-[768px]:justify-center max-[768px]:gap-2" id="category-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold text-custom-text-secondary bg-transparent border-none py-2.5 px-5 rounded-[10px] cursor-pointer transition-colors duration-200 outline-none hover:text-custom-text-primary max-[768px]:py-2 max-[768px]:px-4 max-[768px]:text-[13px] ${activeTab === tab ? 'bg-custom-tab-active-bg text-custom-text-primary' : ''}`}
              id={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
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
    </section>
  );
}

