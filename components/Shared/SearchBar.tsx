"use client";

import { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
};

export default function SearchBar({
  placeholder = "Search…",
  className,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Site" className={className}>
      <label className="sr-only" htmlFor="global-search">Search</label>
      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-1 rounded-md border border-gray-400 bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </form>
  );
}


