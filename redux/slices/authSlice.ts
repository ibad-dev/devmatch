import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  username?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  isVerified?: boolean;
  socials?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  projects?: string[]; // Array of project IDs
  connections?: string[]; // Array of user IDs
  profileCompleted?: boolean;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
