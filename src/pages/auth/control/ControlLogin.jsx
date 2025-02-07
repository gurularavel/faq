import React, { useState } from "react";
import { controlApi } from "@src/utils/axios/controlApi";
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
import { authenticate } from "../../../store/auth";

export default function Login() {
  useLanguage("control");

  const dispatch = useDispatch();
  const t = useTranslate();
  const nav = useNavigate();
  const schema = yup.object().shape({
    username: yup.string().required(t("required_field")),
    password: yup.string().required(t("required_field")),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
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
      const res = await controlApi.post("/login", {
        ...data,
        device_type: "web",
      });
      dispatch(authenticate(res.data));
      nav("/control");
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
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                fullWidth
                label={t("label_username")}
                error={!!errors.username}
                helperText={errors.username?.message}
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

          <Box mb={1} display={"flex"} justifyContent={"flex-end"}>
            <Link to={"/"} className="text-link">
              {t("forgot_password")}
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="error"
            disabled={pending}
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
