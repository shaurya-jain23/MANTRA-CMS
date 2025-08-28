import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  userData: null, 
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

export const selectUser = (state) => state.user.userData;
export const selectIsLoggedIn = (state) => state.user.status

export default userSlice.reducer;