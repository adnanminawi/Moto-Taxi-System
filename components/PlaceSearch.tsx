"use client";
import { useState } from "react";
import { searchPlace } from "@/services/customer";
import type { Place } from "@/types";

type Props = {
  placeholder: string;
  onSelect: (place: Place) => void;
};

export default function PlaceSearch({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null); // null = not searched yet
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault(); // stop the form from reloading the page
    if (searching) return;
    setSearching(true);
    try {
      setResults(await searchPlace(query.trim()));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          className="min-w-0 flex-1 bg-transparent py-0.5 text-[15px] font-semibold outline-none placeholder:font-medium placeholder:text-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <button
          disabled={searching || query.trim().length < 3}
          className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white cursor-pointer disabled:opacity-30"
        >
          {searching ? "…" : "Search"}
        </button>
      </form>

      {results?.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">No places found. Try another name or tap the map.</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-2 divide-y divide-gray-200">
          {results.map((place, i) => {
            const [title, ...rest] = place.name.split(",");
            return (
              <button
                key={i}
                // keep a short name ("ABC, Achrafieh") for the trip box
                onClick={() => onSelect({ ...place, name: place.name.split(",").slice(0, 2).join(",") })}
                className="block w-full py-2 text-left cursor-pointer"
              >
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block truncate text-xs text-gray-500">{rest.join(",").trim()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}