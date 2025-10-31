import React, { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  Chip,
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
import CloseIcon from "@mui/icons-material/Close";
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [loading, setLoading] = useState({
    categories: false,
    tags: false,
    submit: false,
  });

  const schema = yup.object({
    parent_category_ids: yup.array().of(yup.number()).min(1, t("required_field")).required(t("required_field")),
    category_ids: yup.array().of(yup.number()),
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_category_ids: [],
      category_ids: [],
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
        parent_category_ids: [],
        category_ids: [],
        translations: langs.map((lang) => ({
          language_id: lang.id,
          question: "",
          answer: "",
        })),
        tags: [],
      });
    }
  }, [langs, reset]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Update subcategories when parent categories change
  useEffect(() => {
    if (selectedParents.length > 0) {
      // Collect all subcategories from selected parents
      const allSubs = [];
      selectedParents.forEach((selectedParent) => {
        const parent = categories.find((cat) => cat.id === selectedParent.id);
        if (parent?.subs && parent.subs.length > 0) {
          allSubs.push(...parent.subs);
        }
      });
      setSubCategories(allSubs);
      // Reset category_ids when parents change
      setValue("category_ids", []);
    } else {
      setSubCategories([]);
      setValue("category_ids", []);
    }
  }, [selectedParents, categories, setValue]);

  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const res = await controlPrivateApi.get("/categories/list?with_subs=yes");
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
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setPending(true);
    try {
      const formData = new FormData();
      
      // Combine parent_category_ids and category_ids into categories array
      const allCategories = [ ...data.category_ids];
      allCategories.forEach((categoryId) => {
        formData.append("categories[]", categoryId);
      });
      
      // Append tags array
      data.tags.forEach((tagId) => {
        formData.append("tags[]", tagId);
      });
      
      // Append translations
      data.translations.forEach((translation, index) => {
        formData.append(`translations[${index}][language_id]`, translation.language_id);
        formData.append(`translations[${index}][question]`, translation.question);
        formData.append(`translations[${index}][answer]`, translation.answer);
      });
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append("files[]", file);
      });
      
      const res = await controlPrivateApi.post("/faqs/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error submitting form", "error");
    } finally {
      setPending(false);
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
              {/* Parent Categories - Multiple Selection */}
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">
                      {t("parent_categories")}
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Controller
                      name="parent_category_ids"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          value={selectedParents}
                          onChange={(_, newValue) => {
                            setSelectedParents(newValue);
                            field.onChange(newValue.map((item) => item.id));
                          }}
                          options={categories}
                          getOptionLabel={(option) => option.title}
                          loading={loading.categories}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errors.parent_category_ids}
                              helperText={errors.parent_category_ids?.message}
                              placeholder={t("select_parent_categories")}
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

              {/* Sub Categories - Multiple Selection */}
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">{t("sub_categories")}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Controller
                      name="category_ids"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          value={subCategories.filter((cat) =>
                            field.value.includes(cat.id)
                          )}
                          onChange={(_, newValue) =>
                            field.onChange(newValue.map((item) => item.id))
                          }
                          options={subCategories}
                          getOptionLabel={(option) => option.title}
                          disabled={selectedParents.length === 0 || subCategories.length === 0}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errors.category_ids}
                              helperText={errors.category_ids?.message}
                              placeholder={t("select_sub_categories")}
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

              {/* Files Upload */}
              <Grid2 size={{ xs: 12 }}>
                <Grid2 container spacing={2} alignItems="center">
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <Typography variant="body1">{t("files")}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 9 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {t("upload_files")}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileChange}
                      />
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedFiles.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => handleRemoveFile(index)}
                            deleteIcon={<CloseIcon />}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
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
