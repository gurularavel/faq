import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Grid2, Box } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";

const Edit = ({ setList, close, id }) => {
  const t = useTranslate();
  const schema = yup.object({
    key: yup.string().required(t("required_field")),
    title: yup.string().required(t("required_field")),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      key: "",
      title: "",
    },
  });

  const [pending, setPending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await controlPrivateApi.get(`/languages/show/${id}`);
        reset({
          title: res.data.data.title,
          key: res.data.data.key,
        });
      } catch (error) {
        if (isAxiosError(error)) {
          notify(error.response.data.message, "error");
        }
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    try {
      const res = await controlPrivateApi.post(`/languages/update/${id}`, data);
      notify(res.data.message, "success");

      setList((prev) => ({
        ...prev,
        list: prev.list.map((item) => (item.id === id ? res.data.data : item)),
      }));

      close();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response.data.message, "error");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Box maxWidth={800} minWidth={{ xs: 300, md: 650 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={6}>
          <Grid2 item size={{ xs: 12 }}>
            <Controller
              name="key"
              control={control}
              render={({ field }) => (
                <TextField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={"Key"}
                  fullWidth
                  error={!!errors.key}
                  helperText={errors.key ? errors.key.message : ""}
                />
              )}
            />
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("add_new_language")}
                  fullWidth
                  sx={{ mt: 2 }}
                  error={!!errors.title}
                  helperText={errors.title ? errors.title.message : ""}
                />
              )}
            />
          </Grid2>

          <Grid2
            item
            size={{ xs: 12 }}
            display={"flex"}
            justifyContent={"center"}
          >
            <Button
              type="submit"
              variant="contained"
              color="error"
              sx={{ minWidth: "300px" }}
            >
              {t("save")}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Box>
  );
};

export default Edit;
