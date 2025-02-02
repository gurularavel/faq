import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery, IconButton, Box } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Modal({
  open,
  setOpen,
  title,
  children,
  maxWidth = "md",
  fullScreenOnMobile = false,
  onClickTitle,
}) {
  const isXs = useMediaQuery("(max-width:600px)");

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      maxWidth={maxWidth}
      fullScreen={isXs && fullScreenOnMobile}
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      {/* Title and Close Icon in one row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px 0",
        }}
      >
        <DialogTitle
          style={{ cursor: onClickTitle ? "pointer" : "default" }}
          onClick={onClickTitle}
        >
          {title}
        </DialogTitle>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Box width={"100%"} paddingBottom={"16px"}>
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
