import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Will hold user info if logged in
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set user on login
    login: (state, action) => {
      state.user = action.payload;
    },
    // Action to clear user on logout
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = userSlice.actions;

// Selector to get the current user from the state
export const selectUser = (state) => state.user.user;

export default userSlice.reducer;