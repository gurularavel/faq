import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Switch,
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
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@assets/icons/delete.svg";
import EditIcon from "@assets/icons/edit.svg";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useHeader } from "@hooks/useHeader";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import Modal from "@components/modal";
import DeleteModal from "@components/modal/DeleteModal";
import SearchInput from "@components/filterOptions/SearchInput";
import Add from "./popups/Add";
import Edit from "./popups/Edit";
import { useNavigate, useLocation } from "react-router-dom";
import ResetIcon from "@assets/icons/reset.svg";

export default function QuestionGroup() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();
  const location = useLocation();

  const [data, setData] = useState({
    list: [],
    total: 0,
  });

  // Parse URL query parameters on initial load
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      page: parseInt(params.get("page")) || 1,
      limit: Math.min(parseInt(params.get("limit")) || 10, 100),
      search: params.get("search") || "",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  // reset filter
  const resetFilter = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      search: "",
    };
    setFilters(defaultFilters);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async (queryParams) => {
    setIsLoading(true);

    try {
      const res = await controlPrivateApi.get(
        `/categories/load?${queryParams}`
      );

      setData({
        list: res.data.data,
        total: res.data.meta.total,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error fetching data", "error");
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

    // Replace current URL with new query parameters without reloading the page
    const newUrl = `${location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);

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

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await controlPrivateApi.post(
        `/categories/change-active-status/${id}`,
        {
          is_active: !currentStatus,
        }
      );
      setData((prevData) => ({
        ...prevData,
        list: prevData.list.map((item) =>
          item.id === id ? { ...item, is_active: !currentStatus } : item
        ),
      }));
      notify(res.data.message, "success");
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to update status",
          "error"
        );
      }
    }
  };

  //   set add button to header
  useEffect(() => {
    setContent(
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setModal(1)}
          sx={{
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 1 },
            },
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {t("new_question_group")}
          </Box>
        </Button>
      </Box>
    );

    return () => setContent(null);
  }, []);

  //   modals
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(0);
  const [draftData, setDraftData] = useState(null);

  const deleteRow = async () => {
    try {
      const res = await controlPrivateApi.delete(
        `/categories/delete/${draftData?.id}`
      );
      setData((prev) => ({
        ...prev,
        list: [...prev.list.filter((e) => e.id !== draftData.id)],
      }));
      notify(res.data.message, "success");
      setDraftData(null);
      setModal(0);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const popups = [
    "",
    {
      title: t("new_category"),
      element: <Add close={() => setModal(0)} setList={setData} />,
    },
    {
      title: t("edit_category"),
      element: (
        <Edit id={draftData?.id} close={() => setModal(0)} setList={setData} />
      ),
    },
    {
      title: "",
      element: <DeleteModal onSuccess={deleteRow} close={() => setModal(0)} />,
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

  const handleCardClick = (row) => {
    nav(`${row.id}`);
  };

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Skeleton variant="rectangular" width="70%" height={24} />

          <Box sx={{ mt: 2 }} display="flex" justifyContent="space-between">
            <Skeleton variant="rectangular" width={100} height={20} />

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
            <TableCell></TableCell>
            <TableCell>{t("icon")}</TableCell>
            <TableCell sx={{ width: "50%" }}>{t("title")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell>{t("actions")}</TableCell>
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
                  <Skeleton variant="circular" width={40} height={40} />
                </TableCell>
                <TableCell width="50%">
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton width={40} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : data.list.length > 0 ? (
            data.list.map((row, i) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => handleCardClick(row)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  {filters.page * filters.limit - filters.limit + i + 1}
                </TableCell>
                <TableCell>
                  {row.icon ? (
                    <img
                      src={row.icon}
                      alt="category icon"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                      }}
                    >
                      -
                    </Box>
                  )}
                </TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>
                  <Switch
                    checked={row.is_active}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleStatus(row.id, row.is_active);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftData(row);
                      setModal(2);
                    }}
                  >
                    <img src={EditIcon} alt="edit icon" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftData(row);
                      setModal(3);
                    }}
                  >
                    <img src={DeleteIcon} alt="delete icon" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
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
          <Box
            key={row.id}
            padding={2}
            borderBottom={"1px solid #E6E9ED"}
            onClick={() => handleCardClick(row)}
            sx={{ cursor: "pointer" }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              {row.icon ? (
                <img
                  src={row.icon}
                  alt="category icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    flexShrink: 0,
                  }}
                >
                  -
                </Box>
              )}
              <Typography variant="body1" fontWeight="medium">
                {filters.page * filters.limit - filters.limit + i + 1}.{" "}
                {row.title}
              </Typography>
            </Box>
            <Box
              sx={{ mt: 2 }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Switch
                checked={row.is_active}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleStatus(row.id, row.is_active);
                }}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                onClick={(e) => e.stopPropagation()}
              >
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftData(row);
                      setModal(2);
                    }}
                  >
                    <img src={EditIcon} alt="edit icon" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftData(row);
                      setModal(3);
                    }}
                  >
                    <img src={DeleteIcon} alt="delete icon" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}
    </Stack>
  );

  return (
    <MainCard title={t("question_group")}>
      <Modal
        open={open}
        fullScreenOnMobile={false}
        setOpen={setOpen}
        title={popups[modal].title}
      >
        {popups[modal].element}
      </Modal>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box className={"filter-area"}>
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 9.5, lg: 11.5 }}>
                <SearchInput
                  name="search"
                  data={filters}
                  setData={setFilters}
                  placeholder={t("search")}
                  searchIcon={true}
                />
              </Grid2>
              <Grid2 size={{ xs: 2.5, lg: 0.5 }}>
                <Button className="filter-reset-btn" onClick={resetFilter}>
                  <img src={ResetIcon} alt="reset" />
                </Button>
              </Grid2>
            </Grid2>
          </Box>
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
