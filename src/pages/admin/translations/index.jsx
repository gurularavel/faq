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
import { Button, ButtonGroup } from "@mui/material";
import { notify } from "@src/utils/toast/notify";
import { isAxiosError } from "axios";
import Add from "./popups/Add";
import Edit from "./popups/Edit";
import DeleteModal from "@components/modal/DeleteModal";
import { DeleteForever } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import MainCard from "../../../components/card/MainCard";
export default function Translations() {
  const t = useTranslate();

  const [pending, setPending] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [list, setList] = useState([]);
  const getFilters = async () => {
    try {
      const res = await controlPrivateApi.get("/control/translations/filters");
    } catch (error) {
    } finally {
      setPending(false);
    }
  };
  const getTranslations = async () => {
    try {
      const res = await controlPrivateApi.get("/control/translations/load");
      setLanguages(res.data.data.languages);
      setList(res.data.data.translations);
    } catch (error) {
    } finally {
      setPending(false);
    }
  };
  useEffect(() => {
    getTranslations();
    getFilters();
  }, []);

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

  return (
    <Grid2 container rowSpacing={4.5} columnSpacing={2.75}>
      <Modal
        open={open}
        fullScreenOnMobile={true}
        setOpen={setOpen}
        title={popups[modal].title}
        children={popups[modal].element}
        maxWidth={popups[modal].size ?? "md"}
      />
      {/* row 1 */}
      <Grid2 item size={{ xs: 12 }} sx={{ mb: -2.25 }}>
        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography variant="h5">{t("translations")}</Typography>
          <Button variant="contained" onClick={() => setModal(1)}>
            {t("add")}
          </Button>
        </Box>
      </Grid2>
      <Grid2 item size={{ xs: 12 }}>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box>
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
                      <TableCell key={lang.id}>
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
                      key={item.key}
                    >
                      <TableCell>{item.key}</TableCell>
                      {languages.map((lang) => (
                        <TableCell key={lang.id}>
                          {item[`lang_${lang.key}`]}
                        </TableCell>
                      ))}
                      <TableCell>{item.group}</TableCell>
                      <TableCell>
                        <ButtonGroup sx={{ height: "30px" }}>
                          <Tooltip title={t("edit")}>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setDraftData(item);
                                setModal(2);
                              }}
                            >
                              <EditIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip title={t("delete")}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setDraftData(item);
                                setModal(3);
                              }}
                            >
                              <DeleteForever />
                            </Button>
                          </Tooltip>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </MainCard>
      </Grid2>
    </Grid2>
  );
}
