import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Collapse,
  Divider,
  Chip,
  Grid2,
  Button,
  Modal,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Popover,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import dayjs from "dayjs";
import HistoryModal from "./HistoryModal";

const FAQItem = ({
  id,
  question,
  answer,
  tags,
  categories,
  updatedDate,
  isMostSearched,
  files = [],
}) => {
  const t = useTranslate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
  const [modalTagsAnchorEl, setModalTagsAnchorEl] = useState(null);

  // Helper function to check if a file is an image
  const isImageFile = (mimeType) => {
    return mimeType?.startsWith("image/");
  };

  // Helper function to get file icon
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return <ImageIcon />;
    if (mimeType === "application/pdf") return <PictureAsPdfIcon />;
    return <InsertDriveFileIcon />;
  };

  // Helper function to get filename from URL
  const getFilename = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  // Handle file click
  const handleFileClick = (file) => {
    if (isImageFile(file.mime_type)) {
      setSelectedImage(file.url);
      setImageModalOpen(true);
    } else {
      window.open(file.url, "_blank");
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleTagsClick = (event) => {
    setTagsAnchorEl(event.currentTarget);
  };

  const handleTagsClose = () => {
    setTagsAnchorEl(null);
  };

  const handleModalTagsClick = (event) => {
    setModalTagsAnchorEl(event.currentTarget);
  };

  const handleModalTagsClose = () => {
    setModalTagsAnchorEl(null);
  };

  const tagsOpen = Boolean(tagsAnchorEl);
  const modalTagsOpen = Boolean(modalTagsAnchorEl);

  const postFaqId = async (id) => {
    try {
      await userPrivateApi.post(`/faqs/open/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleExpand = () => {
    if (isMostSearched) {
      setIsModalOpen(true);
      postFaqId(id);
    } else {
      setIsExpanded(!isExpanded);
      if (!isExpanded) {
        postFaqId(id);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Grid2
      size={{
        xs: 12,
        md: (isExpanded && !isMostSearched) || isMostSearched ? 12 : 6,
      }}
      item
    >
      <Box position="relative">
        <Box position="absolute" top="-24px" left="20px">
          <Typography variant="caption" color="text.secondary">
            {dayjs(updatedDate).format("DD.MM.YYYY  HH:mm")}
          </Typography>
        </Box>
        {tags && tags.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "-28px",
              right: "16px",
              zIndex: 1,
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}
          >
            {tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag.id}
                label={<span dangerouslySetInnerHTML={{ __html: tag.title }} />}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
            {tags.length > 2 && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagsClick(e);
                  }}
                  sx={{
                    width: "24px",
                    height: "24px",
                    padding: "2px",
                    bgcolor: "rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.12)",
                    },
                  }}
                >
                  <MoreHorizIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
                <Popover
                  open={tagsOpen}
                  anchorEl={tagsAnchorEl}
                  onClose={handleTagsClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      maxWidth: "300px",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      {t("all_tags") || "All Tags"}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap="4px">
                      {tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={
                            <span
                              dangerouslySetInnerHTML={{ __html: tag.title }}
                            />
                          }
                          size="small"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Popover>
              </>
            )}
          </Box>
        )}

        <Paper
          className={`faq-item ${
            isExpanded && !isMostSearched ? "expanded" : ""
          }`}
          elevation={0}
          onClick={isMostSearched || !isExpanded ? toggleExpand : undefined}
          sx={{
            cursor: isMostSearched || !isExpanded ? "pointer" : "default",
          }}
        >
          <Box className="faq-header">
            <Box display="flex" flexDirection="column" gap="4px">
              <Box
                dangerouslySetInnerHTML={{
                  __html: question,
                }}
                className="faq-question"
              />
            </Box>
            {isExpanded && !isMostSearched && (
              <IconButton
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {isExpanded && !isMostSearched && (
            <Divider className="question-divider" />
          )}

          <Collapse in={isExpanded && !isMostSearched}>
            {categories && categories.length > 0 && (
              <Box display="flex" gap="4px" flexWrap="wrap" mb={2}>
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    {category?.parent && (
                      <Chip
                        label={category?.parent?.title}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                        color="error"
                      />
                    )}
                    {category?.title && (
                      <Chip
                        label={
                          <Box alignItems="center" display="flex" gap="4px">
                            <SubdirectoryArrowRightIcon />
                            {category?.title}
                          </Box>
                        }
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                        color="secondary"
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            )}
            <Box
              className="faq-answer"
              style={{ maxWidth: "100%", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html: answer }}
            />

            {/* Files Section */}
            {files && files.length > 0 && (
              <Box mt={3}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AttachFileIcon sx={{ color: "#d32f2f" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#d32f2f"
                  >
                    {t("attachments") || "Attachments"} ({files.length})
                  </Typography>
                </Box>
                <Grid2 container spacing={2}>
                  {files.map((file, index) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Card
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file);
                          }}
                        >
                          {isImageFile(file.mime_type) ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={file.url}
                              alt={getFilename(file.url)}
                              sx={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#f5f5f5",
                              }}
                            >
                              {getFileIcon(file.mime_type)}
                            </Box>
                          )}
                          <CardContent>
                            <Typography
                              variant="body2"
                              noWrap
                              title={getFilename(file.url)}
                            >
                              {getFilename(file.url)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHistoryModalOpen(true);
                }}
                sx={{
                  borderColor: "#d32f2f",
                  color: "#d32f2f",
                  "&:hover": {
                    borderColor: "#b71c1c",
                    bgcolor: "#ffebee",
                  },
                }}
              >
                {t("view_history") || "View History"}
              </Button>
            </Box>
          </Collapse>
        </Paper>
      </Box>

      <HistoryModal
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        faqId={id}
      />

      {/* Modal for Most Searched FAQs */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: "1200px",
            width: "95%",
            maxHeight: "95vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Modal Header - Fixed */}
          <Box
            sx={{
              p: 4,
              pb: 2,
              borderBottom: "1px solid #e0e0e0",
              flexShrink: 0,
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                color: "#d32f2f",
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                {dayjs(updatedDate).format("DD.MM.YYYY  HH:mm")}
              </Typography>
            </Box>

            {tags && tags.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  mb: 2,
                  alignItems: "center",
                }}
              >
                {tags.slice(0, 2).map((tag) => (
                  <Chip
                    key={tag.id}
                    label={
                      <span dangerouslySetInnerHTML={{ __html: tag.title }} />
                    }
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                  />
                ))}
                {tags.length > 2 && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModalTagsClick(e);
                      }}
                      sx={{
                        width: "24px",
                        height: "24px",
                        padding: "2px",
                        bgcolor: "rgba(0, 0, 0, 0.08)",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.12)",
                        },
                      }}
                    >
                      <MoreHorizIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                    <Popover
                      open={modalTagsOpen}
                      anchorEl={modalTagsAnchorEl}
                      onClose={handleModalTagsClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          maxWidth: "300px",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                          {t("all_tags") || "All Tags"}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap="4px">
                          {tags.map((tag) => (
                            <Chip
                              key={tag.id}
                              label={
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: tag.title,
                                  }}
                                />
                              }
                              size="small"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Popover>
                  </>
                )}
              </Box>
            )}

            <Box
              dangerouslySetInnerHTML={{
                __html: question,
              }}
              sx={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#d32f2f",
                pr: 5,
              }}
            />
          </Box>

          {/* Modal Body - Scrollable */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              p: 4,
              pt: 3,
            }}
          >
            {categories && categories.length > 0 && (
              <Box display="flex" gap="4px" flexWrap="wrap" mb={3}>
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    {category?.parent && (
                      <Chip
                        label={category?.parent?.title}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                        color="error"
                      />
                    )}
                    {category?.title && (
                      <Chip
                        label={
                          <Box alignItems="center" display="flex" gap="4px">
                            <SubdirectoryArrowRightIcon />
                            {category?.title}
                          </Box>
                        }
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                        color="secondary"
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            )}

            <Box
              dangerouslySetInnerHTML={{ __html: answer }}
              sx={{
                fontSize: "1rem",
                lineHeight: 1.8,
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
                "& table": {
                  maxWidth: "100%",
                  overflowX: "auto",
                  display: "block",
                },
                "& p": {
                  marginBottom: "1rem",
                },
                "& ul, & ol": {
                  marginBottom: "1rem",
                  paddingLeft: "2rem",
                },
              }}
            />

            {/* Files Section in Modal */}
            {files && files.length > 0 && (
              <Box mt={4}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AttachFileIcon sx={{ color: "#d32f2f" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="#d32f2f"
                  >
                    {t("attachments") || "Attachments"} ({files.length})
                  </Typography>
                </Box>
                <Grid2 container spacing={2}>
                  {files.map((file, index) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Card
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file);
                          }}
                        >
                          {isImageFile(file.mime_type) ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={file.url}
                              alt={getFilename(file.url)}
                              sx={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#f5f5f5",
                              }}
                            >
                              {getFileIcon(file.mime_type)}
                            </Box>
                          )}
                          <CardContent>
                            <Typography
                              variant="body2"
                              noWrap
                              title={getFilename(file.url)}
                            >
                              {getFilename(file.url)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
            )}
          </Box>

          {/* Modal Footer - Fixed */}
          <Box
            sx={{
              p: 4,
              pt: 2,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              size="medium"
              startIcon={<HistoryIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setIsHistoryModalOpen(true);
              }}
              sx={{
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": {
                  borderColor: "#b71c1c",
                  bgcolor: "#ffebee",
                },
              }}
            >
              {t("view_history") || "View History"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
          }}
        >
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 1)",
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Full size"
              sx={{
                maxWidth: "100%",
                maxHeight: "85vh",
                minWidth: "100px",
                minHeight: "100px",
                width: "auto",
                height: "auto",
                display: "block",
              }}
            />
          )}
        </Box>
      </Modal>
    </Grid2>
  );
};

FAQItem.propTypes = {
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
    })
  ),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      parent: PropTypes.shape({
        title: PropTypes.string,
      }),
    })
  ),
  updatedDate: PropTypes.string.isRequired,
  isMostSearched: PropTypes.bool,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      mime_type: PropTypes.string.isRequired,
    })
  ),
};

export default FAQItem;
