import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserSlice";
import boolReducer from "./BoolSlice";

//----- Configure Redux store -------->
export const store = configureStore({
  reducer: {
    user: userReducer,
    bool: boolReducer,
  },
  middleware: (getDefaultMiddleware) => {
    //----- Disable the serializableCheck middleware to allow non-serializable values in the Redux state -------->
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    });

    //----- Return the modified middleware -------->
    return middleware;
  },
});
