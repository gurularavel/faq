import { Box, Button } from "@mui/material";
import React from "react";
import LeftIcon from "@assets/icons/arrow-left.svg";
import { useNavigate } from "react-router-dom";
export default function MainCard({ children, title, hasBackBtn = false }) {
  const nav = useNavigate("/");
  return (
    <Box className="main-card">
      <Box className="main-card-title">
        <span>{title}</span>
        {hasBackBtn && (
          <Button className="back-btn" onClick={() => nav(-1)}>
            <img src={LeftIcon} alt="left icon" />
            Back
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
}
