import { Box, Button, List, ListItem, Typography } from "@mui/material";
import React from "react";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { Link, useLocation } from "react-router-dom";

export default function ExamFinished() {
  const t = useTranslate();
  const { state } = useLocation();
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
        <List>
          {state?.total_questions_count && (
            <ListItem sx={{ padding: 1 }}>
              {t("total_questions_count")}: {state.total_questions_count}
            </ListItem>
          )}
          {(state?.correct_questions_count ||
            state?.correct_questions_count === 0) && (
            <ListItem sx={{ padding: 1 }}>
              {t("correct_questions_count")}: {state.correct_questions_count}
            </ListItem>
          )}
          {(state?.incorrect_questions_count ||
            state?.incorrect_questions_count === 0) && (
            <ListItem sx={{ padding: 1 }}>
              {t("incorrect_questions_count")}:{" "}
              {state.incorrect_questions_count}
            </ListItem>
          )}
          {state?.total_time_spent_formatted && (
            <ListItem sx={{ padding: 1 }}>
              {t("total_time_spent")}: {state.total_time_spent_formatted}
            </ListItem>
          )}
        </List>
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
