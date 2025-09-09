import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import containerService from '../../firebase/container';

export const fetchContainers = createAsyncThunk(
  'containers/fetchContainers',
  async (_, { rejectWithValue }) => {
    try {
      const containers = await containerService.getAllContainers(); 
      return containers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const initialState = {
  data: [],
  status: 'idle',
  error: null,
};

const containersSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
     clearContainers: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
    setContainersStatus: (state, action) => {
        state.status = action.payload;
    }
  }, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchContainers.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.status = 'succeeded'; 
        state.data = action.payload;
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.payload;
      });
  },
});

export const { clearContainers, setContainersStatus } = containersSlice.actions;
export const selectAllContainers = (state) => state.containers.data;
export const selectContainerStatus = (state) => state.containers.status;

export default containersSlice.reducer;