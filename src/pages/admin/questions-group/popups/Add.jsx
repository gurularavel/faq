import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Grid2,
  Box,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useSelector } from "react-redux";

const AddCategory = ({ setList, close }) => {
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);
  const [pending, setPending] = useState(false);

  // Validation schema using Yup
  const schema = yup.object({
    parent_id: yup.number().nullable().notRequired(),
    translations: yup
      .array()
      .of(
        yup.object({
          language_id: yup.number().required(t("required_field")),
          title: yup.string().required(t("required_field")),
        })
      )
      .required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_id: null,
      translations: langs.map((lang) => ({
        language_id: lang.id,
        title: "",
      })),
    },
  });

  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    try {
      const res = await controlPrivateApi.post("/categories/add", data);

      notify(res.data.message, "success");
      setList((prev) => ({ ...prev, list: [res.data.data, ...prev.list] }));
      close();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error adding category",
          "error"
        );
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Box maxWidth={650} minWidth={{ xs: 300, md: 650 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          {/* Left Column */}
          <Grid2 item size={{ xs: 12 }}>
            {/* Titles */}
            {langs.map((lang, index) => (
              <Controller
                key={`title-${lang.id}`}
                name={`translations.${index}.title`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${t("title")} - ${lang.key}`}
                    fullWidth
                    error={
                      !!errors.translations &&
                      !!errors.translations[index]?.title
                    }
                    helperText={
                      errors.translations &&
                      errors.translations[index]?.title?.message
                    }
                    style={{ marginTop: "1rem" }}
                  />
                )}
              />
            ))}
          </Grid2>
          {/* Submit Button */}
          <Grid2 size={{ xs: 12 }} display={"flex"} justifyContent={"center"}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={pending}
              sx={{ minWidth: 250 }}
            >
              {t("save")}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Box>
  );
};

export default AddCategory;
