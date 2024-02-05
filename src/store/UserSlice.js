import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  photo: "",
};

const userSlice = createSlice({
    name: "user", // Name of the slice
    initialState, // Initial state
    reducers: {
      // Reducer to set user login details
      setUserLoginDetails: (state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.photo = action.payload.photo;
      },
  
      // Reducer to set sign-out state
      setSignOutState: (state) => {
        state.name = null;
        state.email = null;
        state.photo = null;
      },
    },
  });
  
  // Export the actions generated by the userSlice
  export const { setUserLoginDetails, setSignOutState } = userSlice.actions;
  
  // Selectors to retrieve specific user information from the state
  export const selectUserName = (state) => state.user.name;
  export const selectUserEmail = (state) => state.user.email;
  export const selectUserPhoto = (state) => state.user.photo;
  
  // Export the reducer generated by the userSlice
  export default userSlice.reducer;