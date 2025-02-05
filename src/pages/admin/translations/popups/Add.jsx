import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid2,
  Box,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useDispatch } from "react-redux";
import { addStaticWord } from "@src/store/lang";
import { useTranslate } from "@src/utils/translations/useTranslate";

// Validation schema using Yup
const schema = yup.object({
  key: yup.string().required("Key is required"),
  group: yup.string().required("Group is required"),
  translations: yup.array().of(
    yup.object({
      language_id: yup.number().required("Language ID is required"),
      text: yup.string().required("Translation text is required"),
    })
  ),
});

const Add = ({ langs, setList, close }) => {
  const t = useTranslate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      key: "",
      group: "",
      translations: langs.map((lang) => ({ language_id: lang.id, text: "" })),
    },
  });
  const dispatch = useDispatch();
  const lang = JSON.parse(localStorage.getItem("lang"));
  const [pending, setPending] = useState(false);
  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    data.key = data.key.toLowerCase();
    try {
      const res = await controlPrivateApi.post("/translations/add", data);
      notify(res.data.message, "success");
      let tempData = {
        group: data.group,
        key: data.key,
      };
      data.translations.forEach((e) => {
        let lang = langs.find((l) => l.id == e.language_id);
        tempData[`lang_${lang.key}`] = e.text;
      });
      setList((prev) => [tempData, ...prev]);
      dispatch(
        addStaticWord({
          key: data.key,
          text: data.translations.find((e) => e.language_id == lang.id)?.text,
        })
      );
      close();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response.data.message, "error");
      }

      console.log(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Box maxWidth={400}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          {/* Key field */}
          <Grid2 item size={{ xs: 12 }}>
            <Controller
              name="key"
              control={control}
              render={({ field }) => (
                <TextField
                  value={field.value}
                  onChange={field.onChange}
                  label={t("key")}
                  fullWidth
                  error={!!errors.key}
                  helperText={errors.key ? errors.key.message : ""}
                />
              )}
            />
          </Grid2>

          {/* Group Select field */}
          <Grid2 item size={{ xs: 12 }}>
            <Controller
              name="group"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.group}>
                  <InputLabel>{t("group")}</InputLabel>
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label={t("group")}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="app">App</MenuItem>
                  </Select>
                  {errors.group && <p>{errors.group.message}</p>}
                </FormControl>
              )}
            />
          </Grid2>

          {/* Translations Fields */}
          <Grid2 item size={{ xs: 12 }}>
            <h4>{t("translations")}</h4>
            <Grid2 container spacing={2}>
              {langs.map((lang, index) => (
                <Grid2 item size={{ xs: 12 }} key={lang.id}>
                  <Controller
                    name={`translations.${index}.text`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        value={field.value}
                        onChange={field.onChange}
                        label={`${t("translation")} (${lang.key})`}
                        fullWidth
                        error={
                          errors.translations &&
                          errors.translations[index]?.text
                        }
                        helperText={
                          errors.translations &&
                          errors.translations[index]?.text?.message
                        }
                      />
                    )}
                  />
                </Grid2>
              ))}
            </Grid2>
          </Grid2>

          {/* Submit Button */}
          <Grid2 item size={{ xs: 12 }}>
            <Button type="submit" variant="contained" color="primary">
              {t("submit")}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Box>
  );
};

export default Add;
