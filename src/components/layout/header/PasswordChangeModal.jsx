import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslate } from "@src/utils/translations/useTranslate";
import {
  Modal,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@utils/toast/notify";

const schema = yup.object().shape({
  old_password: yup.string().required("required_field"),
  password: yup
    .string()
    .required("required_field")
    .min(8, "password_min_symbol"),
  password_confirmation: yup
    .string()
    .required("required_field")
    .oneOf([yup.ref("password")], "password_not_match"),
});

const PasswordChangeModal = ({ open, onClose }) => {
  const t = useTranslate();
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    password: false,
    password_confirmation: false,
  });
  const [pending, setPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      old_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data) => {
    try {
      setPending(true);
      const res = await controlPrivateApi.post(
        "/profile/change-password",
        data
      );
      notify(res.data.message, "success");
      onClose();
      reset();
    } catch (error) {
      notify(
        error.response.data.message || "Error changing password:",
        "error"
      );
    } finally {
      setPending(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="password-change-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" mb={3}>
          {t("change_password")}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {["old_password", "password", "password_confirmation"].map(
            (field) => (
              <Controller
                key={field}
                name={field}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      type={showPasswords[field] ? "text" : "password"}
                      label={t(`${field}`)}
                      value={value}
                      onChange={onChange}
                      error={!!errors[field]}
                      helperText={errors[field] ? t(errors[field].message) : ""}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => togglePasswordVisibility(field)}
                              edge="end"
                            >
                              {showPasswords[field] ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                )}
              />
            )
          )}
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}
          >
            <Button variant="outlined" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={pending}
            >
              {t("save")}
              {pending && (
                <CircularProgress size={14} sx={{ ml: 1 }} color="error" />
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default PasswordChangeModal;
