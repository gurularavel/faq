import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import MainCard from "@components/card/MainCard";
import { notify } from "@src/utils/toast/notify";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
const editorConfiguration = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
    ],
  },
  heading: {
    options: [
      {
        model: "paragraph",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
      {
        model: "heading4",
        view: "h4",
        title: "Heading 4",
        class: "ck-heading_heading4",
      },
      {
        model: "heading5",
        view: "h5",
        title: "Heading 5",
        class: "ck-heading_heading5",
      },
      {
        model: "heading6",
        view: "h6",
        title: "Heading 6",
        class: "ck-heading_heading6",
      },
    ],
  },
};
export default function AddQuestion() {
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    tags: false,
    submit: false,
  });

  const schema = yup.object({
    category_id: yup.number().required(t("required_field")),
    translations: yup.array().of(
      yup.object({
        language_id: yup.number().required(),
        question: yup.string().required(t("required_field")),
        answer: yup.string().required(t("required_field")),
      })
    ),
    tags: yup.array().of(yup.number()).required(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category_id: null,
      translations: langs.map((lang) => ({
        language_id: lang.id,
        question: "",
        answer: "",
      })),
      tags: [],
    },
  });
  useEffect(() => {
    if (langs.length) {
      reset({
        category_id: null,
        translations: langs.map((lang) => ({
          language_id: lang.id,
          question: "",
          answer: "",
        })),
        tags: [],
      });
    }
  }, [langs]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const res = await controlPrivateApi.get("/categories/list");
      setCategories(res.data.data);
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching categories",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const fetchTags = async () => {
    setLoading((prev) => ({ ...prev, tags: true }));
    try {
      const res = await controlPrivateApi.get("/tags/list");
      setTags(res.data.data);
    } catch (error) {
      notify(error.response?.data?.message || "Error fetching tags", "error");
    } finally {
      setLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  const [pending, setPending] = useState(false);
  const nav = useNavigate();
  const onSubmit = async (data) => {
    setPending(true);
    try {
      const res = await controlPrivateApi.post("/faqs/add", data);
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error submitting form", "error");
    } finally {
      setPending((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <MainCard title={t("new_question")} hasBackBtn={true}>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box
            py={3}
            px={{ xs: 3, md: 10 }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">
                      {t("question_category")}
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Controller
                      name="category_id"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          value={
                            categories.find((cat) => cat.id === field.value) ||
                            null
                          }
                          onChange={(_, newValue) =>
                            field.onChange(newValue?.id)
                          }
                          options={categories}
                          getOptionLabel={(option) => option.title}
                          loading={loading.categories}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errors.category_id}
                              helperText={errors.category_id?.message}
                              placeholder={t("select_category")}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loading.categories && (
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
                </Grid2>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">{t("tags")}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          value={tags.filter((tag) =>
                            field.value.includes(tag.id)
                          )}
                          onChange={(_, newValue) =>
                            field.onChange(newValue.map((item) => item.id))
                          }
                          options={tags}
                          getOptionLabel={(option) => option.title}
                          loading={loading.tags}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errors.tags}
                              helperText={errors.tags?.message}
                              placeholder={t("select_tags")}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loading.tags && (
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
                </Grid2>
              </Grid2>

              {langs.map((lang, index) => (
                <React.Fragment key={index}>
                  <Grid2 size={{ xs: 12 }}>
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, md: 3 }}>
                        <Typography variant="body1">
                          {t("question")}
                          {langs.length > 1 && ` - ${lang.key}`}
                        </Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 9 }}>
                        <Controller
                          name={`translations.${index}.question`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={3}
                              error={!!errors.translations?.[index]?.question}
                              helperText={
                                errors.translations?.[index]?.question?.message
                              }
                            />
                          )}
                        />
                      </Grid2>
                    </Grid2>
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, md: 3 }}>
                        <Typography variant="body1">
                          {t("answer")}
                          {langs.length > 1 && ` - ${lang.key}`}
                        </Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 9 }}>
                        <Controller
                          name={`translations.${index}.answer`}
                          control={control}
                          render={({ field }) => (
                            <div
                              style={{
                                border: errors.translations?.[index]?.answer
                                  ? "1px solid #d32f2f"
                                  : "none",
                              }}
                            >
                              <CKEditor
                                editor={ClassicEditor}
                                config={editorConfiguration}
                                data={field.value}
                                onChange={(event, editor) => {
                                  try {
                                    const data = editor.getData();
                                    field.onChange(data);
                                  } catch (error) {
                                    console.error("CKEditor error:", error);
                                    notify("Error updating content", "error");
                                  }
                                }}
                                onError={(error) => {
                                  console.error("CKEditor error:", error);
                                  notify("Editor error occurred", "error");
                                }}
                              />
                              {errors.translations?.[index]?.answer && (
                                <Typography
                                  color="error"
                                  variant="caption"
                                  sx={{ mt: 1, display: "block" }}
                                >
                                  {
                                    errors.translations?.[index]?.answer
                                      ?.message
                                  }
                                </Typography>
                              )}
                            </div>
                          )}
                        />
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </React.Fragment>
              ))}

              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}></Grid2>
                  <Grid2
                    size={{ xs: 12, md: 9 }}
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
                        <CircularProgress
                          size={14}
                          sx={{ ml: 1 }}
                          color="error"
                        />
                      )}
                    </Button>
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}
