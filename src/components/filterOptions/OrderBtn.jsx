import { Button, IconButton } from "@mui/material";
import React from "react";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
export default function OrderBtn({ column, data, setData }) {
  const changeOrdering = () => {
    const isCurrentColumn = data?.sort === column;
    let newDirection;

    if (!isCurrentColumn) {
      newDirection = "asc";
    } else {
      newDirection =
        data?.sort_type === "asc"
          ? "desc"
          : data?.sort_type === "desc"
          ? null
          : "asc";
    }

    setData({
      ...data,
      sort: newDirection ? column : null,
      sort_type: newDirection,
    });
  };

  return (
    <IconButton
      size="small"
      onClick={changeOrdering}
      sx={{ borderRadius: "0px", ml: 0.5 }}
    >
      <NorthIcon
        sx={{ fontSize: "16px", marginRight: "-4px" }}
        color={
          data?.sort == column && data?.sort_type == "asc" ? "error" : "light"
        }
      />
      <SouthIcon
        sx={{ fontSize: "16px", marginLeft: "-4px" }}
        color={
          data?.sort == column && data?.sort_type == "desc" ? "error" : "light"
        }
      />
    </IconButton>
  );
}
