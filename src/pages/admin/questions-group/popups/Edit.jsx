import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Grid2, Box } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const EditCategory = ({ id, setList, close }) => {
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);

  const [pending, setPending] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [existingIcon, setExistingIcon] = useState(null);
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
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_id: null,
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
  // Fetch default data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await controlPrivateApi.get(`/categories/show/${id}`);
        const data = res.data.data;
        if (data.icon) {
          setExistingIcon(data.icon);
        }
        reset({
          parent_id: data.parent_id,
          icon: null,
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

      const res = await controlPrivateApi.post(
        `/categories/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
              {(iconPreview || existingIcon) && (
                <Box mt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                  <img
                    src={iconPreview || existingIcon}
                    alt="Icon preview"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                  {existingIcon && !iconPreview && (
                    <Box fontSize="0.75rem" color="text.secondary" mt={1}>
                      {t("current_icon")}
                    </Box>
                  )}
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

EditCategory.propTypes = {
  id: PropTypes.number.isRequired,
  setList: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default EditCategory;
