import React, { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import AddIcon from "@mui/icons-material/Add";
export default function QuestionsGroup() {
  const t = useTranslate();
  const { setContent } = useHeader();

  useEffect(() => {
    setContent(
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          size="small"
        >
          {t("new_question_group")}
        </Button>
      </Box>
    );

    return () => setContent(null);
  }, []);
  return <div>QuestionsGroup</div>;
}
