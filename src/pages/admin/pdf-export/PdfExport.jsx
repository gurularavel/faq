import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  Box,
  Button,
  Skeleton,
  Grid2,
  Chip,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import Modal from "@components/modal";
import dayjs from "dayjs";

export default function PdfExport() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState({
    list: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async () => {
    setIsLoading(true);

    try {
      const res = await controlPrivateApi.get(
        `/faqs/exports/load?limit=${filters.limit}&page=${filters.page}`
      );

      setData({
        list: res.data.data,
        total: res.data.meta.total,
        currentPage: res.data.meta.current_page,
        lastPage: res.data.meta.last_page,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "An error occurred", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [filters]);

  const handlePageChange = (event, newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleLimitChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      limit: event.target.value,
    }));
  };

  const fetchSubCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await controlPrivateApi.get(
        "/categories/list?limit=100&with_subs=yes"
      );

      // Extract all subcategories from all parent categories
      const allSubs = [];
      res.data.data.forEach((category) => {
        if (category.subs && category.subs.length > 0) {
          allSubs.push(...category.subs);
        }
      });

      setSubCategories(allSubs);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to fetch categories",
          "error"
        );
      }
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const handleOpenModal = useCallback(() => {
    setSelectedCategoryId("");
    fetchSubCategories();
    setModalOpen(true);
  }, [fetchSubCategories]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategoryId("");
  };

  const generatePdf = async (categoryId = null) => {
    setIsGenerating(true);
    handleCloseModal();

    try {
      const url = categoryId
        ? `/faqs/exports/generate-pdf?category=${categoryId}`
        : "/faqs/exports/generate-pdf";

      const res = await controlPrivateApi.post(url);
      notify(res.data.message || "PDF generation started", "success");
      getData(); // Refresh the list
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to generate PDF",
          "error"
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    const categoryId = selectedCategoryId ? Number(selectedCategoryId) : null;
    generatePdf(categoryId);
  };

  const getStatusColor = (statusKey) => {
    switch (statusKey) {
      case "done":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "error";
      case "queued":
        return "info";
      default:
        return "default";
    }
  };

  useEffect(() => {
    setContent(
      <Button
        variant="contained"
        color="error"
        startIcon={<AddIcon />}
        size="small"
        onClick={handleOpenModal}
        disabled={isGenerating}
        sx={{
          "& .MuiButton-startIcon": {
            mr: { xs: 0, sm: 1 },
          },
        }}
      >
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          {isGenerating
            ? t("generating") || "Generating..."
            : t("generate_pdf") || "Generate PDF"}
        </Box>
      </Button>
    );

    return () => setContent(null);
  }, [isGenerating, handleOpenModal, setContent, t]);

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Grid2 container spacing={2}>
            <Grid2 size={3}>
              <Skeleton variant="rectangular" width="100%" height={20} />
            </Grid2>
            <Grid2 size={3}>
              <Skeleton variant="rectangular" width="100%" height={20} />
            </Grid2>
            <Grid2 size={3}>
              <Skeleton variant="rectangular" width="100%" height={20} />
            </Grid2>
            <Grid2 size={3}>
              <Skeleton variant="rectangular" width="100%" height={20} />
            </Grid2>
          </Grid2>
        </Box>
      ))}
    </Stack>
  );

  const NoData = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={4}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t("no_data_found") || "No data found"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("generate_first_pdf") || "Generate your first PDF export"}
      </Typography>
    </Box>
  );

  const DesktopView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{t("status") || "Status"}</TableCell>
            <TableCell>{t("language") || "Language"}</TableCell>
            <TableCell>{t("created_by") || "Created By"}</TableCell>
            <TableCell>{t("created_date") || "Created Date"}</TableCell>
            <TableCell align="center">{t("actions") || "Actions"}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton width={20} />
                </TableCell>
                <TableCell>
                  <Skeleton width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton width={120} />
                </TableCell>
                <TableCell>
                  <Skeleton width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="circular" width={32} height={32} />
                </TableCell>
              </TableRow>
            ))
          ) : data.list.length > 0 ? (
            data.list.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status_key)}
                    size="small"
                  />
                  {row.messages && row.messages.length > 0 && (
                    <Box mt={1}>
                      {row.messages.map((msg, idx) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          color="error"
                          display="block"
                        >
                          {msg}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.language.title}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{row.created_user}</TableCell>
                <TableCell>
                  {dayjs(row.created_date).format("DD.MM.YYYY HH:mm")}
                </TableCell>
                <TableCell align="center">
                  {row.file ? (
                    <IconButton
                      color="primary"
                      component="a"
                      href={row.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <DownloadIcon />
                    </IconButton>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
                <NoData />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const MobileView = () => (
    <Stack spacing={2}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : data.list.length > 0 ? (
        data.list.map((row) => (
          <Box key={row.id} padding={2} borderBottom={"1px solid #E6E9ED"}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="body1" fontWeight="bold">
                #{row.id}
              </Typography>
              <Chip
                label={row.status}
                color={getStatusColor(row.status_key)}
                size="small"
              />
            </Box>

            <Grid2 container spacing={1}>
              <Grid2 size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t("language") || "Language"}:
                </Typography>
                <Typography variant="body2">{row.language.title}</Typography>
              </Grid2>

              <Grid2 size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t("created_by") || "Created By"}:
                </Typography>
                <Typography variant="body2">{row.created_user}</Typography>
              </Grid2>

              <Grid2 size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t("created_date") || "Created Date"}:
                </Typography>
                <Typography variant="body2">
                  {dayjs(row.created_date).format("DD.MM.YYYY HH:mm")}
                </Typography>
              </Grid2>

              {row.messages && row.messages.length > 0 && (
                <Grid2 size={12}>
                  <Typography variant="caption" color="error">
                    {row.messages.join(", ")}
                  </Typography>
                </Grid2>
              )}
            </Grid2>

            {row.file && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={row.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {t("download") || "Download"}
                </Button>
              </Box>
            )}
          </Box>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <MainCard
      title={
        <>
          {t("pdf_exports") || "PDF Exports"}:
          <Chip label={data.total} color="error" sx={{ ml: 1 }} />
        </>
      }
    >
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          {isMobile ? <MobileView /> : <DesktopView />}
        </Box>

        {!isLoading && data.list.length > 0 && (
          <Box className="main-card-footer">
            <FormControl size="small">
              <Select
                value={filters.limit}
                onChange={handleLimitChange}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                    },
                  },
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            <Pagination
              count={data.lastPage}
              page={data.currentPage}
              onChange={handlePageChange}
              color="error"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Modal
        open={modalOpen}
        setOpen={setModalOpen}
        title={t("select_subcategory")}
        maxWidth="sm"
      >
        <Stack spacing={3}>
          <Alert severity="info">
            {t("keep_the_field_empty_to_generate_pdf_for_all_faqs") ||
              "Keep the field empty to generate PDF for all FAQs"}
          </Alert>

          <FormControl fullWidth>
            <Typography variant="body2" gutterBottom>
              {t("subcategory") || "Subcategory"}
            </Typography>
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              displayEmpty
              disabled={isLoadingCategories}
            >
              {subCategories.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              disabled={isGenerating}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleGenerate}
              disabled={isGenerating || isLoadingCategories}
            >
              {isGenerating
                ? t("generating") || "Generating..."
                : t("generate") || "Generate"}
            </Button>
          </Box>
        </Stack>
      </Modal>
    </MainCard>
  );
}
