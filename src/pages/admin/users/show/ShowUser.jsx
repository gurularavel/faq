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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  Box,
  Skeleton,
  Grid2,
  Chip,
} from "@mui/material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

export default function ShowUser() {
  const t = useTranslate();
  const { id } = useParams();
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
      const res = await controlPrivateApi.get(
        `/users/${id}/exams/list?${queryParams}`
      );

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

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Skeleton variant="rectangular" width="60%" height={24} />
            <Skeleton
              variant="rectangular"
              width={80}
              height={24}
              sx={{ borderRadius: 1 }}
            />
          </Box>

          <Box width={"100%"}>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <Typography variant="body" fontWeight={"bold"}>
                  <Skeleton width={100} />
                </Typography>
              </Grid2>
              <Grid2 size={6}>
                <Skeleton width={100} />
              </Grid2>

              <Grid2 size={6}>
                <Typography variant="body" fontWeight={"bold"}>
                  <Skeleton width={100} />
                </Typography>
              </Grid2>
              <Grid2 size={6}>
                <Skeleton width={60} />
              </Grid2>

              <Grid2 size={6}>
                <Typography variant="body" fontWeight={"bold"}>
                  <Skeleton width={100} />
                </Typography>
              </Grid2>
              <Grid2 size={6}>
                <Skeleton width={80} />
              </Grid2>

              <Grid2 size={6}>
                <Typography variant="body" fontWeight={"bold"}>
                  <Skeleton width={100} />
                </Typography>
              </Grid2>
              <Grid2 size={6}>
                <Skeleton width={70} />
              </Grid2>
            </Grid2>
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
            <TableCell>{t("start_date")}</TableCell>
            <TableCell>
              {t("correct")}/{t("incorrect")}
            </TableCell>
            <TableCell>{t("time_spent")}</TableCell>
            <TableCell>{t("success_rate")}</TableCell>
            <TableCell>{t("status")}</TableCell>
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
                  <Skeleton width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton width={50} />
                </TableCell>
                <TableCell>
                  <Skeleton width={70} />
                </TableCell>
                <TableCell>
                  <Skeleton width={50} />
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
                  {row.start_date
                    ? dayjs(row.start_date).format("DD.MM.YYYY HH:mm")
                    : "-"}
                </TableCell>
                <TableCell>
                  {row.correct_questions_count}/{row.questions_count}
                </TableCell>
                <TableCell>{row.total_time_spent_formatted}</TableCell>
                <TableCell>{row.success_rate}%</TableCell>
                <TableCell>
                  <Chip
                    label={row.is_ended ? t("finished") : t("active")}
                    color={row.is_ended ? "default" : "success"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1">
                {filters.page * filters.limit - filters.limit + i + 1}.{" "}
                {row.question_group.title}
              </Typography>
              <Chip
                label={row.is_ended ? t("finished") : t("active")}
                color={row.is_ended ? "default" : "success"}
                size="small"
              />
            </Box>
            <Box mt={1}>
              <Grid2 container spacing={1}>
                <Grid2 size={6}>
                  <Typography variant="body" fontWeight={"bold"}>
                    {t("start_date")}:
                  </Typography>
                </Grid2>
                <Grid2 size={6}>
                  <Typography variant="body">
                    {row.start_date
                      ? dayjs(row.start_date).format("DD.MM.YYYY HH:mm")
                      : "-"}
                  </Typography>
                </Grid2>

                <Grid2 size={6}>
                  <Typography variant="body" fontWeight={"bold"}>
                    {t("questions")}:
                  </Typography>
                </Grid2>
                <Grid2 size={6}>
                  <Typography variant="body">
                    {row.correct_questions_count}/{row.questions_count}
                  </Typography>
                </Grid2>

                <Grid2 size={6}>
                  <Typography variant="body" fontWeight={"bold"}>
                    {t("time_spent")}:
                  </Typography>
                </Grid2>
                <Grid2 size={6}>
                  <Typography variant="body">
                    {row.total_time_spent_formatted}
                  </Typography>
                </Grid2>

                <Grid2 size={6}>
                  <Typography variant="body" fontWeight={"bold"}>
                    {t("success_rate")}:
                  </Typography>
                </Grid2>
                <Grid2 size={6}>
                  <Typography variant="body">{row.success_rate}%</Typography>
                </Grid2>
              </Grid2>
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <MainCard title={t("exams")} hasBackBtn={true}>
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
