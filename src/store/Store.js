import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserSlice";
import boolReducer from "./BoolSlice";
import helpReducer from "./HelpSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    bool: boolReducer,
    help: helpReducer,
  },
  middleware: (getDefaultMiddleware) => {
  
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    });

  
    return middleware;
  },
});
