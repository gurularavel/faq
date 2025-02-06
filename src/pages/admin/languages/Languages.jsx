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

export default function Languages() {
  const t = useTranslate();
  const { setContent } = useHeader();
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
      const res = await controlPrivateApi.get(`/languages/load?${queryParams}`);

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

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await controlPrivateApi.post(
        `/languages/change-active-status/${id}`,
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
        >
          {t("new_languages")}
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
        `/languages/delete/${draftData?.id}`
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
      title: t("new_language"),
      element: <Add close={() => setModal(0)} setList={setData} />,
    },
    {
      title: t("edit_language"),
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

  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} padding={2} borderBottom={"1px solid #E6E9ED"}>
          <Skeleton variant="text" width="70%" height={24} />
          <Box sx={{ mt: 2 }} display="flex" justifyContent="space-between">
            <Skeleton variant="rectangular" width={40} height={20} />
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
            <TableCell sx={{ width: "50%" }} colSpan={3}>
              {t("title")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton width={20} />
                </TableCell>
                <TableCell width="100%">
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
              <TableRow key={row.id}>
                <TableCell>
                  {filters.page * filters.limit - filters.limit + i + 1}
                </TableCell>
                <TableCell width="100%">{row.title}</TableCell>
                <TableCell>
                  <Switch
                    checked={row.is_active}
                    onChange={() => toggleStatus(row.id, row.is_active)}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: "120px" }}>
                  <IconButton
                    onClick={() => {
                      setDraftData(row);
                      setModal(2);
                    }}
                  >
                    <img src={EditIcon} alt="edit icon" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setDraftData(row);
                      setModal(3);
                    }}
                  >
                    <img src={DeleteIcon} />
                  </IconButton>
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
              {row.title}
            </Typography>
            <Box
              sx={{ mt: 2 }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Switch
                checked={row.is_active}
                onChange={() => toggleStatus(row.id, row.is_active)}
              />
              <Box>
                <IconButton
                  onClick={() => {
                    setDraftData(row);
                    setModal(2);
                  }}
                >
                  <img src={EditIcon} alt="edit icon" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    setDraftData(row);
                    setModal(3);
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
    <MainCard title={t("languages")}>
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
          <Box className={"filter-area"}>
            <SearchInput
              name="search"
              data={filters}
              setData={setFilters}
              placeholder={t("search")}
              searchIcon={true}
            />
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
