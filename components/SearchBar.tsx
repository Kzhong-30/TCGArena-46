"use client";

import { useState } from "react";
import { Search, X, MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  city,
  onCityChange,
  onSearch,
}: SearchBarProps) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const filteredCities = CITIES.filter((c) =>
    c.includes(citySearch)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const clearQuery = () => {
    onQueryChange("");
  };

  const selectCity = (c: string) => {
    onCityChange(c);
    setCitySearch("");
    setShowCityDropdown(false);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索小区、地址、房源名称..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {query && (
            <button
              onClick={clearQuery}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg text-left bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <span className={cn(city ? "text-gray-900" : "text-gray-400")}>
              {city || "选择城市"}
            </span>
          </button>
          {showCityDropdown && (
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="搜索城市..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="p-2">
                {city && (
                  <button
                    onClick={() => selectCity("")}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 rounded-md"
                  >
                    全部城市
                  </button>
                )}
                {filteredCities.length > 0 ? (
                  filteredCities.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                        city === c
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {c}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    未找到城市
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSearch}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
        >
          <Search className="h-5 w-5" />
          搜索
        </button>
      </div>
    </div>
  );
}
