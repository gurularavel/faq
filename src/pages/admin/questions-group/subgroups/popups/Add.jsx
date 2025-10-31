import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Grid2, Box } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

const AddCategory = ({ setList, close }) => {
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);
  const [pending, setPending] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const { id } = useParams();
  // Validation schema using Yup
  const schema = yup.object({
    parent_id: yup.number().nullable().notRequired(),
    icon: yup.mixed().nullable().notRequired(),
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_id: id,
      icon: null,
      translations: langs.map((lang) => ({
        language_id: lang.id,
        title: "",
      })),
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("icon", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (pending) return;
    setPending(true);
    try {
      const formData = new FormData();
      formData.append("parent_id", data.parent_id || "");
      if (data.icon) {
        formData.append("icon", data.icon);
      }
      
      // Append translations as individual form-data fields
      data.translations.forEach((translation, index) => {
        formData.append(`translations[${index}][language_id]`, translation.language_id);
        formData.append(`translations[${index}][title]`, translation.title);
      });

      const res = await controlPrivateApi.post("/categories/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
            {/* Icon Field */}
            <Box style={{ marginTop: "1rem" }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ padding: "15px", justifyContent: "flex-start" }}
              >
                {t("icon")} - {t("choose_file")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {iconPreview && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </Box>
              )}
              {errors.icon && (
                <Box color="error.main" fontSize="0.75rem" mt={0.5} ml={1.75}>
                  {errors.icon.message}
                </Box>
              )}
            </Box>
            
            {/* Titles */}
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

AddCategory.propTypes = {
  setList: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default AddCategory;
