import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { setCurrentLang } from "@src/store/lang";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { langs, currentLang } = useSelector((state) => state.lang);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langKey) => {
    dispatch(setCurrentLang(langKey));
    handleClose();
    location.reload();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="secondary"
        sx={{ width: 60, height: 40 }}
      >
        <Typography variant="body1" color="initial">
          {currentLang}
        </Typography>
        <ArrowDropDownIcon />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ mt: 1 }}
      >
        {langs.map((lang) => (
          <MenuItem
            key={lang.key}
            onClick={() => handleLanguageChange(lang.key)}
            selected={currentLang === lang.key}
          >
            {lang.key}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
