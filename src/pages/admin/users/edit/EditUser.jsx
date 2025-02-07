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
  const [departments, setDepartments] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState({
    departments: false,
    userData: false,
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

  // First, fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Then, once departments are loaded, fetch user data
  useEffect(() => {
    if (departments.length > 0) {
      fetchUserData();
    }
  }, [departments]);

  // Update subdepartments when parent department changes
  useEffect(() => {
    if (selectedParent) {
      const parent = departments.find((dept) => dept.id === selectedParent.id);
      setSubDepartments(parent?.subs || []);
    } else {
      setSubDepartments([]);
    }
  }, [selectedParent, departments]);

  const fetchUserData = async () => {
    setLoading((prev) => ({ ...prev, userData: true }));
    try {
      const res = await controlPrivateApi.get(`/users/show/${id}`);
      const userData = res.data.data;

      // Find the parent department from the departments list
      const parentDept = departments.find(
        (dept) => dept.id === userData.department.parent.id
      );

      if (parentDept) {
        setSelectedParent(parentDept);
        setSubDepartments(parentDept.subs || []);
      }

      // Reset form with fetched data
      reset({
        parent_department_id: userData.department.parent.id,
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
      const res = await controlPrivateApi.post(
        `/users/update/${id}`,
        submitData
      );
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error updating user", "error");
    } finally {
      setPending(false);
    }
  };

  if (loading.userData || loading.departments) {
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
              {/* Parent Department Selection */}
              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="parent_department_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={
                        departments.find((dept) => dept.id === field.value) ||
                        null
                      }
                      onChange={(_, newValue) => {
                        setSelectedParent(newValue);
                        field.onChange(newValue?.id);
                        setValue("department_id", null);
                      }}
                      options={departments}
                      getOptionLabel={(option) => option.title}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.parent_department_id}
                          helperText={errors.parent_department_id?.message}
                          label={t("select_parent_department")}
                        />
                      )}
                    />
                  )}
                />
              </Grid2>

              {/* Sub Department Selection */}
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

              {/* Rest of the form fields */}
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
