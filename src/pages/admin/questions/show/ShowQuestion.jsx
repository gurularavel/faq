import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid2,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Divider,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import { useParams } from "react-router-dom";
import DeleteIcon from "@assets/icons/delete.svg";
import CloseIcon from "@mui/icons-material/Close";
import DeleteModal from "@components/modal/DeleteModal";
import Modal from "@components/modal";
import { useSelector } from "react-redux";

export default function ShowQuestion() {
  const t = useTranslate();
  const { id } = useParams();
  const { langs } = useSelector((state) => state.lang);
  const [isLoading, setIsLoading] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  // Get language name by ID
  const getLanguageName = (languageId) => {
    const language = langs.find((lang) => lang.id === languageId);
    return language ? language.title || language.key : `Language ${languageId}`;
  };

  // Fetch question details
  const getQuestionData = async () => {
    setIsLoading(true);
    try {
      const res = await controlPrivateApi.get(`/faqs/show/${id}`);
      setQuestionData(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error fetching data", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getQuestionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // Delete media
  const deleteMedia = async () => {
    try {
      const res = await controlPrivateApi.delete(
        `/faqs/images/delete/${id}/${mediaToDelete}`
      );
      notify(res.data.message || "Media deleted successfully", "success");
      setDeleteModalOpen(false);
      setMediaToDelete(null);
      // Refresh question data
      getQuestionData();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error deleting media",
          "error"
        );
      }
    }
  };

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      {[...Array(4)].map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </Stack>
        </Box>
      ))}
    </Stack>
  );

  if (isLoading) {
    return (
      <MainCard
        title={t("question_details") || "Question Details"}
        hasBackBtn={true}
      >
        <Box className="main-card-body">
          <Box className="main-card-body-inner">
            <LoadingSkeleton />
          </Box>
        </Box>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard
        title={t("question_details") || "Question Details"}
        hasBackBtn={true}
      >
        <Box className="main-card-body">
          <Box className="main-card-body-inner">
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("basic_information") || "Basic Information"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("id") || "ID"}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {questionData?.id}
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("seen_count") || "Seen Count"}
                    </Typography>
                    <Chip
                      label={questionData?.seen_count || 0}
                      color="error"
                      size="small"
                    />
                  </Grid2>
                </Grid2>
              </Box>

              {/* Categories */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("categories") || "Categories"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {questionData?.categories?.length > 0 ? (
                  <Stack spacing={2}>
                    {questionData.categories.map((category, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t("parent_category") || "Parent Category"}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              {category.parent?.icon && (
                                <img
                                  src={category.parent.icon}
                                  alt="parent icon"
                                  style={{ width: 24, height: 24 }}
                                />
                              )}
                              <Typography variant="body1">
                                {category.parent?.title || "-"}
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t("subcategory") || "Subcategory"}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              {category.icon && (
                                <img
                                  src={category.icon}
                                  alt="category icon"
                                  style={{ width: 24, height: 24 }}
                                />
                              )}
                              <Typography variant="body1">
                                {category.title}
                              </Typography>
                            </Box>
                          </Grid2>
                        </Grid2>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("no_categories") || "No categories"}
                  </Typography>
                )}
              </Box>

              {/* Tags */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("tags") || "Tags"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {questionData?.tags?.length > 0 ? (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {questionData.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.title}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("no_tags") || "No tags"}
                  </Typography>
                )}
              </Box>

              {/* Translations */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("translations") || "Translations"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {questionData?.translations?.length > 0 ? (
                  <Stack spacing={2}>
                    {questionData.translations.map((translation, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Grid2 container spacing={2}>
                          <Grid2 size={12}>
                            <Chip
                              label={getLanguageName(translation.language_id)}
                              color="primary"
                              size="small"
                            />
                          </Grid2>
                          <Grid2 size={12}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {t("question") || "Question"}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              gutterBottom
                            >
                              {translation.question}
                            </Typography>
                          </Grid2>
                          <Grid2 size={12}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {t("answer") || "Answer"}
                            </Typography>
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: "grey.50",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "grey.200",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: translation.answer,
                              }}
                            />
                          </Grid2>
                        </Grid2>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("no_translations") || "No translations"}
                  </Typography>
                )}
              </Box>

              {/* Media Files */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("media_files") || "Media Files"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {questionData?.files?.files?.length > 0 ? (
                  <Grid2 container spacing={2}>
                    {questionData.files.files.map((file, index) => (
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
                              handleDeleteMedia(
                                questionData.files.media_ids[index]
                              );
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
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("no_media_files") || "No media files"}
                  </Typography>
                )}
              </Box>
            </Stack>
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

