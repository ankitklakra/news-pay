import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching news from Guardian API
export const fetchGuardianNews = createAsyncThunk(
  'guardian/fetchNews',
  async ({ searchQuery = '', author = '', dateRange = null, pageSize = 30 }, { rejectWithValue }) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GUARDIAN_API_KEY;
      if (!apiKey) {
        throw new Error('Guardian API key is not configured');
      }

      let url = `https://content.guardianapis.com/search?api-key=${apiKey}&show-fields=thumbnail,bodyText,byline&page-size=${pageSize}`;

      // Add search query if provided
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      // Add author filter if provided
      if (author) {
        url += `&byline=${encodeURIComponent(author)}`;
      }

      // Add date range if provided
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        const formattedFromDate = fromDate.toISOString().split('T')[0];
        url += `&from-date=${formattedFromDate}`;
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        const formattedToDate = toDate.toISOString().split('T')[0];
        url += `&to-date=${formattedToDate}`;
      }

      console.log('Fetching Guardian news with URL:', url); // Debug log

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch news');
      }

      if (!data.response?.results) {
        throw new Error('Invalid response format from Guardian API');
      }

      return {
        articles: data.response.results.map(article => ({
          title: article.webTitle,
          description: article.fields?.bodyText?.substring(0, 200) || '',
          url: article.webUrl,
          urlToImage: article.fields?.thumbnail || null,
          publishedAt: article.webPublicationDate,
          author: article.fields?.byline || null,
          source: {
            name: 'The Guardian'
          }
        })),
        totalResults: data.response.total
      };
    } catch (error) {
      console.error('Guardian API Error:', error); // Debug log
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  articles: [],
  loading: false,
  error: null,
  totalResults: 0,
  searchQuery: '',
  author: '',
  dateRange: {
    from: null,
    to: null
  }
};

const guardianSlice = createSlice({
  name: 'guardian',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setAuthor: (state, action) => {
      state.author = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.author = '';
      state.dateRange = {
        from: null,
        to: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuardianNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuardianNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.totalResults = action.payload.totalResults;
      })
      .addCase(fetchGuardianNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchQuery, setAuthor, setDateRange, clearFilters } = guardianSlice.actions;
export default guardianSlice.reducer; 