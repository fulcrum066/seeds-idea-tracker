import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import seedReducer from "../features/seed/seedSlice";
import taskReducer from "../features/task/taskSlice";
import mediaReducer from "../features/media/mediaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seeds: seedReducer,
    tasks: taskReducer,
    media: mediaReducer,
  },
});
