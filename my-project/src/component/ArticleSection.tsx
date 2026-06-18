import { useState } from 'react';

export default function ArticleSection() {
  const tabs = ['Highlight', 'Cat', 'Inspiration', 'Ganeral'];
  const [activeTab, setActiveTab] = useState('Highlight');
  const [searchVal, setSearchVal] = useState('');

  return (
    <section className="article-section" id="article-section">
      <h2 className="article-section-title" id="article-section-title">Latest articles</h2>
      
      <div className="filter-bar" id="filter-bar">
        {/* Left Side: Category Tabs */}
        <div className="category-tabs" id="category-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              id={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Side: Search Input */}
        <div className="search-wrapper" id="search-wrapper">
          <input
            type="text"
            placeholder="Search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="search-input"
            id="search-input"
          />
          <span className="search-icon-container" id="search-icon-container">
            <svg
              viewBox="0 0 24 24"
              className="search-icon-svg"
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
