import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Grid2, Box } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useSelector } from "react-redux";

const Add = ({ setList, close }) => {
  const { langs } = useSelector((state) => state.lang);

  const t = useTranslate();
  const schema = yup.object({
    translations: yup.array().of(
      yup.object({
        language_id: yup.number().required(),
        title: yup.string().required(t("required_field")),
      })
    ),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      translations: langs.map((lang) => ({
        language_id: lang.id,
        title: "",
      })),
    },
  });
  const [pending, setPending] = useState(false);
  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    try {
      const res = await controlPrivateApi.post("/difficulty-levels/add", data);
      notify(res.data.message, "success");

      setList((prev) => ({ ...prev, list: [res.data.data, ...prev.list] }));

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
          {/* Key field */}
          <Grid2 item size={{ xs: 12 }}>
            {langs.map((lang, index) => (
              <Controller
                key={`title-${lang.id}`}
                name={`translations.${index}.title`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`${t("title")} ${
                      langs.length > 1 ? ` - ${lang.key}` : ""
                    }`}
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

export default Add;
