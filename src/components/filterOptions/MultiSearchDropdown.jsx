import React from "react";
import { Select, MenuItem, FormControl } from "@mui/material";

export default function MultiSearchDropdown({
  list,
  name,
  data,
  setData,
  field = "id",
}) {
  const handleSelectChange = (event) => {
    const selectedValues = event.target.value;

    if (selectedValues.includes("null") || selectedValues.length === 0) {
      setData((prev) => ({
        ...prev,
        [name]: null,
        page: 1,
      }));
      return;
    }

    setData((prev) => ({
      ...prev,
      [name]: selectedValues,
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

  const value = data[name] || [];

  return (
    <FormControl fullWidth size="small">
      <Select
        value={value}
        onChange={handleSelectChange}
        displayEmpty
        multiple
        MenuProps={MenuProps}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return "Hamısı";
          }
          return list
            .filter((item) => selected.includes(item[field]))
            .map((item) => item.title)
            .join(", ");
        }}
      >
        <MenuItem value="null">{"Hamısı"}</MenuItem>
        {list.map((item) => (
          <MenuItem key={item.id} value={item[field]}>
            {item.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
