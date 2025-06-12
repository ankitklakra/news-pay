import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ category, searchQuery, dateRange, author, page = 1, params = {} }) => {
    const queryParams = {
      apiKey: NEWS_API_KEY,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20,
      page: page,
      ...params,
    };

    // For top-headlines endpoint (country-specific news)
    if (!searchQuery && !dateRange?.from && !dateRange?.to) {
      queryParams.country = 'us';
      // Add category if specified
      if (category && category !== 'general') {
        queryParams.category = category;
      }
      const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
        params: queryParams,
      });
      return response.data;
    }

    // For everything endpoint (search and filters)
    if (searchQuery) queryParams.q = searchQuery;
    if (dateRange?.from) queryParams.from = dateRange.from.slice(0, 10);
    if (dateRange?.to) queryParams.to = dateRange.to.slice(0, 10);
    if (category && category !== 'general') {
      queryParams.q = queryParams.q ? `${queryParams.q} ${category}` : category;
    }
    if (author) {
      queryParams.q = queryParams.q ? `${queryParams.q} author:"${author}"` : `author:"${author}"`;
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: queryParams,
    });
    return response.data;
  }
);

const initialState = {
  articles: [],
  allArticles: [], // Store all fetched articles
  loading: false,
  error: null,
  selectedCategory: 'general',
  searchQuery: '',
  author: '',
  dateRange: {
    from: null,
    to: null,
  },
  totalResults: 0,
  currentPage: 1,
  pageSize: 20,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setAuthor: (state, action) => {
      state.author = action.payload;
      // Filter articles based on author search in all fields
      if (action.payload) {
        const searchTerm = action.payload.toLowerCase();
        state.articles = state.allArticles.filter(
          (article) =>
            (article.author && article.author.toLowerCase().includes(searchTerm)) ||
            (article.title && article.title.toLowerCase().includes(searchTerm)) ||
            (article.description && article.description.toLowerCase().includes(searchTerm)) ||
            (article.content && article.content.toLowerCase().includes(searchTerm))
        );
        state.totalResults = state.articles.length;
      } else {
        // If no author filter, show all articles
        state.articles = state.allArticles;
        state.totalResults = state.allArticles.length;
      }
    },
    setDateRange: (state, action) => {
      if (!action.payload) {
        state.dateRange = { from: null, to: null };
        return;
      }
      state.dateRange = {
        from: action.payload.from || null,
        to: action.payload.to || null,
      };
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.author = '';
      state.dateRange = { from: null, to: null };
      state.selectedCategory = 'general';
      state.currentPage = 1;
      state.articles = state.allArticles;
      state.totalResults = state.allArticles.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.allArticles = action.payload.articles || [];
        
        // Apply author filter if it exists
        if (state.author) {
          const searchTerm = state.author.toLowerCase();
          state.articles = state.allArticles.filter(
            (article) =>
              (article.author && article.author.toLowerCase().includes(searchTerm)) ||
              (article.title && article.title.toLowerCase().includes(searchTerm)) ||
              (article.description && article.description.toLowerCase().includes(searchTerm)) ||
              (article.content && article.content.toLowerCase().includes(searchTerm))
          );
          state.totalResults = state.articles.length;
        } else {
          state.articles = state.allArticles;
          state.totalResults = action.payload.totalResults;
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCategory, setSearchQuery, setAuthor, setDateRange, clearFilters, setPage } = newsSlice.actions;
export default newsSlice.reducer; 