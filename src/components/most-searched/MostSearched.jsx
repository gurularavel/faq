import PropTypes from "prop-types";
import { Box, Typography, Paper, CircularProgress, Grid2 } from "@mui/material";
import FAQItem from "@components/faq-item/FAQItem";
import { useTranslate } from "@src/utils/translations/useTranslate";

const MostSearched = ({ faqItems, isLoading, title }) => {
  const t = useTranslate();

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 3,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        height: "fit-content",
        bgcolor: "#fff5f5",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography
          variant="h6"
          component="h2"
          className="faq-title"
          sx={{ color: "#d32f2f", fontWeight: 600 }}
        >
          {title || t("mostly_searched_faq")}
        </Typography>
       
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : faqItems.length === 0 ? (
        <Typography align="center" color="text.secondary" py={4}>
          {t("no_results_found")}
        </Typography>
      ) : (
        <Grid2 container spacing={2} rowSpacing={5}>
          {faqItems.map((item) => (
            <FAQItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              searchQuery=""
              showHighLight={false}
              tags={item.tags}
              seen_count={item.seen_count}
              categories={item.categories}
              updatedDate={item.updated_date}
              createdDate={item.created_date}
              isMostSearched={true}
              files={item.files}
            />
          ))}
        </Grid2>
      )}
    </Paper>
  );
};

MostSearched.propTypes = {
  faqItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
      tags: PropTypes.array,
      seen_count: PropTypes.number,
      categories: PropTypes.array,
      updated_date: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

export default MostSearched;

