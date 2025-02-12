import React, { useState } from "react";
import { userApi } from "@src/utils/axios/userApi";
import { notify } from "@utils/toast/notify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@utils/translations/useTranslate";
import { isAxiosError } from "axios";
import useLanguage from "@hooks/useLanguage";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { authenticate } from "@src/store/auth";
export default function Login() {
  useLanguage("app");
  const nav = useNavigate();
  const dispatch = useDispatch();

  const t = useTranslate();
  const schema = yup.object().shape({
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
    password: yup.string().required(t("required_field")),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setPending(true);
    try {
      const res = await userApi.post("/login", {
        ...data,
        device_type: "web",
      });
      dispatch(authenticate(res.data));

      nav("/user");
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response.data?.message, "error");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <CardContent>
      <Box className="auth-form">
        <Typography
          component="h1"
          variant="h1"
          align="center"
          sx={{
            mb: 1,
            fontWeight: 600,
          }}
        >
          {t("login")}
        </Typography>

        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          {t("login_info")}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                fullWidth
                label={t("label_email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                fullWidth
                label={t("label_password")}
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="error"
            disabled={pending}
            sx={{ mt: 2 }}
          >
            {t("sign_in")}
            {pending && (
              <CircularProgress size={14} sx={{ ml: 1 }} color="error" />
            )}
          </Button>
        </Box>
      </Box>
    </CardContent>
  );
}
