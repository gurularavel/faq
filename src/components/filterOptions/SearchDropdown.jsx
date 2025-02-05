import React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchDropdown({
  list,
  name,
  data,
  setData,
  placeholder = "",
}) {
  const handleSelectChange = (event) => {
    const value = event.target.value;
    setData((prev) => ({
      ...prev,
      [name]: value ?? null,
      page: 1,
    }));
  };

  const handleClear = (event) => {
    event.stopPropagation();
    setData((prev) => ({
      ...prev,
      [name]: null,
      page: 1,
    }));
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: "auto",
      },
    },
  };

  return (
    <FormControl fullWidth size="small">
      <Select
        value={data[name] || ""}
        onChange={handleSelectChange}
        displayEmpty
        className="filter-input"
        MenuProps={MenuProps}
        endAdornment={
          data[name] ? (
            <IconButton
              size="small"
              sx={{ mr: 2 }}
              onClick={handleClear}
              tabIndex={-1}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null
        }
        renderValue={(value) => {
          if (!value) {
            return <Typography color="gray">{placeholder}</Typography>;
          }
          return list.find((e) => e.id == value).title;
        }}
      >
        {list.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
