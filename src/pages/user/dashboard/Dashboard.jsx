import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid2,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@assets/icons/search.svg";
import FAQItem from "@components/faq-item/FAQItem";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";

const DashBoard = () => {
  const t = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [faqItems, setFaqItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showHighLight, setShowHighLight] = useState(false);
  const [mostSearchedFaqs, setMostSearchedFaqs] = useState([]);

  const fetchFAQs = useCallback(async (search = "", page = 1, limit = 10) => {
    try {
      const isSearchMode = search.length >= 3;
      const endpoint = isSearchMode ? "/faqs/search" : "/faqs/most-searched";
      const params = isSearchMode ? { search, page, limit } : {};

      const { data } = await userPrivateApi.get(endpoint, { params });

      if (isSearchMode) {
        setShowHighLight(true);
        return {
          items: data.data || [],
          pagination: {
            currentPage: data.meta.current_page,
            lastPage: data.meta.last_page,
            total: data.meta.total,
          },
        };
      } else {
        setShowHighLight(false);
        setMostSearchedFaqs(data.data || []);
        return {
          items: data.data || [],
          pagination: null,
        };
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      return {
        items: [],
        pagination: null,
      };
    }
  }, []);

  const fetchInitialData = useCallback(
    async (search) => {
      setIsLoading(true);
      try {
        const response = await fetchFAQs(search, 1);
        setFaqItems(response.items);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setFaqItems([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFAQs]
  );

  const loadMore = async () => {
    if (
      !pagination ||
      isLoadingMore ||
      pagination.currentPage >= pagination.lastPage
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const response = await fetchFAQs(searchQuery.trim(), nextPage);

      setFaqItems((prevItems) => [...prevItems, ...response.items]);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading more FAQs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle search query changes
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const timeoutId = setTimeout(() => {
      if (trimmedQuery.length >= 3) {
        fetchInitialData(trimmedQuery);
      } else if (trimmedQuery.length === 0 && mostSearchedFaqs.length > 0) {
        setFaqItems(mostSearchedFaqs);
        setShowHighLight(false);
        setPagination(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchInitialData, mostSearchedFaqs]);

  // Fetch most-searched FAQs only on initial load
  useEffect(() => {
    fetchInitialData("");
  }, [fetchInitialData]);

  const showLoadMore =
    pagination && pagination.currentPage < pagination.lastPage;

  return (
    <Box className="search-container">
      <Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("search_with_text_or_tag")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={SearchIcon} alt="search" />
              </InputAdornment>
            ),
          }}
          className="search-input"
        />

        <Typography variant="h6" component="h2" className="faq-title">
          {searchQuery.length >= 3 ? t("result") : t("mostly_searched_faq")}
        </Typography>

        <Box className="faq-list">
          <Grid2 container spacing={2} rowSpacing={5}>
            {isLoading ? (
              <Grid2
                size={{ xs: 12 }}
                display={"flex"}
                justifyContent={"center"}
              >
                <CircularProgress />
              </Grid2>
            ) : faqItems.length === 0 ? (
              <Grid2 size={{ xs: 12 }}>
                <Typography align="center">{t("no_results_found")}</Typography>
              </Grid2>
            ) : (
              <>
                {faqItems.map((item) => (
                  <Grid2 key={item.id} size={{ xs: 12, md: 6 }}>
                    <FAQItem
                      id={item.id}
                      question={item.question}
                      answer={item.answer}
                      searchQuery={searchQuery}
                      showHighLight={showHighLight}
                      tags={item.tags}
                    />
                  </Grid2>
                ))}
                {showLoadMore && (
                  <Grid2 size={{ xs: 12 }}>
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Button
                        color="error"
                        variant="contained"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? t("loading") : t("load_more")}
                      </Button>
                    </Box>
                  </Grid2>
                )}
              </>
            )}
          </Grid2>
        </Box>
      </Box>
    </Box>
  );
};

export default DashBoard;
