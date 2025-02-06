// AssignmentSuccess.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import successImg from "@assets/icons/success.svg"; // Make sure you have this asset
import { useTranslate } from "@src/utils/translations/useTranslate";

export const Success = ({
  selectedDepartments = [],
  selectedUsers = [],
  close,
}) => {
  const t = useTranslate();

  return (
    <Box
      sx={{ textAlign: "center" }}
      maxWidth={650}
      minWidth={{ xs: 300, md: 650 }}
    >
      <Box
        sx={{
          margin: "0 auto",
          width: "64px",
          height: "64px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          background: "#55D65329",
          marginTop: "-20px",
        }}
      >
        <img
          src={successImg}
          alt="success"
          style={{
            width: "48px",
            height: "48px",
          }}
        />
      </Box>

      <Typography variant="h6" gutterBottom mt={2}>
        {t("quiz_assigned_successfully")}
      </Typography>

      {selectedDepartments.length > 0 && (
        <Box sx={{ mt: 1, textAlign: "left" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t("assigned_departments")}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {selectedDepartments.map((dept) => dept.title).join(", ")}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {selectedUsers.length > 0 && (
        <Box sx={{ mt: 1, textAlign: "left" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t("assigned_users")}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {selectedUsers
              .map((user) => `${user.name} ${user.surname}`)
              .join(", ")}
          </Typography>
        </Box>
      )}

      <Button variant="contained" color="error" onClick={close} sx={{ mt: 4 }}>
        {t("close")}
      </Button>
    </Box>
  );
};
