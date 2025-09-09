import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import containersReducer from '../features/containers/containersSlice';
import dealersReducer from '../features/dealers/dealersSlice';
import bookingsReducer from "../features/bookings/bookingsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    containers: containersReducer,
    dealers: dealersReducer,
    bookings: bookingsReducer
  },
});