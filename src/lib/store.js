import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import guardianReducer from './guardianSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    guardian: guardianReducer,
  },
}); 