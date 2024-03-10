//------- HelpSlice.js -------->
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openHelp: false,
};

const helpSlice = createSlice({
  name: "help",
  initialState,
  reducers: {
    setHelpModal: (state, action) => {
      state.openHelp = action.payload;
    },
  },
});

export const { setHelpModal } = helpSlice.actions;

export const selectHelpModal = (state) => state.help.openHelp;

export default helpSlice.reducer;
