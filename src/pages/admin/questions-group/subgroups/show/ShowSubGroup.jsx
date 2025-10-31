import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid2,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Skeleton,
  Stack,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import { useTranslate } from "@src/utils/translations/useTranslate";
import MainCard from "@components/card/MainCard";
import { useParams } from "react-router-dom";
import DeleteIcon from "@assets/icons/delete.svg";
import AddIcon from "@mui/icons-material/Add";

export default function ShowSubGroup() {
  const t = useTranslate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [subgroupData, setSubgroupData] = useState(null);
  const [availableFaqs, setAvailableFaqs] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingDialog, setIsLoadingDialog] = useState(false);
  const [isRemovingPin, setIsRemovingPin] = useState(false);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [togglingFaqIds, setTogglingFaqIds] = useState(new Set());

  // Fetch subgroup details
  const getSubgroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await controlPrivateApi.get(`/categories/show/${id}`);
      setSubgroupData(res.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error fetching data", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Fetch available FAQs for pinning
  const getAvailableFaqs = useCallback(async (forDialog = false) => {
    if (forDialog) {
      setIsLoadingDialog(true);
    } else {
      setIsLoadingFaqs(true);
    }
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
      if (forDialog) {
        setIsLoadingDialog(false);
      } else {
        setIsLoadingFaqs(false);
      }
    }
  }, [id]);

  // Remove pinned FAQ
  const removePinnedFaq = async () => {
    setIsRemovingPin(true);
    try {
      const res = await controlPrivateApi.post(
        `/categories/${id}/selected-faqs/remove-pinned-faq`
      );
      notify(res.data.message || "Pinned FAQ removed successfully", "success");
      getSubgroupData();
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
      getSubgroupData();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error pinning FAQ", "error");
      }
    }
  };

  // Add FAQ to selected list
  const addFaqToSelected = async (faqId) => {
    setTogglingFaqIds(prev => new Set(prev).add(faqId));
    try {
      const res = await controlPrivateApi.post(
        `/categories/${id}/selected-faqs/add`,
        { faq_id: faqId }
      );
      notify(res.data.message || "FAQ added successfully", "success");
      getAvailableFaqs();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error adding FAQ", "error");
      }
    } finally {
      setTogglingFaqIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(faqId);
        return newSet;
      });
    }
  };

  // Remove FAQ from selected list
  const removeFaqFromSelected = async (faqId) => {
    setTogglingFaqIds(prev => new Set(prev).add(faqId));
    try {
      const res = await controlPrivateApi.post(
        `/categories/${id}/selected-faqs/remove`,
        { faq_id: faqId }
      );
      notify(res.data.message || "FAQ removed successfully", "success");
      getAvailableFaqs();
    } catch (error) {
      if (isAxiosError(error)) {
        notify(error.response?.data?.message || "Error removing FAQ", "error");
      }
    } finally {
      setTogglingFaqIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(faqId);
        return newSet;
      });
    }
  };

  // Toggle FAQ selection
  const toggleFaqSelection = (faq) => {
    if (faq.selected_in_category) {
      removeFaqFromSelected(faq.id);
    } else {
      addFaqToSelected(faq.id);
    }
  };

  useEffect(() => {
    getSubgroupData();
    getAvailableFaqs();
  }, [id, getSubgroupData, getAvailableFaqs]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    getAvailableFaqs(true);
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

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={150} />
        </CardContent>
      </Card>
    </Stack>
  );

  if (isLoading) {
    return (
      <MainCard title={t("subgroup_details") || "Subgroup Details"} hasBackBtn={true}>
        <Box className="main-card-body">
          <Box className="main-card-body-inner">
            <LoadingSkeleton />
          </Box>
        </Box>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard 
        title={subgroupData?.translations?.[0]?.title || t("subgroup_details")} 
        hasBackBtn={true}
      >
        <Box className="main-card-body">
          <Box className="main-card-body-inner">
            <Stack spacing={3}>
              

              {/* Pinned FAQ */}
              <Box padding={3}>
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      {t("pinned_faq") || "Pinned FAQ"}
                    </Typography>
                    {!subgroupData?.pinned_faq && (
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

                  {subgroupData?.pinned_faq ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {subgroupData.pinned_faq.question}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {stripHtmlTags(subgroupData.pinned_faq.answer)}
                          </Typography>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={removePinnedFaq}
                          disabled={isRemovingPin}
                          sx={{ ml: 1 }}
                        >
                          <img src={DeleteIcon} alt="remove pin" />
                        </IconButton>
                      </Box>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t("id") || "ID"}
                          </Typography>
                          <Typography variant="body2">
                            {subgroupData.pinned_faq.id}
                          </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t("seen_count") || "Seen Count"}
                          </Typography>
                          <Typography variant="body2">
                            {subgroupData.pinned_faq.seen_count}
                          </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t("updated_date") || "Updated Date"}
                          </Typography>
                          <Typography variant="body2">
                            {subgroupData.pinned_faq.updated_date}
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

              {/* Available FAQs Table */}
              <Box padding={3}>
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      {t("available_faqs") || "Available FAQs"}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {isLoadingFaqs ? (
                    <Stack spacing={1}>
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={60} />
                      ))}
                    </Stack>
                  ) : availableFaqs.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t("id") || "ID"}</TableCell>
                            <TableCell>{t("question") || "Question"}</TableCell>
                            <TableCell align="center">{t("action") || "Action"}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {availableFaqs.map((faq) => (
                            <TableRow key={faq.id}>
                              <TableCell>{faq.id}</TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {faq.question}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  color={faq.selected_in_category ? "error" : "success"}
                                  onClick={() => toggleFaqSelection(faq)}
                                  disabled={togglingFaqIds.has(faq.id)}
                                >
                                  {togglingFaqIds.has(faq.id) ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : faq.selected_in_category ? (
                                    t("remove") || "Remove"
                                  ) : (
                                    t("add") || "Add"
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      py={4}
                    >
                      <Typography variant="body1" color="text.secondary">
                        {t("no_available_faqs") || "No available FAQs"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </MainCard>

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
    </>
  );
}

