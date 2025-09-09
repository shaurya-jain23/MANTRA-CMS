import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookingService from "../../firebase/bookings";

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      return await bookingService.getBookings(userId, role);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  data: [],
  status: "idle",
  error: null,
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
    setBookingsStatus: (state, action) => {
        state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearBookings, setBookingsStatus } = bookingSlice.actions;

export const selectAllBookings = (state) => state.bookings.data;
export const selectBookingsStatus = (state) => state.bookings.status;

export default bookingSlice.reducer;
