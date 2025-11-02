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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
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
}) => {
  const t = useTranslate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const postFaqId = async (id) => {
    try {
      await userPrivateApi.post(`/faqs/open/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      postFaqId(id);
    }
  };

  return (
    <Grid2 size={{ xs: 12, md: isExpanded || isMostSearched ? 12 : 6 }} item>
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
            }}
          >
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={<span dangerouslySetInnerHTML={{ __html: tag.title }} />}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        )}

        <Paper
          className={`faq-item ${isExpanded ? "expanded" : ""}`}
          elevation={0}
          onClick={!isExpanded ? toggleExpand : undefined}
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
            {isExpanded && (
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

          {isExpanded && <Divider className="question-divider" />}

          <Collapse in={isExpanded}>
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
};

export default FAQItem;
