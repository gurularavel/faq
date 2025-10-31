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
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import { useLocation } from "react-router-dom";

export default function TopStatistics() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [data, setData] = useState([]);

  // Parse URL query parameters on initial load
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      period: params.get("period") || "week",
      limit: parseInt(params.get("limit")) || 10,
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
        `/reports/faqs/top-statistics?${queryParams}&calendar=no`
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

  const handlePeriodChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      period: event.target.value,
    }));
  };

  const handleLimitChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      limit: event.target.value,
    }));
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

  return (
    <MainCard
      title={
        <>
          {t("top_statistics")}
          <Chip label={data.length} color="error" sx={{ ml: 1 }} />
        </>
      }
    >
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box className={"filter-area"}>
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12, lg: 6 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.period}
                    onChange={handlePeriodChange}
                    displayEmpty
                    className="filter-input"
                    renderValue={(value) => {
                      if (!value) {
                        return <Typography color="gray">{t("period")}</Typography>;
                      }
                      return t(value);
                    }}
                  >
                    <MenuItem value="week">{t("week")}</MenuItem>
                    <MenuItem value="month">{t("month")}</MenuItem>
                    <MenuItem value="year">{t("year")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, lg: 6 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.limit}
                    onChange={handleLimitChange}
                    displayEmpty
                    className="filter-input"
                    renderValue={(value) => {
                      if (!value) {
                        return <Typography color="gray">{t("limit")}</Typography>;
                      }
                      return value;
                    }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("id")}</TableCell>
                  <TableCell sx={{ width: "70%" }}>{t("question")}</TableCell>
                  <TableCell align="center">{t("views")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton width={30} />
                      </TableCell>
                      <TableCell width="70%">
                        <Skeleton />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.question}</TableCell>
                      <TableCell align="center">
                        <Chip color="error" label={row.views} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
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

