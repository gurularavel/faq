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
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import Modal from "@components/modal";
import { Link } from "react-router-dom";

// Start Exam Confirmation Component
const StartExamConfirmation = ({ close, id }) => {
  const t = useTranslate();

  return (
    <Box minWidth={350}>
      <Typography variant="body1" gutterBottom>
        {t("are_you_sure_start_exam")}
      </Typography>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={close} variant="outlined">
          {t("cancel")}
        </Button>
        <Button
          component={Link}
          to={`/user/exams/${id}`}
          variant="contained"
          color="error"
        >
          {t("start")}
        </Button>
      </Box>
    </Box>
  );
};

export default function Exams() {
  const t = useTranslate();
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState({
    list: [],
    total: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async (queryParams) => {
    setIsLoading(true);
    try {
      const res = await userPrivateApi.get(`/exams/list?${queryParams}`);
      setData({
        list: res.data.data,
        total: res.data.meta.total,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        notify("error", error.response?.data?.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        queryParams.append(key, value);
      }
    });
    getData(queryParams);
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

  // Modal states
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(0);
  const [draftData, setDraftData] = useState(null);

  const popups = [
    "",
    {
      title: t("start_exam"),
      element: (
        <StartExamConfirmation close={() => setModal(0)} id={draftData} />
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

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Skeleton variant="text" width="70%" height={24} />
          <Box sx={{ mt: 2 }} display="flex" justifyContent="space-between">
            <Skeleton variant="rectangular" width={40} height={20} />
            <Box display={"flex"}>
              <Skeleton variant="rectangular" width={32} height={32} />
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
            <TableCell></TableCell>
            <TableCell>{t("title")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell>
              {t("correct")}/{t("incorrect")}
            </TableCell>
            <TableCell></TableCell>
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
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton width={80} />
                </TableCell>
              </TableRow>
            ))
          ) : data.list.length > 0 ? (
            data.list.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>
                  {filters.page * filters.limit - filters.limit + i + 1}
                </TableCell>
                <TableCell>{row.question_group.title}</TableCell>

                <TableCell>
                  <Chip
                    label={row.is_active ? t("active") : t("finished")}
                    color={row.is_active ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {!row.is_active
                    ? `${row.correct_questions_count}/${row.incorrect_questions_count}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      setDraftData(row.id);
                      setModal(1);
                    }}
                    size="small"
                    disabled={!row.is_active}
                  >
                    {t("start")}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
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
        data.list.map((row, i) => (
          <Box key={row.id} padding={2} borderBottom={"1px solid #E6E9ED"}>
            <Typography variant="body1">
              {filters.page * filters.limit - filters.limit + i + 1}.{" "}
              {row.question_group.title}
            </Typography>
            <Box
              sx={{ mt: 2 }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Chip
                label={row.is_active ? t("active") : t("inactive")}
                color={row.is_active ? "success" : "default"}
                size="small"
              />
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  setDraftData(row.id);
                  setModal(1);
                }}
                size="small"
                disabled={!row.is_active}
              >
                {t("start")}
              </Button>
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <MainCard title={t("exams")}>
      <Modal
        open={open}
        fullScreenOnMobile={false}
        setOpen={setOpen}
        title={popups[modal]?.title}
        children={popups[modal]?.element}
        maxWidth={popups[modal]?.size ?? "sm"}
      />
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
              count={Math.ceil(data.total / filters.limit)}
              page={filters.page}
              onChange={handlePageChange}
              color="error"
              variant="outlined"
            />
          </Box>
        )}
      </Box>
    </MainCard>
  );
}
