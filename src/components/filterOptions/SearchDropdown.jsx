import React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

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

  // Recursive function to find item by id
  const findItemById = (items, targetId) => {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.subs) {
        const found = findItemById(item.subs, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to flatten the nested items
  const flattenItems = (items, depth = 0) => {
    return items.reduce((acc, item) => {
      acc.push({ ...item, depth });
      if (item.subs?.length) {
        acc.push(...flattenItems(item.subs, depth + 1));
      }
      return acc;
    }, []);
  };

  const flatList = flattenItems(list);

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
          const selectedItem = findItemById(list, value);
          return selectedItem?.title || "";
        }}
      >
        {flatList.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            sx={{
              pl: item.depth * 2 + 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {item.title}
            {item.subs?.length > 0 && (
              <KeyboardArrowRightIcon fontSize="small" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
