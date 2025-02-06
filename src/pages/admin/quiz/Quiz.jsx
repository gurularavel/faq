import React, { useState, useEffect } from "react";
import {
  Typography,
  Switch,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
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
import { useNavigate } from "react-router-dom";

export default function QuestionGroup() {
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
    searh: null,
  });

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
    let url = `/question-groups/load?`;

    for (const key in filters) {
      if (filters[key]) {
        url += `${key}=${filters[key]}&`;
      }
    }
    url = url.slice(0, -1);

    getData(url);
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
        >
          {t("new_quiz")}
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
      title: t("new_quiz"),
      element: <Add close={() => setModal(0)} setList={setData} />,
    },
    {
      title: t("edit_quiz"),
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

  const nav = useNavigate();
  const handleCardClick = (row) => {
    nav(`${row.id}`);
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <Box key={index} className="data-list-card">
          <Box sx={{ mt: 1 }} display="flex" justifyContent="flex-end">
            <Skeleton variant="rectangular" width={250} height={36} />
          </Box>
        </Box>
      ))}
    </>
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

  const DataList = () => {
    return (
      <div className="data-list">
        {isLoading ? (
          <LoadingSkeleton />
        ) : data.list.length > 0 ? (
          data.list.map((row, i) => (
            <div
              key={row.id}
              className="data-list-card"
              onClick={() => handleCardClick(row)}
            >
              <div className="title-wrapper">
                <Typography variant="h6">{row.title}</Typography>
              </div>

              <div className="progress-bar">
                <div className="line"></div>
              </div>
              <div className="card-actions">
                <Switch
                  checked={row.is_active}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleStatus(row.id, row.is_active);
                  }}
                  size="small"
                />
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftData(row);
                      setModal(2);
                    }}
                  >
                    <img src={EditIcon} alt="edit" />
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
                    <img src={DeleteIcon} alt="delete" />
                  </IconButton>
                </Box>
              </div>
            </div>
          ))
        ) : (
          <NoData />
        )}
      </div>
    );
  };

  return (
    <MainCard title={t("question_group")}>
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
          <DataList />{" "}
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
