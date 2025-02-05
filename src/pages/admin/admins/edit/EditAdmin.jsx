import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import MainCard from "@components/card/MainCard";
import { notify } from "@src/utils/toast/notify";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useNavigate, useParams } from "react-router-dom";

export default function EditAdmin() {
  const { id } = useParams();
  const t = useTranslate();
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState({
    roles: false,
    adminData: false,
    submit: false,
  });

  const schema = yup.object({
    username: yup.string().required(t("required_field")),
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
    password: yup
      .string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        t("password_requirements")
      ),
    roles: yup
      .array()
      .min(1, t("required_field"))
      .required(t("required_field")),
    name: yup.string().required(t("required_field")),
    surname: yup.string().required(t("required_field")),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roles: [],
      name: "",
      surname: "",
    },
  });

  useEffect(() => {
    fetchRoles();
    fetchAdminData();
  }, [id]);

  const fetchAdminData = async () => {
    setLoading((prev) => ({ ...prev, adminData: true }));
    try {
      const res = await controlPrivateApi.get(`/admins/show/${id}`);
      const adminData = res.data.data;

      reset({
        username: adminData.username,
        email: adminData.email,
        password: "",
        roles: adminData.roles,
        name: adminData.name,
        surname: adminData.surname,
      });
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching admin data",
        "error"
      );
      nav(-1);
    } finally {
      setLoading((prev) => ({ ...prev, adminData: false }));
    }
  };

  const fetchRoles = async () => {
    setLoading((prev) => ({ ...prev, roles: true }));
    try {
      const res = await controlPrivateApi.get("/roles/list");
      setRoles(res.data.data);
    } catch (error) {
      notify(error.response?.data?.message || "Error fetching roles", "error");
    } finally {
      setLoading((prev) => ({ ...prev, roles: false }));
    }
  };

  const [pending, setPending] = useState(false);
  const nav = useNavigate();
  const onSubmit = async (data) => {
    setPending(true);
    try {
      const submitData = {
        ...data,
        roles: data.roles.map((role) => role.id),
      };

      if (!submitData.password) {
        delete submitData.password;
      }

      const res = await controlPrivateApi.post(
        `/admins/update/${id}`,
        submitData
      );
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error updating admin", "error");
    } finally {
      setPending(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  if (loading.adminData) {
    return (
      <MainCard title={t("edit_admin")} hasBackBtn={true}>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={t("edit_admin")} hasBackBtn={true}>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box
            py={3}
            px={{ xs: 3, md: 20 }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid2 container spacing={4}>
              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("username")}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("name")}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="surname"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("surname")}
                      error={!!errors.surname}
                      helperText={errors.surname?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      label={t("password")}
                      error={!!errors.password}
                      helperText={
                        errors.password?.message ||
                        t("leave_empty_if_no_change")
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="roles"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      options={roles}
                      getOptionLabel={(option) => option.name}
                      loading={loading.roles}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.roles}
                          helperText={errors.roles?.message}
                          label={t("select_roles")}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading.roles && (
                                  <CircularProgress size={20} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Grid2>

              <Grid2
                size={{ xs: 12 }}
                display={"flex"}
                justifyContent={"center"}
              >
                <Button
                  type="submit"
                  color="error"
                  variant="contained"
                  sx={{ minWidth: "250px" }}
                  disabled={pending}
                >
                  {t("save")}
                  {pending && (
                    <CircularProgress size={14} sx={{ ml: 1 }} color="error" />
                  )}
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}
