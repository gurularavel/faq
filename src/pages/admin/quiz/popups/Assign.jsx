import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { useTranslate } from "@src/utils/translations/useTranslate";

const schema = yup
  .object({
    departments: yup.array().of(yup.number()),
    users: yup.array().of(yup.number()),
  })
  .test("at-least-one", "Select at least one department or user", (value) => {
    return value.departments?.length > 0 || value.users?.length > 0;
  });

export default function Assign({ quizId, close, setModal, setSuccessData }) {
  const t = useTranslate();
  const [loading, setLoading] = useState({
    departments: false,
    users: false,
    submit: false,
    initialData: false,
  });

  const [options, setOptions] = useState({
    departments: [],
    users: [],
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      departments: [],
      users: [],
    },
  });

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
    fetchAssignedData();
  }, []);

  const fetchAssignedData = async () => {
    setLoading((prev) => ({ ...prev, initialData: true }));
    try {
      const res = await controlPrivateApi.get(
        `/question-groups/get-assigned-ids/${quizId}`
      );
      const { departments = [], users = [] } = res.data.data;

      setValue("departments", departments);
      setValue("users", users);
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching assigned data",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, initialData: false }));
    }
  };

  const fetchDepartments = async () => {
    setLoading((prev) => ({ ...prev, departments: true }));
    try {
      const res = await controlPrivateApi.get("/departments/list");
      setOptions((prev) => ({
        ...prev,
        departments: res.data.data,
      }));
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching departments",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const fetchUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const res = await controlPrivateApi.get("/users/list");
      setOptions((prev) => ({
        ...prev,
        users: res.data.data,
      }));
    } catch (error) {
      notify(error.response?.data?.message || "Error fetching users", "error");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const onSubmit = async (data) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const res = await controlPrivateApi.post(
        `/question-groups/assign/${quizId}`,
        data
      );

      const selectedDepartments = options.departments.filter((dept) =>
        data.departments.includes(dept.id)
      );
      const selectedUsers = options.users.filter((user) =>
        data.users.includes(user.id)
      );

      setSuccessData({
        selectedDepartments,
        selectedUsers,
      });

      setModal(5);

      notify(res.data.message, "success");
    } catch (error) {
      notify(error.response?.data?.message || "Error assigning quiz", "error");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  if (loading.initialData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ p: 2 }}
      maxWidth={650}
      minWidth={{ xs: 300, md: 650 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {t("departments")}
        </Typography>
        <Controller
          name="departments"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={options.departments}
              getOptionLabel={(option) => option.title}
              loading={loading.departments}
              value={options.departments.filter((dept) =>
                field.value.includes(dept.id)
              )}
              onChange={(_, newValue) => {
                field.onChange(newValue.map((item) => item.id));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.title}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.departments}
                  helperText={errors.departments?.message}
                  placeholder={t("select_departments")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading.departments && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {t("users")}
        </Typography>
        <Controller
          name="users"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={options.users}
              getOptionLabel={(option) => `${option.name} ${option.surname}`}
              loading={loading.users}
              value={options.users.filter((user) =>
                field.value.includes(user.id)
              )}
              onChange={(_, newValue) => {
                field.onChange(newValue.map((item) => item.id));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={`${option.name} ${option.surname}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.users}
                  helperText={errors.users?.message}
                  placeholder={t("select_users")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading.users && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Box>

      {(errors.departments || errors.users) &&
        !errors.departments?.message &&
        !errors.users?.message && (
          <Typography
            color="error"
            variant="caption"
            sx={{ display: "block", mb: 2 }}
          >
            {schema.fields?.message || t("select_at_least_one")}
          </Typography>
        )}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={loading.submit}
          sx={{ minWidth: "250px" }}
        >
          {t("assign")}
          {loading.submit && (
            <CircularProgress size={14} sx={{ ml: 1 }} color="inherit" />
          )}
        </Button>
      </Box>
    </Box>
  );
}
