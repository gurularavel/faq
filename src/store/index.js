import { configureStore } from "@reduxjs/toolkit";
import auth from "./auth";
import lang from "./lang";

export const store = configureStore({
  reducer: {
    auth,
    lang,
  },
});
