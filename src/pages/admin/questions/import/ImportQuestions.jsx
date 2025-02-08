import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Box,
  Button,
  Skeleton,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Grid2,
  Chip,
  CircularProgress,
} from "@mui/material";
import { UploadFile, Refresh, OpenInNew } from "@mui/icons-material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import SureModal from "@components/modal/SureModal";
import Modal from "@components/modal";

const statusConfig = {
  pending: { color: "warning", icon: <CircularProgress size={16} /> },
  processing: { color: "info", icon: <CircularProgress size={16} /> },
  imported: { color: "success" },
  failed: { color: "error" },
  rollback: { color: "default" },
};

export default function ImportQuestions() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await controlPrivateApi.get(`/faqs/excels/load`);
      setData(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        notify("error", error.response?.data?.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const res = await controlPrivateApi.post("/faqs/excels/import", formData);
      notify(res.data.message, "success");
      getData();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Upload failed", "error");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRollback = async () => {
    try {
      const res = await controlPrivateApi.post(
        `/faqs/excels/rollback/${draftData?.id}`
      );
      notify(res.data.message || "Rollback initiated", "success");
      setOpen(false);
      getData();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Rollback failed", "error");
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setContent(
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          component="label"
          startIcon={
            isUploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <UploadFile />
            )
          }
          size="small"
          disabled={isUploading}
        >
          {t(isUploading ? "uploading" : "upload_excel")}
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </Button>
      </Box>
    );

    return () => setContent(null);
  }, [isUploading]);

  //   modals
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(0);
  const [draftData, setDraftData] = useState(null);

  const popups = [
    "",

    {
      title: "",
      element: (
        <SureModal onSuccess={handleRollback} close={() => setModal(0)} />
      ),
    },
  ];

  useEffect(() => {
    setOpen(modal ? true : false);
  }, [modal]);
  useEffect(() => {
    if (!open) {
      setModal(0);
    }
  }, [open]);

  const StatusChip = ({ statusText, status, messages = [] }) => {
    const config = statusConfig[status.toLowerCase()] || statusConfig.default;

    return (
      <Tooltip title={messages?.length > 0 ? messages.join(", ") : ""}>
        <Chip
          label={statusText}
          color={config.color}
          size="small"
          icon={config.icon}
          sx={{
            minWidth: "90px",
            "& .MuiChip-icon": {
              ml: "8px",
              mr: "-6px",
            },
          }}
        />
      </Tooltip>
    );
  };

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Skeleton variant="rectangular" width="70%" height={24} />
          <Box
            sx={{ mt: 2 }}
            display="flex"
            justifyContent="space-between"
            flexDirection={"column"}
          >
            <Box width={"100%"}>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 xs={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 xs={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 xs={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
              </Grid2>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }} display="flex" justifyContent="space-between">
            <Skeleton variant="rectangular" width={60} height={20} />
            <Box display={"flex"}>
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ mr: 1 }}
              />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Box>
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
        {t("no_data_found")}
      </Typography>
    </Box>
  );

  const DesktopView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("status")}</TableCell>
            <TableCell>{t("file")}</TableCell>
            <TableCell>{t("categories_count")}</TableCell>
            <TableCell>{t("faqs_count")}</TableCell>
            <TableCell>{t("created_date")}</TableCell>
            <TableCell>{t("actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {[...Array(6)].map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <StatusChip
                    statusText={row.status}
                    status={row.status_key}
                    messages={row.messages}
                  />
                </TableCell>
                <TableCell>{row.file.split("/").pop()}</TableCell>
                <TableCell>{row.categories_count}</TableCell>
                <TableCell>{row.faqs_count}</TableCell>
                <TableCell>{row.created_date}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => window.open(row.file, "_blank")}
                    >
                      <OpenInNew />
                    </IconButton>
                    {row.status.toLowerCase() == "imported" && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDraftData(row);
                          setModal(1);
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    )}
                  </Box>
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
      ) : data.length > 0 ? (
        data.map((row, i) => (
          <Box key={row.id} padding={2} borderBottom={"1px solid #E6E9ED"}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1">
                {row.file.split("/").pop()}
              </Typography>
              <StatusChip
                statusText={row.status}
                status={row.status}
                messages={row.messages}
              />
            </Box>
            <Box mt={1}>
              <Grid2 container spacing={1}>
                <Grid2 xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {t("categories_count")}:
                  </Typography>
                </Grid2>
                <Grid2 xs={6}>
                  <Typography variant="body2">
                    {row.categories_count}
                  </Typography>
                </Grid2>

                <Grid2 xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {t("faqs_count")}:
                  </Typography>
                </Grid2>
                <Grid2 xs={6}>
                  <Typography variant="body2">{row.faqs_count}</Typography>
                </Grid2>

                <Grid2 xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {t("created_date")}:
                  </Typography>
                </Grid2>
                <Grid2 xs={6}>
                  <Typography variant="body2">{row.created_date}</Typography>
                </Grid2>
              </Grid2>
            </Box>
            <Box
              sx={{ mt: 2 }}
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
            >
              <IconButton
                size="small"
                onClick={() => window.open(row.file, "_blank")}
              >
                <OpenInNew />
              </IconButton>
              {row.status.toLowerCase() === "imported" && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setDraftData(row);
                    setModal(1);
                  }}
                >
                  <Refresh />
                </IconButton>
              )}
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <MainCard title={t("excel_imports")} hasBackBtn={true}>
      <Modal
        open={open}
        fullScreenOnMobile={false}
        setOpen={setOpen}
        title={popups[modal].title}
        children={popups[modal].element}
        maxWidth={popups[modal].size ?? "md"}
      />
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          {isMobile ? <MobileView /> : <DesktopView />}
        </Box>
      </Box>
    </MainCard>
  );
}
