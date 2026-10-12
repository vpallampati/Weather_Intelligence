import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation, X } from 'lucide-react';
import { CityLocation } from '../types';

interface SearchBarProps {
  onSelectCity: (city: CityLocation) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  currentCityName?: string;
  isDark?: boolean;
}

const PRESET_CITIES: CityLocation[] = [
  { id: 5128581, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', admin1: 'New York' },
  { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', admin1: 'England' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', admin1: 'Tokyo' },
  { id: 2988507, name: 'Paris', latitude: 48.8534, longitude: 2.3488, country: 'France', admin1: 'Île-de-France' },
  { id: 5391959, name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, country: 'United States', admin1: 'California' },
  { id: 1880252, name: 'Singapore', latitude: 1.2897, longitude: 103.8501, country: 'Singapore' },
  { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', admin1: 'New South Wales' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLocating,
  currentCityName,
  isDark = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search cities with debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search cities:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityLocation) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3" ref={wrapperRef}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search any global city, state, or region (e.g., Zurich, Seattle, Kyoto)..."
            className={`w-full pl-10 pr-10 py-3 text-sm ${
              isDark
                ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/80 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500'
                : 'bg-white/85 backdrop-blur-md border-stone-300 text-stone-900 placeholder-stone-400 focus:ring-stone-900 focus:border-stone-900'
            } border rounded-xl transition-shadow shadow-xs`}
          />
          {query && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Current Location GPS Button */}
        <button
          id="use-current-location-btn"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            isDark
              ? 'text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700'
              : 'text-stone-700 bg-white/85 hover:bg-white border-stone-300'
          } border rounded-xl transition-colors shrink-0 disabled:opacity-60 shadow-xs`}
          title="Detect my current location"
        >
          {isLocating ? (
            <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-sky-400' : 'text-stone-900'}`} />
          ) : (
            <Navigation className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-stone-800'}`} />
          )}
          <span className="hidden sm:inline">My Location</span>
        </button>

        {/* Autocomplete Results Dropdown */}
        {isOpen && (
          <div
            id="search-results-dropdown"
            className={`absolute left-0 right-14 top-full mt-1.5 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
            } border rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto`}
          >
            {isLoading ? (
              <div className={`p-4 flex items-center justify-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Open-Meteo geocoding database...</span>
              </div>
            ) : results.length > 0 ? (
              <ul className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
                {results.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={item.id}>
                      <button
                        id={`city-result-item-${item.id}`}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                          isSelected
                            ? (isDark ? 'bg-slate-800 text-white' : 'bg-stone-100 text-stone-900')
                            : (isDark ? 'hover:bg-slate-800/60 text-slate-200' : 'hover:bg-stone-50 text-stone-800')
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                          <div>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>{item.name}</span>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'} ml-1.5`}>
                              {[item.admin1, item.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-stone-400'} font-mono`}>
                          {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : query.trim().length >= 2 ? (
              <div className={`p-4 text-center text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                No cities found matching &ldquo;{query}&rdquo;.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Preset Cities Quick Picks */}
      <div className={`flex items-center gap-2 flex-wrap text-xs ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
        <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-stone-500'} shrink-0`}>Popular:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_CITIES.map((city) => {
            const isCurrent = currentCityName?.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.id}
                id={`preset-city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => handleSelect(city)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                  isCurrent
                    ? (isDark ? 'bg-sky-500 text-white border-sky-400 shadow-xs' : 'bg-stone-900 text-white border-stone-900')
                    : (isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white/80 hover:bg-white text-stone-700 border-stone-200')
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
