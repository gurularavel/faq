import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid2,
  Button,
  CircularProgress,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@assets/icons/search.svg";
import FAQItem from "@components/faq-item/FAQItem";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import ResetIcon from "@assets/icons/reset.svg";

const DashBoard = () => {
  const t = useTranslate();

  const [searchQuery, setSearchQuery] = useState("");
  const [faqItems, setFaqItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showHighLight, setShowHighLight] = useState(false);
  const [mostSearchedFaqs, setMostSearchedFaqs] = useState([]);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const { data } = await userPrivateApi.get(
        "/categories/list?with_subs=yes"
      );
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const skipEffectApiCall = React.useRef(false);

  const fetchFAQs = useCallback(
    async (
      search = "",
      page = 1,
      limit = 10,
      categoryIds = [],
      subCategoryIds = []
    ) => {
      const searchText = search.length >= 3 ? search : "";
      try {
        const isSearchMode = search.length >= 3;
        const searchWithCategoryAndSubCategory =
          categoryIds.length > 0 || subCategoryIds.length > 0;
        if (isSearchMode || searchWithCategoryAndSubCategory) {
          const endpoint = "/faqs/search";
          const params = {
            search: searchText,
            page,
            limit,
            category_id: categoryIds,
            sub_category_id: subCategoryIds,
          };

          const { data } = await userPrivateApi.get(endpoint, { params });

          setShowHighLight(true);
          return {
            items: data.data || [],
            pagination: {
              currentPage: data.meta.current_page,
              lastPage: data.meta.last_page,
              total: data.meta.total,
            },
          };
        } else if (mostSearchedFaqs.length === 0) {
          const { data } = await userPrivateApi.get("/faqs/most-searched");

          setShowHighLight(false);
          const items = data.data || [];
          setMostSearchedFaqs(items);

          return {
            items,
            pagination: null,
          };
        } else {
          return {
            items: mostSearchedFaqs,
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
    },
    [mostSearchedFaqs]
  );

  const fetchInitialData = useCallback(
    async (search) => {
      setIsLoading(true);
      try {
        const response = await fetchFAQs(
          search,
          1,
          10,
          selectedCategories,
          selectedSubCategories
        );
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
    [fetchFAQs, selectedCategories, selectedSubCategories]
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
      const response = await fetchFAQs(
        searchQuery.trim(),
        nextPage,
        10,
        selectedCategories,
        selectedSubCategories
      );

      setFaqItems((prevItems) => [...prevItems, ...response.items]);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading more FAQs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (skipEffectApiCall.current) {
      skipEffectApiCall.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      if (
        trimmedQuery.length >= 3 ||
        selectedCategories.length > 0 ||
        selectedSubCategories.length > 0
      ) {
        fetchInitialData(trimmedQuery);
      } else if (
        trimmedQuery.length < 3 &&
        mostSearchedFaqs.length > 0 &&
        selectedCategories.length === 0 &&
        selectedSubCategories.length === 0
      ) {
        setFaqItems(mostSearchedFaqs);
        setShowHighLight(false);
        setPagination(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    fetchInitialData,
    mostSearchedFaqs,
    selectedCategories,
    selectedSubCategories,
  ]);

  useEffect(() => {
    fetchInitialData("");
  }, [fetchInitialData]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSearchQuery("");

    setFaqItems(mostSearchedFaqs);
    setShowHighLight(false);
    setPagination(null);
  };

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;

    const newCategories =
      typeof value === "string" ? value.split(",").map(Number) : value;

    let newSubCategories = [...selectedSubCategories];

    if (newCategories.length === 0) {
      newSubCategories = [];
    } else {
      const validSubCategories = categories
        .filter((cat) => newCategories.includes(cat.id))
        .flatMap((cat) => cat.subs || [])
        .map((sub) => sub.id);

      newSubCategories = selectedSubCategories.filter((id) =>
        validSubCategories.includes(id)
      );
    }

    setIsLoading(true);

    setSelectedCategories(newCategories);
    setSelectedSubCategories(newSubCategories);
    skipEffectApiCall.current = true;
  };

  const handleSubCategoryChange = (event) => {
    const {
      target: { value },
    } = event;

    const newSubCategories =
      typeof value === "string" ? value.split(",").map(Number) : value;

    setIsLoading(true);

    setSelectedSubCategories(newSubCategories);
  };

  const availableSubCategories = useMemo(() => {
    if (selectedCategories.length === 0) {
      return categories.flatMap((cat) => cat.subs || []);
    }

    return categories
      .filter((cat) => selectedCategories.includes(cat.id))
      .flatMap((cat) => cat.subs || []);
  }, [categories, selectedCategories]);

  const getCategoryLabel = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.title : id;
  };

  const getSubCategoryLabel = (id) => {
    for (const cat of categories) {
      if (cat.subs) {
        const subCat = cat.subs.find((sub) => sub.id === id);
        if (subCat) return subCat.title;
      }
    }
    return id;
  };

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

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 200, flex: 1 }}>
            <Select
              multiple
              displayEmpty
              className="filter-input dashboard-filter-input"
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <>{t("categories")}</>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={getCategoryLabel(value)}
                        onDelete={() => {
                          setSelectedCategories(
                            selectedCategories.filter((id) => id !== value)
                          );
                        }}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem disabled value="">
                {t("categories")}{" "}
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200, flex: 1 }}>
            <Select
              multiple
              displayEmpty
              className="filter-input dashboard-filter-input"
              value={selectedSubCategories}
              onChange={handleSubCategoryChange}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <>{t("subcategories")}</>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={getSubCategoryLabel(value)}
                        onDelete={() => {
                          setSelectedSubCategories(
                            selectedSubCategories.filter((id) => id !== value)
                          );
                        }}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem disabled value="">
                {t("subcategories")}
              </MenuItem>
              {availableSubCategories.map((subCategory) => (
                <MenuItem key={subCategory.id} value={subCategory.id}>
                  {subCategory.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={handleResetFilters}
            disabled={
              selectedCategories.length === 0 &&
              selectedSubCategories.length === 0 &&
              searchQuery.trim().length === 0
            }
            className="filter-reset-btn dashboard-btn"
          >
            <img src={ResetIcon} alt="reset" />
          </Button>
        </Box>

        <Typography
          variant="h6"
          component="h2"
          className="faq-title"
          sx={{ mt: 3 }}
        >
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
                  <FAQItem
                    key={item.id}
                    id={item.id}
                    question={item.question}
                    answer={item.answer}
                    searchQuery={searchQuery}
                    showHighLight={showHighLight}
                    tags={item.tags}
                    seen_count={item.seen_count}
                  />
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
