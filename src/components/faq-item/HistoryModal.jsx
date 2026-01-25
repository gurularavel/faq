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
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { useTranslate } from "@src/utils/translations/useTranslate";
import dayjs from "dayjs";

const HistoryModal = ({ open, onClose, faqId }) => {
  const t = useTranslate();
  const [archives, setArchives] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
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
      setCurrentVersion(data.current_version || null);
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
       <Box display="flex" alignItems="center" gap={1}>
       <Typography variant="h6" component="div" fontWeight={600}>
          {t("created_date") || "Yaradılma tarixi"}:
        </Typography>
        <Typography variant="body2" component="div" color="text.secondary">
          {dayjs(currentVersion?.created_date).format("DD.MM.YYYY - HH:mm")}
        </Typography>
       </Box>
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
        ) : !currentVersion && archives.length === 0 ? (
          <Typography align="center" color="text.secondary" py={4}>
            {t("no_history_available") || "No history available"}
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Current Version */}
            {currentVersion && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "2px solid",
                  borderColor: "#c44",
                  borderRadius: 2,
                  bgcolor: "#fff5f5",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {t("updated_date") }:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="#c44"
                    >
                      {dayjs(currentVersion.updated_date).format("DD.MM.YYYY - HH:mm")}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#c44",
                      color: "#fff",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#a33",
                      },
                      fontWeight: 600,
                      px: 2,
                    }}
                  >
                    {t("current_version") || "Cari versiya"}
                  </Button>
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    color="#c44"
                    sx={{
                      lineHeight: 1.6,
                      "& p": {
                        margin: 0,
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: currentVersion.question,
                    }}
                  />
                  <Box
                    component="div"
                    sx={{
                      mt: 1,
                      color: "#c44",
                      lineHeight: 1.6,
                      "& p": {
                        margin: 0,
                      },
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: currentVersion.answer,
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Archive History */}
            {archives.map((archive) => (
              <Paper
                key={archive.id}
                elevation={0}
                sx={{
                  p: 3,
                  border: "2px solid",
                  borderColor: "#e0e0e0",
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {t("updated_date") || "Yenilənmə tarixi"}:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {dayjs(archive.updated_date).format("DD.MM.YYYY - HH:mm")}
                    </Typography>
                  </Box>
                  {archive.updated_by && (
                    <Typography variant="body2" color="text.secondary">
                      {t("by") || "Tərəfindən"}: {archive.updated_by}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      "& p": {
                        margin: 0,
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: archive.new_question,
                    }}
                  />
                  <Box
                    component="div"
                    sx={{
                      mt: 1,
                      lineHeight: 1.6,
                      "& p": {
                        margin: 0,
                      },
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: archive.new_answer,
                    }}
                  />
                </Box>
              </Paper>
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

