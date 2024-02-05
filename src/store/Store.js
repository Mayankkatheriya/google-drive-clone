import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => {
    // Disable the serializableCheck middleware to allow non-serializable values in the Redux state
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    });

    // Add any additional middleware here if needed

    // Return the modified middleware
    return middleware;
  },
});
