'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNews, setCategory, setSearchQuery, setAuthor, setDateRange, clearFilters, setPage } from '@/lib/newsSlice';
import NewsCard from '@/components/NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';

const CATEGORIES = [
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology'
];

export default function Home() {
  const dispatch = useDispatch();
  const { 
    articles, 
    loading, 
    error, 
    selectedCategory, 
    searchQuery,
    author,
    dateRange,
    totalResults,
    currentPage,
    pageSize
  } = useSelector((state) => state.news);

  // Local state for search inputs
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localAuthorQuery, setLocalAuthorQuery] = useState(author);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Convert ISO strings to Date objects for the calendar
  const calendarDateRange = {
    from: dateRange.from ? parseISO(dateRange.from) : null,
    to: dateRange.to ? parseISO(dateRange.to) : null,
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / pageSize);

  // Initial fetch when component mounts
  useEffect(() => {
    dispatch(fetchNews({ 
      category: 'general',
      params: {
        articlesCount: 20,
        articlesSortBy: 'date',
        articlesSortByAsc: false
      }
    }));
  }, [dispatch]); // Empty dependency array means it runs only once on mount

  // Effect for subsequent fetches when filters change
  useEffect(() => {
    dispatch(fetchNews({ 
      category: selectedCategory,
      searchQuery,
      dateRange,
      author,
      params: {
        articlesCount: 20,
        articlesSortBy: 'date',
        articlesSortByAsc: false
      }
    }));
  }, [dispatch, selectedCategory, searchQuery, dateRange, author]);

  const handleCategoryChange = (category) => {
    dispatch(setCategory(category));
  };

  const handleSearch = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      dispatch(setSearchQuery(localSearchQuery));
    }
  };

  const handleAuthorChange = (e) => {
    setLocalAuthorQuery(e.target.value);
  };

  const handleAuthorSubmit = (e) => {
    if (e.key === 'Enter') {
      dispatch(setAuthor(localAuthorQuery));
    }
  };

  const handleDateRangeSelect = (range) => {
    if (range?.from) {
      // Convert Date objects to ISO strings before dispatching
      const serializedRange = {
        from: range.from.toISOString(),
        to: range.to ? range.to.toISOString() : null,
      };
      dispatch(setDateRange(serializedRange));
      setIsDatePickerOpen(false); // Close the date picker after selection
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalSearchQuery('');
    setLocalAuthorQuery('');
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchNews({ 
      category: selectedCategory,
      searchQuery,
      dateRange,
      author,
      page: newPage,
      params: {
        articlesCount: pageSize,
        articlesSortBy: 'date',
        articlesSortByAsc: false
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button
            onClick={() => dispatch(fetchNews({ category: selectedCategory }))}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <p className="text-muted-foreground mb-4">Total Articles: {totalResults}</p>
          
          {/* Search Bar */}
          <div className="w-full max-w-2xl mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search news... (Press Enter to search)"
                value={localSearchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchSubmit}
                className="pl-10 bg-card text-card-foreground"
              />
            </div>
          </div>

          {/* Filters */}
          <Card className="w-full max-w-4xl p-4 mb-6 bg-card text-card-foreground">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Author Filter */}
              <div>
                <Input
                  type="text"
                  placeholder="Filter by author (Press Enter to search)"
                  value={localAuthorQuery}
                  onChange={handleAuthorChange}
                  onKeyDown={handleAuthorSubmit}
                  className="bg-card text-card-foreground"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {calendarDateRange.from ? (
                        calendarDateRange.to ? (
                          <>
                            {format(calendarDateRange.from, "LLL dd, y")} -{" "}
                            {format(calendarDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(calendarDateRange.from, "LLL dd, y")
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
                      className="rounded-md border bg-card text-card-foreground"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </Card>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryChange(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            No articles found for the selected filters.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
