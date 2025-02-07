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
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const t = useTranslate();
  const [departments, setDepartments] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState({
    departments: false,
    submit: false,
  });

  const schema = yup.object({
    parent_department_id: yup.number().required(t("required_field")),
    department_id: yup.number().required(t("required_field")),
    name: yup.string().required(t("required_field")),
    surname: yup.string().required(t("required_field")),
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_department_id: null,
      department_id: null,
      name: "",
      surname: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedParent) {
      const parent = departments.find((dept) => dept.id === selectedParent.id);
      setSubDepartments(parent?.subs || []);
      setValue("department_id", null);
    } else {
      setSubDepartments([]);
      setValue("department_id", null);
    }
  }, [selectedParent, departments]);

  const fetchDepartments = async () => {
    setLoading((prev) => ({ ...prev, departments: true }));
    try {
      const res = await controlPrivateApi.get(
        "/departments/list?with_subs=yes"
      );
      setDepartments(res.data.data);
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching departments",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const [pending, setPending] = useState(false);
  const nav = useNavigate();
  const onSubmit = async (data) => {
    setPending(true);
    try {
      const { parent_department_id, ...submitData } = data;
      const res = await controlPrivateApi.post("/users/add", submitData);
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error submitting form", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <MainCard title={t("new_user")} hasBackBtn={true}>
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
                  name="parent_department_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={selectedParent}
                      onChange={(_, newValue) => {
                        setSelectedParent(newValue);
                        field.onChange(newValue?.id);
                      }}
                      options={departments}
                      getOptionLabel={(option) => option.title}
                      loading={loading.departments}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.parent_department_id}
                          helperText={errors.parent_department_id?.message}
                          label={t("select_parent_department")}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading.departments && (
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
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        subDepartments.find(
                          (dept) => dept.id === field.value
                        ) || null
                      }
                      onChange={(_, newValue) => field.onChange(newValue?.id)}
                      options={subDepartments}
                      getOptionLabel={(option) => option.title}
                      disabled={!selectedParent || subDepartments.length === 0}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.department_id}
                          helperText={errors.department_id?.message}
                          label={t("select_sub_department")}
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
