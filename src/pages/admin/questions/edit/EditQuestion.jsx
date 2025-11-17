import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid2,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
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
import { useNavigate, useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@assets/icons/delete.svg";
import DeleteModal from "@components/modal/DeleteModal";
import Modal from "@components/modal";

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

export default function EditQuestion() {
  const { id } = useParams();
  const t = useTranslate();
  const { langs } = useSelector((state) => state.lang);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [existingMediaIds, setExistingMediaIds] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [loading, setLoading] = useState({
    categories: false,
    tags: false,
    submit: false,
    fetchingData: false,
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

  // Function to update subcategories based on selected parents
  const updateSubCategories = useCallback((parents, shouldClearSelection = true) => {
    if (parents.length > 0) {
      const allSubs = [];
      parents.forEach((parent) => {
        if (parent?.subs && parent.subs.length > 0) {
          allSubs.push(...parent.subs);
        }
      });
      setSubCategories(allSubs);
      if (shouldClearSelection) {
        setValue("category_ids", []);
      }
    } else {
      setSubCategories([]);
      if (shouldClearSelection) {
        setValue("category_ids", []);
      }
    }
  }, [setValue]);

  const fetchQuestionData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, fetchingData: true }));
    try {
      const res = await controlPrivateApi.get(`/faqs/show/${id}`);
      const questionData = res.data.data;

      const translationsMap = {};
      questionData.translations.forEach((trans) => {
        translationsMap[trans.language_id] = trans;
      });

      const formattedTranslations = langs.map((lang) => ({
        language_id: lang.id,
        question: translationsMap[lang.id]?.question || "",
        answer: translationsMap[lang.id]?.answer || "",
      }));

      // Handle categories - assuming API returns categories array
      const parentCategoryIds = [];
      const categoryIds = [];
      const parentCategories = [];

      if (questionData.categories && Array.isArray(questionData.categories)) {
        questionData.categories.forEach((cat) => {
          if (cat.parent) {
            categoryIds.push(cat.id);
            if (!parentCategoryIds.includes(cat.parent.id)) {
              parentCategoryIds.push(cat.parent.id);
              const parentCat = categories.find((c) => c.id === cat.parent.id);
              if (parentCat) {
                parentCategories.push(parentCat);
              }
            }
          } else {
            parentCategoryIds.push(cat.id);
            const parentCat = categories.find((c) => c.id === cat.id);
            if (parentCat) {
              parentCategories.push(parentCat);
            }
          }
        });
      } else if (questionData.category) {
        // Fallback for single category
        if (questionData.category.parent) {
          parentCategoryIds.push(questionData.category.parent.id);
          categoryIds.push(questionData.category.id);
          const parentCat = categories.find(
            (c) => c.id === questionData.category.parent.id
          );
          if (parentCat) {
            parentCategories.push(parentCat);
          }
        } else {
          parentCategoryIds.push(questionData.category.id);
          const parentCat = categories.find((c) => c.id === questionData.category.id);
          if (parentCat) {
            parentCategories.push(parentCat);
          }
        }
      }

      // Set selected parents and update subcategories without clearing selection
      setSelectedParents(parentCategories);
      updateSubCategories(parentCategories, false);

      // Store existing files
      if (questionData.files?.files) {
        setExistingFiles(questionData.files.files);
      }
      if (questionData.files?.media_ids) {
        setExistingMediaIds(questionData.files.media_ids);
      }

      // Reset form with all data
      reset({
        parent_category_ids: parentCategoryIds,
        category_ids: categoryIds,
        translations: formattedTranslations,
        tags: questionData.tags.map((tag) => tag.id),
      });
    } catch (error) {
      notify(
        error.response?.data?.message || "Error fetching question data",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetchingData: false }));
    }
  }, [id, langs, categories, reset, updateSubCategories]);

  useEffect(() => {
    if (id && langs.length && categories.length > 0) {
      fetchQuestionData();
    }
  }, [id, langs, categories, fetchQuestionData]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

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

  // Open media viewer
  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setMediaViewerOpen(true);
  };

  // Close media viewer
  const handleCloseMediaViewer = () => {
    setMediaViewerOpen(false);
    setSelectedMedia(null);
  };

  // Open delete modal
  const handleDeleteMedia = (mediaId) => {
    setMediaToDelete(mediaId);
    setDeleteModalOpen(true);
  };

  // Delete existing media from server
  const deleteMedia = async () => {
    try {
      const res = await controlPrivateApi.delete(
        `/faqs/images/delete/${id}/${mediaToDelete}`
      );
      notify(res.data.message || "Media deleted successfully", "success");
      setDeleteModalOpen(false);
      setMediaToDelete(null);
      // Refresh files list
      fetchQuestionData();
    } catch (error) {
      notify(
        error.response?.data?.message || "Error deleting media",
        "error"
      );
    }
  };

  const onSubmit = async (data) => {
    setPending(true);
    try {
      const formData = new FormData();
      
      // Combine parent_category_ids and category_ids into categories array
      const allCategories = [...data.category_ids];
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
      
      const res = await controlPrivateApi.post(`/faqs/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      notify(res.data.message, "success");
      nav(-1);
    } catch (error) {
      notify(error.response?.data?.message || "Error updating form", "error");
    } finally {
      setPending(false);
    }
  };

  if (loading.fetchingData) {
    return (
      <MainCard title={t("edit_question")} hasBackBtn={true}>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <>
    <MainCard title={t("edit_question")} hasBackBtn={true}>
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
                            updateSubCategories(newValue, true);
                            field.onChange(newValue.map((item) => item.id));
                          }}
                          options={categories}
                          getOptionLabel={(option) => option.title}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
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
                          isOptionEqualToValue={(option, value) => option.id === value.id}
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
                          isOptionEqualToValue={(option, value) => option.id === value.id}
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
                <Grid2 container spacing={2}>
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

                    {/* Existing Files from Database */}
                    {existingFiles.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t("existing_files") || "Existing Files"}
                        </Typography>
                        <Grid2 container spacing={2}>
                          {existingFiles.map((file, index) => (
                            <Grid2 key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  position: "relative",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    boxShadow: 2,
                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <Box
                                  onClick={() => handleMediaClick(file)}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {file.mime_type?.startsWith("image/") ? (
                                    <Box
                                      component="img"
                                      src={file.url}
                                      alt="media"
                                      sx={{
                                        width: "100%",
                                        height: 150,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: 150,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "grey.100",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography variant="body2" color="text.secondary">
                                        {file.mime_type}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      textAlign: "center",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {file.mime_type}
                                  </Typography>
                                </Box>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedia(existingMediaIds[index]);
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    bgcolor: "white",
                                    "&:hover": {
                                      bgcolor: "grey.100",
                                    },
                                  }}
                                >
                                  <img
                                    src={DeleteIcon}
                                    alt="delete"
                                    style={{ width: 20, height: 20 }}
                                  />
                                </IconButton>
                              </Paper>
                            </Grid2>
                          ))}
                        </Grid2>
                      </Box>
                    )}

                    {/* New Files to Upload */}
                    {selectedFiles.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t("new_files") || "New Files to Upload"}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedFiles.map((file, index) => (
                            <Chip
                              key={index}
                              label={file.name}
                              onDelete={() => handleRemoveFile(index)}
                              deleteIcon={<CloseIcon />}
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Box>
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

    {/* Media Viewer Dialog */}
    <Dialog
      open={mediaViewerOpen}
      onClose={handleCloseMediaViewer}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t("media_viewer") || "Media Viewer"}
          </Typography>
          <IconButton onClick={handleCloseMediaViewer}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedMedia && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {selectedMedia.mime_type?.startsWith("image/") ? (
              <Box
                component="img"
                src={selectedMedia.url}
                alt="media"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  gap: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {selectedMedia.mime_type}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("open_in_new_tab") || "Open in New Tab"}
                </Button>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              {selectedMedia.url}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseMediaViewer}>{t("close") || "Close"}</Button>
      </DialogActions>
    </Dialog>

    {/* Delete Media Modal */}
    <Modal
      open={deleteModalOpen}
      setOpen={setDeleteModalOpen}
      fullScreenOnMobile={false}
      title=""
    >
      <DeleteModal
        onSuccess={deleteMedia}
        close={() => setDeleteModalOpen(false)}
      />
    </Modal>
  </>
  );
}
