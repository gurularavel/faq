import React from "react";
import { Outlet } from "react-router-dom";

export default function ControlLayout() {
  return (
    <>
      <h1>Header</h1>
      <h1>Sidebar</h1>
      <Outlet />
    </>
  );
}
