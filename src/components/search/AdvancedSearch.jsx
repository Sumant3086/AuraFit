import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiClock } from 'react-icons/fi';
import './search.css';

const AdvancedSearch = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
  });

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      // Simulate autocomplete suggestions
      const mockSuggestions = [
        'Workout Plans',
        'Nutrition Plans',
        'Yoga Classes',
        'Boxing Training',
        'Protein Supplements',
        'Gym Equipment',
      ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      onSearch({ query: searchQuery, filters });
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeRecentSearch = (search) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="advanced-search">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={placeholder}
          className="search-input"
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
        />
        {query && (
          <motion.button
            className="clear-btn"
            onClick={clearSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </motion.button>
        )}
        <motion.button
          className="search-btn"
          onClick={() => handleSearch(query)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Search
        </motion.button>
      </div>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            className="suggestions-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {suggestions.length > 0 && (
              <div className="suggestions-section">
                <h4>Suggestions</h4>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    whileHover={{ backgroundColor: 'rgba(0, 245, 255, 0.1)' }}
                  >
                    <FiSearch />
                    <span>{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {recentSearches.length > 0 && (
              <div className="suggestions-section">
                <h4>Recent Searches</h4>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item recent"
                    whileHover={{ backgroundColor: 'rgba(0, 245, 255, 0.1)' }}
                  >
                    <FiClock />
                    <span onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}>{search}</span>
                    <button
                      className="remove-recent"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(search);
                      }}
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="search-filters">
        <FiFilter />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="classes">Classes</option>
          <option value="products">Products</option>
          <option value="plans">Plans</option>
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
        >
          <option value="all">All Prices</option>
          <option value="0-1000">₹0 - ₹1000</option>
          <option value="1000-2000">₹1000 - ₹2000</option>
          <option value="2000+">₹2000+</option>
        </select>

        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="all">All Ratings</option>
          <option value="4+">4+ Stars</option>
          <option value="3+">3+ Stars</option>
        </select>
      </div>
    </div>
  );
};

export default AdvancedSearch;
