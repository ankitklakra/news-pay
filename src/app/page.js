'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGuardianNews, setSearchQuery, setAuthor, setDateRange, clearFilters } from '@/lib/guardianSlice';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, User, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Home() {
  const dispatch = useDispatch();
  const { articles, loading, error, totalResults, searchQuery, author, dateRange } = useSelector((state) => state.guardian);
  
  // Local state for search inputs
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localAuthorQuery, setLocalAuthorQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Fetch news on initial load
  useEffect(() => {
    dispatch(fetchGuardianNews({}));
  }, [dispatch]);

  // Fetch news when filters change
  useEffect(() => {
    dispatch(fetchGuardianNews({ searchQuery, author, dateRange }));
  }, [dispatch, searchQuery, author, dateRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearchQuery));
  };

  const handleAuthorSearch = (e) => {
    e.preventDefault();
    dispatch(setAuthor(localAuthorQuery));
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'search') {
        dispatch(setSearchQuery(localSearchQuery));
      } else if (type === 'author') {
        dispatch(setAuthor(localAuthorQuery));
      }
    }
  };

  const handleDateRangeSelect = (range) => {
    if (!range) {
      dispatch(setDateRange({ from: null, to: null }));
      setIsDatePickerOpen(false);
      return;
    }

    // Ensure we have valid dates
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;

    // Convert to ISO strings for Redux
    const serializedRange = {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null
    };

    console.log('Setting date range:', serializedRange); // Debug log
    dispatch(setDateRange(serializedRange));
    setIsDatePickerOpen(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalSearchQuery('');
    setLocalAuthorQuery('');
  };

  // Convert ISO strings back to Date objects for the Calendar component
  const calendarDateRange = {
    from: dateRange.from ? new Date(dateRange.from) : undefined,
    to: dateRange.to ? new Date(dateRange.to) : undefined
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      
      {/* Search and Filters Section */}
      <Card className="p-6 mb-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search news... (Press Enter)"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'search')}
              className="pl-10"
            />
          </form>

          {/* Author Search */}
          <form onSubmit={handleAuthorSearch} className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by author... (Press Enter)"
              value={localAuthorQuery}
              onChange={(e) => setLocalAuthorQuery(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'author')}
              className="pl-10"
            />
          </form>

          {/* Date Range Picker */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(new Date(dateRange.from), "LLL dd, y")} -{" "}
                      {format(new Date(dateRange.to), "LLL dd, y")}
                    </>
                  ) : (
                    format(new Date(dateRange.from), "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={calendarDateRange.from}
                selected={calendarDateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || author || dateRange.from) && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">Found {totalResults} articles</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* News Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {article.urlToImage && (
                <div className="relative w-full h-48">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400?text=No+Image+Available';
                    }}
                  />
                  {article.source.name === 'The Guardian' && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      Guardian
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>
                </h2>
                {article.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                )}
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{article.source.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  {article.author && (
                    <p className="text-sm text-gray-500">
                      By {article.author.replace(/^By\s+/i, '')}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Read full article
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}