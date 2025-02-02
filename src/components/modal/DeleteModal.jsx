import React from "react";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { Box, Button, Typography } from "@mui/material";

export default function DeleteModal({ close, onSuccess }) {
  const t = useTranslate();
  return (
    <Box
      width={400}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <Typography
        variant="p"
        color="initial"
        textAlign={"center"}
        fontWeight={600}
      >
        {t("are_you_sure_to_delete")}
      </Typography>
      <Box
        width={"100%"}
        marginTop={"20px"}
        display={"flex"}
        gap={"12px"}
        justifyContent={"center"}
      >
        <Button variant="contained" color="success" onClick={onSuccess}>
          {t("yes")}
        </Button>
        <Button variant="contained" color="error" onClick={close}>
          {t("no")}
        </Button>
      </Box>
    </Box>
  );
}
