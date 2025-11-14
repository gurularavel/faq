import { useState, useEffect } from "react";
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
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import dayjs from "dayjs";

export default function Exports() {
  const t = useTranslate();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    list: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async () => {
    setIsLoading(true);

    try {
      const res = await userPrivateApi.get(
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
      py={8}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t("no_data_found") || "Məlumat tapılmadı"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("no_exports_yet") || "Hələ heç bir PDF export yoxdur"}
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
            <TableCell>{t("language") || "Dil"}</TableCell>
            <TableCell>{t("created_by") || "Yaradan"}</TableCell>
            <TableCell>{t("created_date") || "Yaradılma tarixi"}</TableCell>
            <TableCell align="center">{t("actions") || "Əməliyyatlar"}</TableCell>
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
          <Paper
            key={row.id}
            elevation={0}
            sx={{
              padding: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
            }}
          >
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
                  {t("language") || "Dil"}:
                </Typography>
                <Typography variant="body2">{row.language.title}</Typography>
              </Grid2>

              <Grid2 size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t("created_by") || "Yaradan"}:
                </Typography>
                <Typography variant="body2">{row.created_user}</Typography>
              </Grid2>

              <Grid2 size={12}>
                <Typography variant="caption" color="text.secondary">
                  {t("created_date") || "Yaradılma tarixi"}:
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
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={row.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {t("download") || "Yüklə"}
                </Button>
              </Box>
            )}
          </Paper>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/user")}
            sx={{
              color: "#d32f2f",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {t("pdf_exports") || "PDF Eksportlar"}
          </Typography>
          <Chip label={data.total} color="error" />
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RefreshIcon />}
          onClick={getData}
          disabled={isLoading}
        >
          {t("refresh") || "Yenilə"}
        </Button>
      </Box>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {isMobile ? <MobileView /> : <DesktopView />}

        {/* Pagination */}
        {!isLoading && data.list.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              borderTop: "1px solid #e0e0e0",
            }}
          >
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
      </Paper>
    </Box>
  );
}

