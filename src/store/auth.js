import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: localStorage.getItem("token") ? true : false,
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {
        id: 0,
        username: "",
        email: "",
        name: "",
        surname: "",
        profileImage: "",
        role_ids: [],
        roles: [],
      },
};

export const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    deAuthenticate: (state) => {
      state.isLoggedIn = false;
      state.user = {
        id: 0,
        username: "",
        email: "",
        name: "",
        surname: "",
        profileImage: "",

        role_ids: [],
        roles: [],
      };
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    authenticate: (state, action) => {
      const { token, data } = action.payload;
      localStorage.setItem("token", token);

      const userDetails = {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name,
        surname: data.surname,
        profileImage: "",

        role_ids: data?.role_ids ?? [0],
        roles: data.roles ?? [],
      };

      state.isLoggedIn = true;
      state.user = userDetails;

      localStorage.setItem("user", JSON.stringify(userDetails));
    },
  },
});

export const { deAuthenticate, authenticate } = authSlice.actions;

export default authSlice.reducer;
