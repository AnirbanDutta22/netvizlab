import { configureStore } from "@reduxjs/toolkit";
import activityLogReducer from "../shared/store/activity-log.slice";

export const store = configureStore({
  reducer: {
    activityLog: activityLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
