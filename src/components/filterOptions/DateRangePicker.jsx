import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { CalendarOutlined } from "@ant-design/icons";

export default function DateRangePicker({
  name,
  data,
  setData,
  disableFuture = true,
}) {
  const t = useTranslate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [textFieldWidth, setTextFieldWidth] = useState(0);
  const textFieldRef = useRef(null);

  const [dates, setDates] = useState({
    firstDate: data.from_date ? dayjs(data.from_date) : null,
    secondDate: data.to_date ? dayjs(data.to_date) : null,
  });

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (
      dates.firstDate &&
      dates.secondDate &&
      dayjs(dates.firstDate).isBefore(dayjs(dates.secondDate))
    ) {
      setData((prev) => ({
        ...prev,
        from_date: dayjs(dates.firstDate).format("YYYY-MM-DD"),
        to_date: dayjs(dates.secondDate).format("YYYY-MM-DD"),
        page: 1,
      }));
    }
  }, [dates, setData]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTextFieldWidth(textFieldRef.current?.offsetWidth || 0);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDateChange = (key) => (newValue) => {
    setDates((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleReset = () => {
    setDates({
      firstDate: null,
      secondDate: null,
    });
    setData((prev) => ({
      ...prev,
      from_date: null,
      to_date: null,
      page: 1,
    }));
  };

  const formattedDateRange =
    dates.firstDate && dates.secondDate
      ? `${dayjs(dates.firstDate).format("YYYY-MM-DD")} - ${dayjs(
          dates.secondDate
        ).format("YYYY-MM-DD")}`
      : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box ref={textFieldRef}>
        <TextField
          size="small"
          placeholder={"Baş. Tarixi - Bit. Tarix"}
          value={formattedDateRange}
          onClick={handleOpen}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={handleOpen}>
                <CalendarOutlined />{" "}
              </IconButton>
            ),
          }}
          fullWidth
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: textFieldWidth,
            },
          }}
        >
          <MenuItem>
            <DatePicker
              label={"Baş. Tarixi "}
              value={dates.firstDate}
              maxDate={dates.secondDate ?? (disableFuture ? dayjs() : null)}
              onChange={handleDateChange("firstDate")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </MenuItem>
          <MenuItem>
            <DatePicker
              label={"Bit. Tarixi "}
              value={dates.secondDate}
              maxDate={disableFuture ? dayjs() : null}
              minDate={dates.firstDate ?? null}
              onChange={handleDateChange("secondDate")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </MenuItem>
          <MenuItem>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleReset}
            >
              Sıfırla
            </Button>
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
}
