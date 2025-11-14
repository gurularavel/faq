import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@src/utils/translations/useTranslate";

const ExportPdfModal = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const t = useTranslate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleGoToExports = () => {
    navigate("/user/exports");
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px 0",
        }}
      >
        <DialogTitle>{t("pdf_export") || "PDF Export"}</DialogTitle>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            py: 2,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: "#4caf50" }}
          />
          <Typography variant="h6" align="center">
            {t("pdf_generation_started") || "PDF üretme prosesi başladı"}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            {t("pdf_generation_notification") ||
              "PDF hazır olduğunda bildiriş alacaqsınız."}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
            >
              {t("close") || "Bağla"}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleGoToExports}
            >
              {t("go_to_exports") || "Eksportlara keç"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

ExportPdfModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default ExportPdfModal;

