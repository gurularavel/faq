import { configureStore } from "@reduxjs/toolkit";
import auth from "./auth";
import lang from "./lang";
import site from "./site";

export const store = configureStore({
  reducer: {
    site,
    auth,
    lang,
  },
});
