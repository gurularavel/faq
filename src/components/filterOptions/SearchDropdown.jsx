import React from "react";
import { Select, MenuItem, FormControl } from "@mui/material";

export default function SearchDropdown({
  list,
  name,
  data,
  setData,
  field = "id",
}) {
  const handleSelectChange = (event) => {
    const value = event.target.value;
    setData((prev) => ({
      ...prev,
      [name]: value === "null" ? null : value,
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
        value={data[name] || "null"}
        onChange={handleSelectChange}
        displayEmpty
        className="filter-input"
        MenuProps={MenuProps}
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
