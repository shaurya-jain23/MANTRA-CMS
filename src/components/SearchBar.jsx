import { Search } from 'lucide-react';
import {Input} from './index'

function SearchBar({ query, setQuery, resultCount, className, placeholder }) {
  return (
    <div className="flex-grow w-full md:w-3/4 lg:w-1/2">
      <div className="relative w-full">
        <Input
          type="search"
          icon={Search}
          name="search"
          className={`block sm:text-base !pl-10 pr-3 py-2 leading-5 focus:placeholder-gray-300 text-sm ${className}`}
          placeholder= {placeholder || "Search by Container No, BL, Job No, Party Name..."} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mt-1 pl-1 h-0">
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
