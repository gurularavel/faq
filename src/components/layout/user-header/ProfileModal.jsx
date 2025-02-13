import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@utils/toast/notify";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import UserImage from "@assets/icons/user.svg";
import ImgImage from "@assets/icons/image.svg";
import { updateUserInfo } from "../../../store/auth";

const ProfileModal = ({ open, onClose }) => {
  const t = useTranslate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.auth.user);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    aspect: 1,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (event) => {
    if (event.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = "cropped.jpeg";
          resolve(blob);
        },
        "image/jpeg",
        1
      );
    });
  };

  const handleCropComplete = async (cropArea) => {
    if (imageRef.current && cropArea.width && cropArea.height) {
      const croppedImage = await getCroppedImg(imageRef.current, cropArea);
      setCroppedImageUrl(URL.createObjectURL(croppedImage));
    }
  };

  const handleUploadImage = async () => {
    if (!croppedImageUrl) return;

    setLoading(true);
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "profile.jpg");

      const res = await userPrivateApi.post("/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(updateUserInfo(res.data.data));
      notify(
        res.data.message || "Profile image updated successfully",
        "success"
      );
      setCropModalOpen(false);
      setSelectedImage(null);
      setCroppedImageUrl(null);
    } catch (error) {
      notify(
        error.response?.data?.message || "Failed to update profile image",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby="profile-modal">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("profile")}</Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: "grey.500" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "#F4F7FD",
                  border: "1px solid #e9e9e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  overflow: "hidden",
                }}
              >
                {userDetails.image ? (
                  <img
                    src={userDetails.image}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={UserImage}
                    alt="Profile"
                    style={{
                      width: "50%",
                      height: "50%",
                    }}
                  />
                )}
              </Box>
              <Button
                component="label"
                variant="text"
                size="small"
                color="text"
                sx={{ py: 1 }}
              >
                <img src={ImgImage} />
                {t("upload_image")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Box>

            <TextField
              fullWidth
              value={`${userDetails.name} ${userDetails.surname}` || ""}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              value={userDetails.email || ""}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              value={`${t("score")}:` + userDetails?.score?.toString() || ""}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              value={userDetails?.department?.parent?.title || ""}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              value={userDetails?.department?.title || ""}
              disabled
              sx={{ mb: 2 }}
            />
          </Box>
        </Box>
      </Modal>

      <Modal
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        aria-labelledby="crop-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("crop_image")}</Typography>
            <IconButton
              onClick={() => setCropModalOpen(false)}
              size="small"
              sx={{ color: "grey.500" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{ p: 3 }}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            {selectedImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imageRef}
                  src={selectedImage}
                  style={{ maxWidth: "100%", minWidth: "300px" }}
                  alt="Crop"
                />
              </ReactCrop>
            )}

            <Box
              sx={{
                width: "100%",
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                onClick={() => setCropModalOpen(false)}
                variant="outlined"
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleUploadImage}
                variant="contained"
                color="error"
                disabled={!croppedImageUrl || loading}
              >
                {t("save")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileModal;
