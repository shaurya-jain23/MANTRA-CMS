import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import dealerService from "../../firebase/dealers";

export const fetchDealers = createAsyncThunk(
  "dealers/fetchDealers",
  async ({ role, userId }, { rejectWithValue }) => {
    try {
        return await dealerService.getDealers(userId, role);
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

const dealersSlice = createSlice({
  name: "dealers",
  initialState,
  reducers: {
    clearDealers: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
    setDealersStatus: (state, action) => {
        state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDealers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchDealers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDealers, setDealersStatus } = dealersSlice.actions;

export const selectAllDealers = (state) => state.dealers.data;
export const selectDealersStatus = (state) => state.dealers.status;

export default dealersSlice.reducer;
