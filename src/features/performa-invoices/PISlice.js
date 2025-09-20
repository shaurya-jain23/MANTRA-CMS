import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import piService from "../../firebase/piService";

export const fetchPis = createAsyncThunk(
  "pi/fetchPis",
  async ({ role, userId }, { rejectWithValue }) => {
    try {
      console.log('hele', role, userId);
      
        const pidata =  await piService.getPIs(userId, role);
        console.log(pidata);
        
        return pidata;
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

const PISlice = createSlice({
  name: "performa_invoices",
  initialState,
  reducers: {
    clearPIs: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
    setPIStatus: (state, action) => {
        state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPis.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPis.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchPis.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearPIs, setPIStatus } = PISlice.actions;

export const selectAllPIs = (state) => state.performa_invoices.data;
export const selectPIStatus = (state) => state.performa_invoices.status;

export default PISlice.reducer;
