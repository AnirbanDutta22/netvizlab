import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { CommandName } from "@netvizlab/shared";
import type { RootState } from "../../app/store";

export type ActivityLevel = "info" | "success" | "warning" | "error";

export interface ActivityEntry {
  readonly id: string;
  readonly command: CommandName;
  readonly level: ActivityLevel;
  readonly message: string;
  readonly timestamp: number;
}

interface ActivityLogState {
  entries: ActivityEntry[];
}

const initialState: ActivityLogState = { entries: [] };

const MAX_ENTRIES = 200;

type LogActivityInput = Omit<ActivityEntry, "id" | "timestamp">;

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState,
  reducers: {
    logActivity: {
      reducer: (state, action: PayloadAction<ActivityEntry>) => {
        state.entries.unshift(action.payload);
        if (state.entries.length > MAX_ENTRIES) {
          state.entries.length = MAX_ENTRIES;
        }
      },
      prepare: (entry: LogActivityInput) => ({
        payload: { ...entry, id: nanoid(), timestamp: Date.now() },
      }),
    },
    clearActivityLog: (state) => {
      state.entries = [];
    },
  },
});

export const { logActivity, clearActivityLog } = activityLogSlice.actions;

export const selectActivityEntries = (
  state: RootState,
): readonly ActivityEntry[] => state.activityLog.entries;

export default activityLogSlice.reducer;
