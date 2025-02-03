import { InputAdornment, TextField } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import SearchIcon from "@assets/icons/input-search.svg";

export default function SearchInput({
  name,
  data,
  setData,
  placeholder = "",
  searchIcon = false,
}) {
  const [inputValue, setInputValue] = useState(data[name] || "");
  const debounceTimeout = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setData((prev) => ({
        ...prev,
        [name]: inputValue || null,
        page: 1,
      }));
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue, name, setData]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <TextField
      size="small"
      name={name}
      value={inputValue}
      onChange={handleChange}
      fullWidth
      placeholder={placeholder}
      className="filter-input"
      slotProps={
        searchIcon
          ? {
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={SearchIcon} alt="search" />
                  </InputAdornment>
                ),
              },
            }
          : {}
      }
    />
  );
}
