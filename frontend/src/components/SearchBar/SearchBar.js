import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onFilterChange, activeFilter }) {
    const [searchInput, setSearchInput] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchInput.trim().toUpperCase());
    };

    const handleClear = () => {
        setSearchInput('');
        onSearch('');
    };

    return (
        <div className="search-bar-container">
            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="SEARCH FLIGHT (e.g. UAL123, BAW456)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                    <button
                        type="button"
                        className="clear-button"
                        onClick={handleClear}
                    >
                        ✕
                    </button>
                )}
                <button type="submit" className="search-button">
                    SEARCH
                </button>
            </form>

            <div className="filter-buttons">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => onFilterChange('all')}
                >
                    ALL COUNTRIES
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'europe' ? 'active' : ''}`}
                    onClick={() => onFilterChange('europe')}
                >
                    EUROPE
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'americas' ? 'active' : ''}`}
                    onClick={() => onFilterChange('americas')}
                >
                    AMERICAS
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'asia' ? 'active' : ''}`}
                    onClick={() => onFilterChange('asia')}
                >
                    ASIA/PACIFIC
                </button>
            </div>
        </div>
    );
}

export default SearchBar;