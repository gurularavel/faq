import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import MainCard from "@components/card/MainCard";
import { notify } from "@src/utils/toast/notify";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUser() {
  const { id } = useParams();
  const t = useTranslate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    userData: false,
    submit: false,
  });

  const schema = yup.object({
    department_id: yup.number().required(t("required_field")),
    name: yup.string().required(t("required_field")),
    surname: yup.string().required(t("required_field")),
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      department_id: null,
      name: "",
      surname: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading((prev) => ({ ...prev, userData: true }));
    try {
      const res = await controlPrivateApi.get(`/users/show/${id}`);
      const userData = res.data.data;

      // Reset form with fetched data
      reset({
        department_id: userData.department.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
      });
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching user data",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, userData: false }));
    }
  };

  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const res = await controlPrivateApi.get("/departments/list");
      setCategories(res.data.data);
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching categories",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const [pending, setPending] = useState(false);
  const nav = useNavigate();
  const onSubmit = async (data) => {
    setPending(true);
    try {
      const res = await controlPrivateApi.post(`/users/update/${id}`, data);
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error updating user", "error");
    } finally {
      setPending(false);
    }
  };

  if (loading.userData) {
    return (
      <MainCard title={t("edit_user")} hasBackBtn={true}>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={t("edit_user")} hasBackBtn={true}>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box
            py={3}
            px={{ xs: 3, md: 20 }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        categories.find((cat) => cat.id === field.value) || null
                      }
                      onChange={(_, newValue) => field.onChange(newValue?.id)}
                      options={categories}
                      getOptionLabel={(option) => option.title}
                      loading={loading.categories}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.category_id}
                          helperText={errors.category_id?.message}
                          label={t("select_category")}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading.categories && (
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
