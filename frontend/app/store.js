import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import seedReducer from "../features/seed/seedSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seeds: seedReducer,
  },
});
