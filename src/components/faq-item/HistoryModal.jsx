import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import dayjs from "dayjs";

const HistoryModal = ({ open, onClose, faqId }) => {
  const t = useTranslate();
  const [archives, setArchives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArchives = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await userPrivateApi.get(
        `/faqs/${faqId}/archives/load?limit=100`
      );
      setArchives(data.data || []);
    } catch (err) {
      console.error("Error fetching archives:", err);
      setError(t("failed_to_load_history") || "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [faqId, t]);

  useEffect(() => {
    if (open && faqId) {
      fetchArchives();
    }
  }, [open, faqId, fetchArchives]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div" fontWeight={600}>
          {t("faq_history") || "FAQ History"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography align="center" color="error" py={4}>
            {error}
          </Typography>
        ) : archives.length === 0 ? (
          <Typography align="center" color="text.secondary" py={4}>
            {t("no_history_available") || "No history available"}
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {archives.map((archive, index) => (
              <Accordion
                key={archive.id}
                defaultExpanded={index === 0}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px !important",
                  "&:before": { display: "none" },
                  boxShadow: "none",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    "&.Mui-expanded": {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    pr={2}
                  >
                    <Typography fontWeight={600}>
                      {t("change") || "Change"} #{archives.length - index}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(archive.updated_date).format("DD.MM.YYYY HH:mm")}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Box display="flex" flexDirection="column" gap={3}>
                    {/* Question Changes */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        mb={1}
                        color="primary"
                      >
                        {t("question_changes") || "Question Changes:"}
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: "#f9f9f9",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="body2"
                          dangerouslySetInnerHTML={{
                            __html: archive.diff_question,
                          }}
                        />
                      </Paper>
                    </Box>

                    {/* Answer Changes */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        mb={1}
                        color="primary"
                      >
                        {t("answer_changes") || "Answer Changes:"}
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: "#f9f9f9",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          variant="body2"
                          dangerouslySetInnerHTML={{
                            __html: archive.diff_answer,
                          }}
                        />
                      </Paper>
                    </Box>

                    <Divider />

                    {/* Old vs New Comparison */}
                    <Box display="flex" gap={2}>
                      {/* Old Version */}
                      <Box flex={1}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          mb={1}
                          color="error"
                        >
                          {t("old_version") || "Old Version:"}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: "#fff5f5",
                            border: "1px solid #ffcdd2",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {t("question") || "Question:"}
                          </Typography>
                          <Typography variant="body2" mb={2}>
                            {archive.old_question}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {t("answer") || "Answer:"}
                          </Typography>
                          <Box
                            variant="body2"
                            component="div"
                            dangerouslySetInnerHTML={{
                              __html: archive.old_answer,
                            }}
                          />
                        </Paper>
                      </Box>

                      {/* New Version */}
                      <Box flex={1}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          mb={1}
                          color="success.main"
                        >
                          {t("new_version") || "New Version:"}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: "#f1f8e9",
                            border: "1px solid #c5e1a5",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {t("question") || "Question:"}
                          </Typography>
                          <Typography variant="body2" mb={2}>
                            {archive.new_question}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {t("answer") || "Answer:"}
                          </Typography>
                          <Box
                            variant="body2"
                            component="div"
                            dangerouslySetInnerHTML={{
                              __html: archive.new_answer,
                            }}
                          />
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

HistoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  faqId: PropTypes.number.isRequired,
};

export default HistoryModal;

