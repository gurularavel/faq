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
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import SearchDropdown from "@components/filterOptions/SearchDropdown";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { DocumentScanner, UploadFile } from "@mui/icons-material";
import ResetIcon from "@assets/icons/reset.svg";
import OrderBtn from "@components/filterOptions/OrderBtn";
import dayjs from "dayjs";

export default function Questions() {
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
      category: params.get("category")
        ? parseInt(params.get("category"))
        : null,
      search: params.get("search") || "",
      status: params.get("status") ? parseInt(params.get("status")) : null,
      sort: params.get("sort") || null,
      sort_type: params.get("sort_type") || null,
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

  // reset filter
  const resetFilter = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      category: null,
      search: "",
      status: null,
      sort: null,
      sort_type: null,
    };
    setFilters(defaultFilters);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getData = async (queryParams) => {
    setIsLoading(true);

    try {
      const res = await controlPrivateApi.get(`/faqs/load?${queryParams}`);

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
        `/faqs/change-active-status/${id}`,
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
      console.log(error);
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to update status",
          "error"
        );
      }
    }
  };

  // get filter options list
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await controlPrivateApi.get("/categories/list?with_subs=yes");
      setCategories(
        res.data.data.map((category) => ({
          id: category.id,
          title: category.title,
          subs: category.subs,
        }))
      );
    } catch (error) {
      notify(
        error.response.data.message ?? "Error loading categories",
        "error"
      );
    }
  };

  //   set add button to header
  useEffect(() => {
    fetchCategories();
    setContent(
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<UploadFile />}
          size="small"
          component={Link}
          to={"import-question"}
          sx={{
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 1 },
            },
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {t("import_questions")}
          </Box>
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          size="small"
          component={Link}
          to={"add-question"}
          sx={{
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 1 },
            },
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {t("new_question")}
          </Box>
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<DocumentScanner />}
          size="small"
          component={Link}
          to={"pdf-export"}
          sx={{
            "& .MuiButton-startIcon": {
              mr: { xs: 0, sm: 1 },
            },
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {t("pdf_export")}
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
        `/faqs/delete/${draftData?.id}`
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
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
                <Grid2 size={6}>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </Grid2>
              </Grid2>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }} display="flex" justifyContent="flex-end">
            <Box display={"flex"}>
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ mr: 1 }}
              />
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
            <TableCell>
              <OrderBtn column="id" data={filters} setData={setFilters} />
            </TableCell>
            <TableCell sx={{ width: "40%" }}>{t("title")}</TableCell>
            <TableCell>{t("categories")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell align="center" sx={{ minWidth: "160px" }}>
              {t("search_count")}

              <OrderBtn
                column="seen_count"
                data={filters}
                setData={setFilters}
              />
            </TableCell>
            <TableCell>{t("updated_date")}</TableCell>
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
                <TableCell width="50%">
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton width={150} />
                </TableCell>
                <TableCell>
                  <Skeleton width={40} />
                </TableCell>
                <TableCell>
                  <Skeleton width={40} />
                </TableCell>
                <TableCell>
                  <Skeleton width={40} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : data.list.length > 0 ? (
            data.list.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.question}</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {row.categories?.map((category, index) => (
                      <Box key={index} display="flex" flexDirection="column">
                        {category.parent && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {category.parent.title}
                          </Typography>
                        )}
                        <Chip
                          label={category.title}
                          size="small"
                          color="default"
                          sx={{ 
                            maxWidth: "fit-content",
                            fontSize: "0.75rem"
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={row.is_active}
                    onChange={() => toggleStatus(row.id, row.is_active)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip color="error" label={row.seen_count} />
                </TableCell>
                <TableCell>
                  {dayjs(row.updated_date).format("DD.MM.YYYY  HH:mm")}
                </TableCell>

                <TableCell sx={{ minWidth: "150px" }}>
                  <IconButton
                    onClick={() => {
                      nav(`show-question/${row.id}`);
                    }}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      nav(`edit-question/${row.id}`);
                    }}
                  >
                    <img src={EditIcon} alt="edit icon" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setDraftData(row);
                      setModal(1);
                    }}
                  >
                    <img src={DeleteIcon} />
                  </IconButton>
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
        data.list.map((row) => (
          <Box key={row.id} padding={2} borderBottom={"1px solid #E6E9ED"}>
            <Typography variant="body1">
              {row.id}. {row.question}
            </Typography>
            <Box mt={1}>
              <Grid2 container spacing={1}>
                <Grid2 size={12}>
                  <Typography variant="body" fontWeight={"bold"} mb={0.5}>
                    {t("categories")}:
                  </Typography>
                  <Stack spacing={0.5}>
                    {row.categories?.map((category, index) => (
                      <Box key={index} display="flex" flexDirection="column">
                        {category.parent && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {category.parent.title}
                          </Typography>
                        )}
                        <Chip
                          label={category.title}
                          size="small"
                          color="default"
                          sx={{ 
                            maxWidth: "fit-content",
                            fontSize: "0.75rem"
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Grid2>

                <Grid2 size={12} display={"flex"} gap={1} alignItems={"center"}>
                  <Typography variant="body">{t("updated_date")}:</Typography>
                  <Typography variant="body">
                    {dayjs(row.updated_date).format("DD.MM.YYYY  HH:mm")}
                  </Typography>
                </Grid2>

                <Grid2 size={12} display={"flex"} gap={1} alignItems={"center"}>
                  <Typography variant="body">{t("status")}</Typography>
                  <Switch
                    checked={row.is_active === 1}
                    onChange={() => toggleStatus(row.id, row.is_active)}
                  />
                </Grid2>
                <Grid2 size={12} display={"flex"} gap={1} alignItems={"center"}>
                  <Typography variant="body">{t("search_count")}</Typography>
                  <Chip color="error" label={row.seen_count} />
                </Grid2>
              </Grid2>
            </Box>
            <Box
              sx={{ mt: 2 }}
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Box>
                <IconButton
                  onClick={() => {
                    nav(`show-question/${row.id}`);
                  }}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    nav(`edit-question/${row.id}`);
                  }}
                >
                  <img src={EditIcon} alt="edit icon" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    setDraftData(row);
                    setModal(1);
                  }}
                >
                  <img src={DeleteIcon} />
                </IconButton>
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
    <MainCard
      title={
        <>
          {t("questions_count")}:
          <Chip label={data.total} color="error" sx={{ ml: 1 }} />
        </>
      }
    >
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
              <Grid2 size={{ xs: 12, lg: 5 }}>
                <SearchInput
                  name="search"
                  data={filters}
                  setData={setFilters}
                  placeholder={t("search")}
                  searchIcon={true}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, lg: 3.25 }}>
                <SearchDropdown
                  name="category"
                  data={filters}
                  list={categories}
                  setData={setFilters}
                  placeholder={t("category")}
                />
              </Grid2>
              <Grid2 size={{ xs: 9.5, lg: 3.25 }}>
                <SearchDropdown
                  name="status"
                  data={filters}
                  list={[
                    { id: 1, title: t("active") },
                    { id: 2, title: t("deactive") },
                  ]}
                  setData={setFilters}
                  placeholder={t("status")}
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
