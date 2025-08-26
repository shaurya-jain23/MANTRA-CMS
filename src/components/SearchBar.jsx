import React from 'react';
import { Search } from 'lucide-react';
import {Input} from './index'

function SearchBar({ query, setQuery, resultCount }) {
  return (
    <div className="flex-grow w-full md:w-3/4 lg:w-1/2">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          name="search"
          className="block pl-10 pr-3 py-2  rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm"
          placeholder="Search by Container No, BL, Job No, Party Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mt-1 pl-1 h-2">
          {query && (
            <p className="text-xs text-gray-500">
              Found {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
    </div>
  );
}

export default SearchBar;
