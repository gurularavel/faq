import { useState, useEffect, useCallback } from "react";
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
import ResetIcon from "@assets/icons/reset.svg";
import FAQItem from "@components/faq-item/FAQItem";
import MostSearched from "@components/most-searched/MostSearched";
import SubCategoriesList from "@components/subcategories-list/SubCategoriesList";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";

const DashBoard = () => {
  const t = useTranslate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPagination, setSearchPagination] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [mostSearchedFaqs, setMostSearchedFaqs] = useState([]);
  const [isLoadingMostSearched, setIsLoadingMostSearched] = useState(false);

  const [subcategories, setSubcategories] = useState([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [pinnedFaq, setPinnedFaq] = useState(null);
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [categoryPagination, setCategoryPagination] = useState(null);
  const [isLoadingCategoryFaqs, setIsLoadingCategoryFaqs] = useState(false);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    setIsLoadingSubcategories(true);
    try {
      const { data } = await userPrivateApi.get("/categories/list?limit=100&with_subs=yes");
      // Flatten all subcategories (children only) from all categories
      const allSubcategories = data.data.flatMap((cat) => cat.subs || []);
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setIsLoadingSubcategories(false);
    }
  }, []);

  // Fetch most searched FAQs
  const fetchMostSearched = useCallback(async () => {
    setIsLoadingMostSearched(true);
    try {
      const { data } = await userPrivateApi.get("/faqs/most-searched");
      setMostSearchedFaqs(data.data || []);
    } catch (error) {
      console.error("Error fetching most searched FAQs:", error);
    } finally {
      setIsLoadingMostSearched(false);
    }
  }, []);

  // Fetch subcategory details with pinned FAQ
  const fetchSubcategoryDetails = useCallback(async (subcategoryId) => {
    try {
      const { data } = await userPrivateApi.get(`/categories/${subcategoryId}/show`);
      setPinnedFaq(data.data.pinned_faq);
    } catch (error) {
      console.error("Error fetching subcategory details:", error);
      setPinnedFaq(null);
    }
  }, []);

  // Fetch FAQs for selected subcategory
  const fetchCategoryFaqs = useCallback(async (subcategoryId, page = 1, limit = 100) => {
    setIsLoadingCategoryFaqs(true);
    try {
      const { data } = await userPrivateApi.get(
        `/categories/${subcategoryId}/selected-faqs?limit=${limit}&page=${page}`
      );
      if (page === 1) {
        setCategoryFaqs(data.data || []);
      } else {
        setCategoryFaqs((prevItems) => [...prevItems, ...(data.data || [])]);
      }
      setCategoryPagination({
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        total: data.meta.total,
      });
    } catch (error) {
      console.error("Error fetching category FAQs:", error);
      setCategoryFaqs([]);
      setCategoryPagination(null);
    } finally {
      setIsLoadingCategoryFaqs(false);
    }
  }, []);

  // Search FAQs
  const searchFaqs = useCallback(async (query, page = 1, limit = 10, categoryId = null) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setSearchPagination(null);
      return;
    }

    setIsSearching(true);
    try {
      let data;
      
      // If a category is selected, use category-specific search
      if (categoryId) {
        const response = await userPrivateApi.get(
          `/categories/${categoryId}/selected-faqs`,
          {
            params: {
              search: query.trim(),
              page,
              limit,
            },
          }
        );
        data = response.data;
      } else {
        // Otherwise, use general search
        const response = await userPrivateApi.get("/faqs/search", {
          params: {
            search: query.trim(),
            page,
            limit,
          },
        });
        data = response.data;
      }

      if (page === 1) {
        setSearchResults(data.data || []);
      } else {
        setSearchResults((prevItems) => [...prevItems, ...(data.data || [])]);
      }
      setSearchPagination({
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        total: data.meta.total,
      });
    } catch (error) {
      console.error("Error searching FAQs:", error);
      setSearchResults([]);
      setSearchPagination(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchSubcategories();
    fetchMostSearched();
  }, [fetchSubcategories, fetchMostSearched]);

  // Handle search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        searchFaqs(searchQuery, 1, 10, selectedSubCategoryId);
      } else {
        setSearchResults([]);
        setSearchPagination(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFaqs, selectedSubCategoryId]);

  // Handle subcategory selection
  const handleSubCategoryClick = (subcategoryId) => {
    setSelectedSubCategoryId(subcategoryId);
    fetchSubcategoryDetails(subcategoryId);
    fetchCategoryFaqs(subcategoryId);
  };

  // Reset to initial state
  const handleReset = () => {
    setSearchQuery("");
    setSelectedSubCategoryId(null);
    setPinnedFaq(null);
    setCategoryFaqs([]);
    setCategoryPagination(null);
    setSearchResults([]);
    setSearchPagination(null);
  };

  // Load more for search results
  const loadMoreSearch = async () => {
    if (
      !searchPagination ||
      isLoadingMore ||
      searchPagination.currentPage >= searchPagination.lastPage
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = searchPagination.currentPage + 1;
      await searchFaqs(searchQuery, nextPage, 10, selectedSubCategoryId);
    } catch (error) {
      console.error("Error loading more search results:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load more for category FAQs
  const loadMoreCategoryFaqs = async () => {
    if (
      !categoryPagination ||
      isLoadingMore ||
      categoryPagination.currentPage >= categoryPagination.lastPage
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = categoryPagination.currentPage + 1;
      await fetchCategoryFaqs(selectedSubCategoryId, nextPage);
    } catch (error) {
      console.error("Error loading more category FAQs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const isSearchMode = searchQuery.trim().length >= 3;
  const showSearchResults = isSearchMode;
  const showCategoryView = selectedSubCategoryId && !isSearchMode;
  const isMostSearched = mostSearchedFaqs.length > 0;
  return (
    <Box className="search-container">
      {/* Search Box */}
      <Box 
        sx={{ 
          mb: 4,
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
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
        <Button
          onClick={handleReset}
          disabled={!searchQuery && !selectedSubCategoryId}
          className="filter-reset-btn dashboard-btn"
          sx={{
            minWidth: "fit-content",
            height: "60px",
          }}
        >
          <img src={ResetIcon} alt="reset" />
        </Button>
      </Box>

      {/* Main Content Area */}
      <Grid2 container spacing={3}>
        {/* Left Side - Most Searched or Search Results or Category FAQs */}
        <Grid2 size={{ xs: 12, md: showSearchResults || showCategoryView  ? 12 : isMostSearched ? 4 : 7 }}>
          {showSearchResults ? (
            // Search Results View
            <Box>
              <Typography
                variant="h6"
                component="h2"
                className="faq-title"
                sx={{ mb: 3, color: "#d32f2f", fontWeight: 600 }}
              >
                {t("result")}
                {selectedSubCategoryId && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ ml: 1, color: "text.secondary", fontWeight: 400 }}
                  >
                    ({subcategories.find((sub) => sub.id === selectedSubCategoryId)?.title})
                  </Typography>
                )}
              </Typography>
              {isSearching && searchResults.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : searchResults.length === 0 ? (
                <Typography align="center" color="text.secondary" py={4}>
                  {t("no_results_found")}
                </Typography>
              ) : (
                <>
                  <Grid2 container spacing={2} rowSpacing={5}>
                    {searchResults.map((item) => (
                      <FAQItem
                        key={item.id}
                        id={item.id}
                        question={item.question}
                        answer={item.answer}
                        searchQuery={searchQuery}
                        showHighLight={true}
                        tags={item.tags}
                        seen_count={item.seen_count}
                        categories={item.categories}
                        updatedDate={item.updated_date}
                      />
                    ))}
                  </Grid2>
                  {searchPagination &&
                    searchPagination.currentPage < searchPagination.lastPage && (
                      <Box display="flex" justifyContent="center" mt={4}>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={loadMoreSearch}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? t("loading") : t("load_more")}
                        </Button>
                      </Box>
                    )}
                </>
              )}
            </Box>
          ) : showCategoryView ? (
            // Category FAQs View
            <Box>
              <Typography
                variant="h6"
                component="h2"
                className="faq-title"
                sx={{ mb: 3, color: "#d32f2f", fontWeight: 600 }}
              >
                {subcategories.find((sub) => sub.id === selectedSubCategoryId)
                  ?.title || t("category_faqs")}
              </Typography>
              {pinnedFaq && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "#d32f2f", fontWeight: 600 }}
                  >
                    {t("pinned_faq") || "Pinned FAQ"}
                  </Typography>
                  <Grid2 container spacing={2} rowSpacing={5}>
                    <FAQItem
                      id={pinnedFaq.id}
                      question={pinnedFaq.question}
                      answer={pinnedFaq.answer}
                      searchQuery=""
                      showHighLight={false}
                      tags={pinnedFaq.tags}
                      seen_count={pinnedFaq.seen_count}
                      categories={pinnedFaq.categories}
                      updatedDate={pinnedFaq.updated_date}
                    />
                  </Grid2>
                </Box>
              )}
              
              {/* Selected FAQs Title */}
              {!isLoadingCategoryFaqs && categoryFaqs.length > 0 && (
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 4, color: "#d32f2f", fontWeight: 600 }}
                >
                  {t("selected_faqs") || "Seçilmiş Suallar"}
                </Typography>
              )}
              
              {isLoadingCategoryFaqs && categoryFaqs.length === 0 ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : categoryFaqs.length === 0 ? (
                <Typography align="center" color="text.secondary" py={4}>
                  {t("no_results_found")}
                </Typography>
              ) : (
                <>
                  <Grid2 container spacing={2} rowSpacing={5}>
                    {categoryFaqs.map((item) => (
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
                      />
                    ))}
                  </Grid2>
                  {categoryPagination &&
                    categoryPagination.currentPage < categoryPagination.lastPage && (
                      <Box display="flex" justifyContent="center" mt={4}>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={loadMoreCategoryFaqs}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? t("loading") : t("load_more")}
                        </Button>
                      </Box>
                    )}
                </>
              )}
            </Box>
          ) : (
            // Most Searched View (Default)
            <MostSearched
              faqItems={mostSearchedFaqs}
              isLoading={isLoadingMostSearched}
              title={t("mostly_searched_faq")}
            />
          )}
        </Grid2>

        {/* Right Side - Subcategories List */}
        {!showSearchResults && !showCategoryView && (
          <Grid2 size={{ xs: 12, md: isMostSearched ? 8 : 5 }}>
            <Typography
              variant="h6"
              component="h2"
              className="faq-title"
              sx={{ mb: 3, color: "#d32f2f", fontWeight: 600 }}
            >
              {t("categories") || "Kateqoriyalar"}
            </Typography>
            <SubCategoriesList
              subcategories={subcategories}
              isLoading={isLoadingSubcategories}
              onSubCategoryClick={handleSubCategoryClick}
              selectedSubCategoryId={selectedSubCategoryId}
            />
          </Grid2>
        )}
      </Grid2>
    </Box>
  );
};

export default DashBoard;
