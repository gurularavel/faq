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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Chip,
  CircularProgress,
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
import Add from "./popups/Add";
import Edit from "./popups/Edit";
import { useNavigate, useParams } from "react-router-dom";
import ResetIcon from "@assets/icons/reset.svg";

export default function QuestionsSubGroup() {
  const { id } = useParams();
  const t = useTranslate();
  const { setContent } = useHeader();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [info, setInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState({
    list: [],
    total: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: null,
  });

  // Pin FAQ states
  const [availableFaqs, setAvailableFaqs] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingDialog, setIsLoadingDialog] = useState(false);
  const [isRemovingPin, setIsRemovingPin] = useState(false);

  // reset filter
  const resetFilter = () =>
    setFilters({
      page: 1,
      limit: 10,
      search: null,
    });

  const getInfo = async () => {
    try {
      const res = await controlPrivateApi.get(`/categories/show/${id}`);
      setInfo(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response.status == 404) {
          nav(-1);
        }
      }
    }
  };

  const getData = async (url) => {
    setIsLoading(true);

    try {
      const res = await controlPrivateApi.get(url);

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
    let url = `/categories/subs/${id}?`;

    for (const key in filters) {
      if (filters[key]) {
        url += `${key}=${filters[key]}&`;
      }
    }
    url = url.slice(0, -1);

    getData(url);
  }, [filters, id]);

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

  // Fetch available FAQs for pinning
  const getAvailableFaqs = async () => {
    setIsLoadingDialog(true);
    try {
      const res = await controlPrivateApi.get(
        `/categories/${id}/selected-faqs/available-list`
      );
      setAvailableFaqs(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error fetching available FAQs",
          "error"
        );
      }
    } finally {
      setIsLoadingDialog(false);
    }
  };

  // Remove pinned FAQ
  const removePinnedFaq = async () => {
    setIsRemovingPin(true);
    try {
      const res = await controlPrivateApi.post(
        `/categories/${id}/selected-faqs/remove-pinned-faq`
      );
      notify(res.data.message || "Pinned FAQ removed successfully", "success");
      getInfo();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Error removing pinned FAQ",
          "error"
        );
      }
    } finally {
      setIsRemovingPin(false);
    }
  };

  // Add pinned FAQ
  const addPinnedFaq = async (faqId) => {
    try {
      const res = await controlPrivateApi.post(
        `/categories/${id}/selected-faqs/choose-pinned-faq/${faqId}`
      );
      notify(res.data.message || "FAQ pinned successfully", "success");
      setIsDialogOpen(false);
      getInfo();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error pinning FAQ", "error");
      }
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    getAvailableFaqs();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Strip HTML tags for display
  const stripHtmlTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  //   set add button to header
  useEffect(() => {
    getInfo();
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
            {t("new_question_subgroup")}
          </Box>
        </Button>
      </Box>
    );

    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    nav(`show/${row.id}`);
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
                <TableCell sx={{ minWidth: "160px" }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`show/${row.id}`);
                    }}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
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
                onChange={() => toggleStatus(row.id, row.is_active)}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    nav(`show/${row.id}`);
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setDraftData(row);
                    setModal(2);
                  }}
                >
                  <img src={EditIcon} alt="edit icon" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setDraftData(row);
                    setModal(3);
                  }}
                >
                  <img src={DeleteIcon} alt="delete icon" />
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
    <MainCard title={info?.translations?.[0]?.title} hasBackBtn={true}>
      <Modal
        open={open}
        fullScreenOnMobile={false}
        setOpen={setOpen}
        title={popups[modal].title}
        maxWidth={popups[modal].size ?? "md"}
      >
        {popups[modal].element}
      </Modal>
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          {/* Pinned FAQ Section */}
          <Box padding={3} mb={2}>
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" mb={4}>
                  {t("pinned_faq") || "Pinned FAQ"}
                </Typography>
                {!info?.pinned_faq && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={handleOpenDialog}
                  >
                    {t("pin_faq") || "Pin FAQ"}
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {info?.pinned_faq ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {info.pinned_faq.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {stripHtmlTags(info.pinned_faq.answer)}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={removePinnedFaq}
                      disabled={isRemovingPin}
                      sx={{ ml: 1 }}
                    >
                      {isRemovingPin ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <img src={DeleteIcon} alt="remove pin" />
                      )}
                    </IconButton>
                  </Box>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("id") || "ID"}
                      </Typography>
                      <Typography variant="body2">
                        {info.pinned_faq.id}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("seen_count") || "Seen Count"}
                      </Typography>
                      <Typography variant="body2">
                        {info.pinned_faq.seen_count}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("updated_date") || "Updated Date"}
                      </Typography>
                      <Typography variant="body2">
                        {info.pinned_faq.updated_date}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Paper>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  py={4}
                >
                  <Typography variant="body1" color="text.secondary">
                    {t("no_pinned_faq") || "No pinned FAQ"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("click_to_add_pinned_faq") || "Click the button above to pin an FAQ"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

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

      {/* Dialog for selecting FAQ to pin */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("select_faq_to_pin") || "Select FAQ to Pin"}</DialogTitle>
        <DialogContent dividers>
          {isLoadingDialog ? (
            <Stack spacing={1}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={60} />
              ))}
            </Stack>
          ) : availableFaqs.length > 0 ? (
            <List>
              {availableFaqs.map((faq) => (
                <ListItem key={faq.id} disablePadding>
                  <ListItemButton
                    onClick={() => addPinnedFaq(faq.id)}
                    sx={{
                      border: "1px solid #E6E9ED",
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {faq.question}
                        </Typography>
                      }
                      secondary={
                        <Box mt={1}>
                          <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 6, sm: 4 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t("id") || "ID"}: {faq.id}
                              </Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 6, sm: 4 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t("seen_count") || "Seen"}: {faq.seen_count}
                              </Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                              <Chip
                                label={faq.is_active ? t("active") : t("inactive")}
                                size="small"
                                color={faq.is_active ? "success" : "default"}
                              />
                            </Grid2>
                          </Grid2>
                          {faq.tags?.length > 0 && (
                            <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                              {faq.tags.map((tag) => (
                                <Chip
                                  key={tag.id}
                                  label={tag.title}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <Typography variant="body1" color="text.secondary">
                {t("no_available_faqs") || "No available FAQs to pin"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("close") || "Close"}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
