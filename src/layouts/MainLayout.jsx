import React from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <h1>Header</h1>
      <Outlet />
    </>
  );
}
