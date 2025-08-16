import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  status: false, // 'idle' | 'loading' | 'succeeded' | 'failed'
  userData: null, // Will hold user info if logged in
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set user on login
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    // Action to clear user on logout
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
  },
});

export const { login, logout } = userSlice.actions;

// Selector to get the current user from the state
export const selectUser = (state) => state.user.userData;

export default userSlice.reducer;