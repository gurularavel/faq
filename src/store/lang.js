import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  langs: JSON.parse(localStorage.getItem("langs")) ?? [],
  currentLang: JSON.parse(localStorage.getItem("lang"))?.key ?? "az",
  static_words: JSON.parse(localStorage.getItem("static_words")) ?? {},
  lang_version: localStorage.getItem("lang_version") ?? null,
  lang_type: localStorage.getItem("lang_type") ?? null,
};

export const langSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setLangs: (state, action) => {
      state.langs = action.payload;
      localStorage.setItem("langs", JSON.stringify(action.payload));
      if (!localStorage.getItem("lang")) {
        localStorage.setItem("lang", JSON.stringify(action.payload[0]));
      }
    },
    setCurrentLang: (state, action) => {
      localStorage.setItem("oldLang", state.currentLang);
      state.currentLang = action.payload;
      let l = state.langs.find((e) => e.key == action.payload);
      localStorage.setItem("lang", JSON.stringify(l));
    },
    setStaticWords: (state, action) => {
      const { version, translations } = action.payload;
      state.static_words = translations;
      localStorage.setItem("static_words", JSON.stringify(translations));
      state.lang_version = version;
      localStorage.setItem("lang_version", version);
    },
    addStaticWord: (state, action) => {
      const { key, text } = action.payload;
      let newArr = { ...state.static_words, [key]: text };
      state.static_words = newArr;
      localStorage.setItem("static_words", JSON.stringify(newArr));
    },
  },
});

export const { setLangs, setCurrentLang, setStaticWords, addStaticWord } =
  langSlice.actions;

export default langSlice.reducer;
