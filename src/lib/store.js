import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './newsSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    user: userReducer,
  },
}); 