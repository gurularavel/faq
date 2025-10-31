import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Skeleton,
  Grid2,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import { useLocation } from "react-router-dom";

export default function TimeSeries() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [data, setData] = useState([]);

  // Parse URL query parameters on initial load
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    const defaultFrom = dayjs().subtract(1, "month").format("YYYY-MM-DD");
    const defaultTo = dayjs().format("YYYY-MM-DD");

    return {
      granularity: params.get("granularity") || "day",
      from: params.get("from") || defaultFrom,
      to: params.get("to") || defaultTo,
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  useEffect(() => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        queryParams.append(key, value);
      }
    });

    const newUrl = `${location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);

    getData(queryParams);
  }, [filters]);

  const getData = async (queryParams) => {
    setIsLoading(true);

    try {
      const res = await controlPrivateApi.get(
        `/reports/faqs/time-series?${queryParams}`
      );

      setData(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        notify("error", error.response?.data?.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGranularityChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      granularity: event.target.value,
    }));
  };

  const handleFromDateChange = (date) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        from: dayjs(date).format("YYYY-MM-DD"),
      }));
    }
  };

  const handleToDateChange = (date) => {
    if (date) {
      setFilters((prev) => ({
        ...prev,
        to: dayjs(date).format("YYYY-MM-DD"),
      }));
    }
  };

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, []);

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

  // Group data by bucket
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.bucket]) {
      acc[item.bucket] = [];
    }
    acc[item.bucket].push(item);
    return acc;
  }, {});

  return (
    <MainCard
      title={
        <>
          {t("time_series")}
          <Chip label={data.length} color="error" sx={{ ml: 1 }} />
        </>
      }
    >
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box className={"filter-area"}>
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12, lg: 4 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.granularity}
                    onChange={handleGranularityChange}
                    displayEmpty
                    className="filter-input"
                    renderValue={(value) => {
                      if (!value) {
                        return <Typography color="gray">{t("granularity")}</Typography>;
                      }
                      return t(value);
                    }}
                  >
                    <MenuItem value="day">{t("day")}</MenuItem>
                    <MenuItem value="week">{t("week")}</MenuItem>
                    <MenuItem value="month">{t("month")}</MenuItem>
                    <MenuItem value="year">{t("year")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, lg: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={dayjs(filters.from)}
                    onChange={handleFromDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        className: "filter-input",
                        placeholder: t("from_date"),
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, lg: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={dayjs(filters.to)}
                    onChange={handleToDateChange}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        className: "filter-input",
                        placeholder: t("to_date"),
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
            </Grid2>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("date")}</TableCell>
                  <TableCell>{t("id")}</TableCell>
                  <TableCell sx={{ width: "60%" }}>{t("question")}</TableCell>
                  <TableCell align="center">{t("views")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton width={100} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={30} />
                      </TableCell>
                      <TableCell width="60%">
                        <Skeleton />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  Object.entries(groupedData).map(([bucket, items]) =>
                    items.map((row, index) => (
                      <TableRow key={`${bucket}-${row.id}`}>
                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            <Typography variant="body2" fontWeight="bold">
                              {dayjs(bucket).format("DD.MM.YYYY")}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.question}</TableCell>
                        <TableCell align="center">
                          <Chip color="error" label={row.views} />
                        </TableCell>
                      </TableRow>
                    ))
                  )
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
        </Box>
      </Box>
    </MainCard>
  );
}

