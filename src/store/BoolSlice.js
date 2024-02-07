import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarBool: true,
};

const boolSlice = createSlice({
  name: "bool",
  initialState,
  reducers: {
    setSidebarBool: (state, action) => {
      state.sidebarBool = action.payload;
    },
  },
});

export const { setSidebarBool } = boolSlice.actions;

export const selectSidebarBool = (state) => state.bool.sidebarBool;

export default boolSlice.reducer;
