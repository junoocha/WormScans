"use client";

import { useState } from "react";

export type SeriesOption = { id: string; series_name: string };

interface SeriesDropdownProps {
  seriesList: SeriesOption[];
  selectedSeriesId: string;
  setSelectedSeriesId: (id: string) => void;
  placeholder?: string;
}

export default function SeriesDropdown({
  seriesList,
  selectedSeriesId,
  setSelectedSeriesId,
  placeholder = "Select a series...",
}: SeriesDropdownProps) {
  // track search query in input
  const [query, setQuery] = useState("");

  // track dropdown open/close state
  const [open, setOpen] = useState(false);

  // filter list by query
  const filtered = seriesList.filter((s) =>
    s.series_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full mb-4">
      {/* search input field */}
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full p-2 rounded bg-[var(--card-bg)]"
      />

      {/* dropdown list */}
      {open && (
        <ul className="absolute z-10 w-full max-h-40 overflow-y-auto mt-1 bg-[var(--card-bg)] rounded shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              // render each series option
              <li
                key={s.id}
                className="px-2 py-1 hover:bg-blue-500 cursor-pointer"
                onClick={() => {
                  setSelectedSeriesId(s.id);
                  setQuery(s.series_name);
                  setOpen(false);
                }}
              >
                {s.series_name}
              </li>
            ))
          ) : (
            // message when no results found
            <li className="px-2 py-1 text-gray-400">no results</li>
          )}
        </ul>
      )}
    </div>
  );
}
