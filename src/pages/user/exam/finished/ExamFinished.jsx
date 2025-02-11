import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { Link } from "react-router-dom";

export default function ExamFinished() {
  const t = useTranslate();
  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 120px)",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0px 4px 4px 0px #00000040",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "5rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Typography variant="h4" color="initial">
          {t("exam_finished_title")}
        </Typography>
        <Typography variant="body1" color="initial" align="center">
          {t("exam_finished_body")}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="error"
        component={Link}
        to={`/user/exams`}
      >
        {t("go_to_exams")}
      </Button>
    </Box>
  );
}
