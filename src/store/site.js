import { createSlice } from "@reduxjs/toolkit";

const headerSlice = createSlice({
  name: "header",
  initialState: {
    content: null,
  },
  reducers: {
    setHeaderContent: (state, action) => {
      state.content = action.payload;
    },
  },
});

export const { setHeaderContent } = headerSlice.actions;
export default headerSlice.reducer;
