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

const EditQuiz = ({ id, setList, close }) => {
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
    reset,
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
  console.log(errors);
  // Fetch default data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await controlPrivateApi.get(`/categories/show/${id}`);
        const data = res.data.data;
        reset({
          parent_id: data.parent_id,
          translations: data.translations.map((translation) => ({
            language_id: translation.language_id,
            title: translation.title,
          })),
        });
      } catch (error) {
        if (isAxiosError(error)) {
          notify(
            error.response?.data?.message || "Error fetching category data",
            "error"
          );
        }
      }
    };

    fetchCategoryData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    try {
      const res = await controlPrivateApi.post(
        `/categories/update/${id}`,
        data
      );

      notify(res.data.message, "success");
      setList((prev) => ({
        ...prev,
        list: [
          ...prev.list.map((item) => (item.id === id ? res.data.data : item)),
        ],
      }));
      close();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error updating category",
          "error"
        );
      }
      console.log(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Box maxWidth={800}>
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

export default EditQuiz;
