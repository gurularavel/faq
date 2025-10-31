import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid2,
  CircularProgress,
  Avatar,
} from "@mui/material";

const SubCategoriesList = ({
  subcategories,
  isLoading,
  onSubCategoryClick,
  selectedSubCategoryId,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid2 container spacing={2}>
      {subcategories.map((subcategory) => (
        <Grid2 size={{ xs: 12, sm: 6 }} key={subcategory.id}>
          <Paper
            elevation={0}
            onClick={() => onSubCategoryClick(subcategory.id)}
            sx={{
              padding: 2,
              borderRadius: 2,
              border:
                selectedSubCategoryId === subcategory.id
                  ? "2px solid #d32f2f"
                  : "1px solid #e0e0e0",
              cursor: "pointer",
              transition: "all 0.3s ease",
              bgcolor:
                selectedSubCategoryId === subcategory.id
                  ? "#ffebee"
                  : "transparent",
              "&:hover": {
                borderColor: "#d32f2f",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              {subcategory.icon ? (
                <Avatar
                  src={subcategory.icon}
                  alt={subcategory.title}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#ffebee",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#ffebee",
                    color: "#d32f2f",
                  }}
                >
                  {subcategory.title?.[0]?.toUpperCase()}
                </Avatar>
              )}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "#333",
                  flex: 1,
                }}
              >
                {subcategory.title}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default SubCategoriesList;

