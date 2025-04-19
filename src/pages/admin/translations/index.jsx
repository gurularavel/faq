import Grid2 from "@mui/material/Grid2";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
// import MainCard from "@components/MainCard";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useEffect, useState } from "react";
import { controlPrivateApi } from "@src/utils/axios/controlPrivateApi";
import Modal from "@components/modal";
import { Button, ButtonGroup, IconButton } from "@mui/material";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import Add from "./popups/Add";
import Edit from "./popups/Edit";
import DeleteModal from "@components/modal/DeleteModal";
import MainCard from "@components/card/MainCard";
import { useHeader } from "@hooks/useHeader";
import SearchInput from "@components/filterOptions/SearchInput";
import SearchDropdown from "@components/filterOptions/SearchDropdown";
import ResetIcon from "@assets/icons/reset.svg";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@assets/icons/delete.svg";
import EditIcon from "@assets/icons/edit.svg";
import { useLocation } from "react-router-dom";
export default function Translations() {
  const t = useTranslate();
  const { setContent } = useHeader();
  const loc = useLocation();
  const [pending, setPending] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [list, setList] = useState([]);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    group: null,
    key: null,
    text: null,
  });

  // reset filter
  const resetFilter = () =>
    setFilters({
      page: 1,
      limit: 10,
      group: null,
      key: null,
      text: null,
    });
  const getTranslations = async (queryParams) => {
    try {
      const res = await controlPrivateApi.get(
        `/translations/load?${queryParams}`
      );
      setLanguages(res.data.data.languages);
      setList(res.data.data.translations);

      // scrooll to id from url as hash
      setTimeout(() => {
        const hash = window.location.hash.substring(1);
        console.log(hash);

        if (hash) {
          const element = document.getElementById(hash);
          if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - 100;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }
      }, 1000);
    } catch (error) {
    } finally {
      setPending(false);
    }
  };
  useEffect(() => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        queryParams.append(key, value);
      }
    });
    getTranslations(queryParams);
  }, [filters]);

  //   modals
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(0);
  const [draftData, setDraftData] = useState(null);

  const deleteRow = async () => {
    try {
      const res = await controlPrivateApi.delete(
        `/translations/delete/${draftData?.group}/${draftData?.key}`
      );
      setList((prev) => prev.filter((e) => e.key != draftData.key));
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
      title: t("add"),
      element: (
        <Add langs={languages} close={() => setModal(0)} setList={setList} />
      ),
    },
    {
      title: t("edit"),
      element: (
        <Edit
          defaultData={draftData}
          langs={languages}
          close={() => setModal(0)}
          setList={setList}
        />
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
          {t("new_key")}
        </Button>
      </Box>
    );

    return () => setContent(null);
  }, []);

  return (
    <MainCard title={t("translations")}>
      <Modal
        open={open}
        fullScreenOnMobile={true}
        setOpen={setOpen}
        title={popups[modal].title}
        children={popups[modal].element}
        maxWidth={popups[modal].size ?? "md"}
      />
      <Box className="main-card-body">
        <Box className="main-card-body-inner">
          <Box className={"filter-area"}>
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 12, lg: 5 }}>
                <SearchInput
                  name="key"
                  data={filters}
                  setData={setFilters}
                  placeholder={t("key")}
                  searchIcon={true}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, lg: 3.25 }}>
                <SearchInput
                  name="text"
                  data={filters}
                  setData={setFilters}
                  placeholder={t("text")}
                  searchIcon={true}
                />
              </Grid2>
              <Grid2 size={{ xs: 9.5, lg: 3.25 }}>
                <SearchDropdown
                  name="group"
                  data={filters}
                  list={[
                    { id: "admin", title: "Admin" },
                    { id: "app", title: "App" },
                  ]}
                  setData={setFilters}
                  placeholder={t("group")}
                />
              </Grid2>

              <Grid2 size={{ xs: 2.5, lg: 0.5 }}>
                <Button className="filter-reset-btn" onClick={resetFilter}>
                  <img src={ResetIcon} alt="reset" />
                </Button>
              </Grid2>
            </Grid2>
          </Box>

          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              position: "relative",
              display: "block",
              maxWidth: "100%",
              "& td, & th": { whiteSpace: "nowrap" },
            }}
          >
            <Table aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <TableCell>{t("key")}</TableCell>
                  {languages.map((lang) => (
                    <TableCell sx={{ maxWidth: "300px" }} key={lang.id}>
                      {t("translation")} {lang.key}
                    </TableCell>
                  ))}
                  <TableCell>{t("group")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((item) => (
                  <TableRow
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    tabIndex={-1}
                    key={item.key + item.group}
                    id={item.key}
                  >
                    <TableCell>{item.key}</TableCell>
                    {languages.map((lang) => (
                      <TableCell key={lang.id}>
                        <Typography
                          variant="body1"
                          sx={{ maxWidth: "400px", whiteSpace: "wrap" }}
                        >
                          {item[`lang_${lang.key}`]}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell>{item.group}</TableCell>
                    <TableCell>
                      <ButtonGroup sx={{ height: "30px" }}>
                        <IconButton
                          onClick={() => {
                            setDraftData(item);
                            setModal(2);
                          }}
                        >
                          <img src={EditIcon} alt="edit icon" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDraftData(item);
                            setModal(3);
                          }}
                        >
                          <img src={DeleteIcon} />
                        </IconButton>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </MainCard>
  );
}
