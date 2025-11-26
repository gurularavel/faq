import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid2,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@assets/icons/search.svg";
import ResetIcon from "@assets/icons/reset.svg";
import ArrowLeftIcon from "@assets/icons/arrow-left.svg";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FAQItem from "@components/faq-item/FAQItem";
import MostSearched from "@components/most-searched/MostSearched";
import SubCategoriesList from "@components/subcategories-list/SubCategoriesList";
import ExportPdfModal from "@components/modal/ExportPdfModal";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@src/utils/toast/notify";
import {  PushPin } from "@mui/icons-material";

const DashBoard = () => {
  const t = useTranslate();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPagination, setSearchPagination] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [mostSearchedFaqs, setMostSearchedFaqs] = useState([]);
  const [isLoadingMostSearched, setIsLoadingMostSearched] = useState(false);

  const [subcategories, setSubcategories] = useState([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  
  // Navigation state for category hierarchy
  const [navigationStack, setNavigationStack] = useState([]);
  const [currentCategoryData, setCurrentCategoryData] = useState(null);
  const [parentCategoryData, setParentCategoryData] = useState(null);
  
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [pinnedFaq, setPinnedFaq] = useState(null);
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [categoryPagination, setCategoryPagination] = useState(null);
  const [isLoadingCategoryFaqs, setIsLoadingCategoryFaqs] = useState(false);
  
  // Export PDF state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    setIsLoadingSubcategories(true);
    try {
      const { data } = await userPrivateApi.get("/categories/list?limit=100");
      // Flatten all subcategories (children only) from all categories
      setSubcategories(data.data);
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

  // Fetch FAQs for selected subcategory
  const fetchCategoryFaqs = useCallback(async (subcategoryId, page = 1, limit = 20) => {
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

  // Fetch category details for breadcrumb navigation
  const fetchCategoryDetails = useCallback(async (categoryId) => {
    setIsLoadingSubcategories(true);
    try {
      const { data } = await userPrivateApi.get(`/categories/${categoryId}/show`);
      const categoryData = data.data || data;
      
      setCurrentCategoryData(categoryData);
      
      // Show subcategories for breadcrumb navigation
      if (categoryData.subs && categoryData.subs.length > 0) {
        setSubcategories(categoryData.subs);
      }
      
      // Clear selection and parent data
      setSelectedSubCategoryId(null);
      setPinnedFaq(null);
      setCategoryFaqs([]);
      setCategoryPagination(null);
      setParentCategoryData(null);
    } catch (error) {
      console.error("Error fetching category details:", error);
      setCurrentCategoryData(null);
      setPinnedFaq(null);
    } finally {
      setIsLoadingSubcategories(false);
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

  // Handle category/subcategory selection
  const handleSubCategoryClick = useCallback(async (categoryId) => {
    // Clear previous category data immediately to prevent showing stale data
    setCategoryFaqs([]);
    setCategoryPagination(null);
    setPinnedFaq(null);
    
    // First, fetch category details to check if it has subcategories
    setIsLoadingSubcategories(true);
    try {
      const { data } = await userPrivateApi.get(`/categories/${categoryId}/show`);
      const categoryData = data.data || data;
      
      setCurrentCategoryData(categoryData);
      
      // Check if category has subcategories
      if (categoryData.subs && categoryData.subs.length > 0) {
        // Has subcategories - this is a parent category
        const categoryItem = subcategories.find(cat => cat.id === categoryId);
        
        if (categoryItem) {
          // Add to navigation stack
          setNavigationStack(prev => [
            ...prev,
            {
              id: categoryItem.id,
              title: categoryItem.title,
              subcategories: [...subcategories],
            }
          ]);
        }
        
        // Store as parent category (but don't show back button yet)
        setParentCategoryData(categoryData);
        
        // Show subcategories as the new category list
        setSubcategories(categoryData.subs);
        
        // Set the category and fetch FAQs for the parent category
        setSelectedSubCategoryId(categoryId);
        setPinnedFaq(categoryData.pinned_faq);
        fetchCategoryFaqs(categoryId);
      } else {
        // No subcategories - this is a leaf category (subcategory)
        // Don't change parentCategoryData here, keep it if it exists
        setSelectedSubCategoryId(categoryId);
        setPinnedFaq(categoryData.pinned_faq);
        fetchCategoryFaqs(categoryId);
      }
    } catch (error) {
      console.error("Error fetching category details:", error);
      setCurrentCategoryData(null);
      setPinnedFaq(null);
      // Clear category data on error
      setSelectedSubCategoryId(null);
      setCategoryFaqs([]);
      setCategoryPagination(null);
    } finally {
      setIsLoadingSubcategories(false);
    }
  }, [subcategories, fetchCategoryFaqs]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSelectedSubCategoryId(null);
    setPinnedFaq(null);
    setCategoryFaqs([]);
    setCategoryPagination(null);
    setSearchResults([]);
    setSearchPagination(null);
    setNavigationStack([]);
    setCurrentCategoryData(null);
    setParentCategoryData(null);
    // Reload initial categories
    fetchSubcategories();
  }, [fetchSubcategories]);

  // Handle back button to return to parent category
  const handleBackToParent = useCallback(() => {
    if (parentCategoryData) {
      // Restore parent category view
      setCurrentCategoryData(parentCategoryData);
      setSelectedSubCategoryId(parentCategoryData.id);
      setPinnedFaq(parentCategoryData.pinned_faq);
      setSubcategories(parentCategoryData.subs || []);
      
      // Fetch parent category FAQs
      fetchCategoryFaqs(parentCategoryData.id);
      
      // Keep parent data so back button can show again when clicking subcategory
      // Don't clear parentCategoryData here
    }
  }, [parentCategoryData, fetchCategoryFaqs]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback(async (index) => {
    if (index === -1) {
      // Go back to root (initial categories)
      handleReset();
    } else {
      // Navigate to a specific level in the stack
      const targetLevel = navigationStack[index];
      
      // Remove all items after the selected index
      setNavigationStack(prev => prev.slice(0, index));
      
      // Fetch the category details for that level to show its subcategories
      await fetchCategoryDetails(targetLevel.id);
    }
  }, [navigationStack, fetchCategoryDetails, handleReset]);

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
      await fetchCategoryFaqs(selectedSubCategoryId, nextPage, 20);
    } catch (error) {
      console.error("Error loading more category FAQs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Export PDF handler
  const handleExportPdf = async () => {
    // Determine which category ID to use
    let categoryId = null;
    
    if (selectedSubCategoryId) {
      // If viewing a subcategory's FAQs
      categoryId = selectedSubCategoryId;
    } else if (currentCategoryData?.id) {
      // If viewing a category with subcategories
      categoryId = currentCategoryData.id;
    } else if (navigationStack.length > 0) {
      // Fallback to last item in navigation stack
      categoryId = navigationStack[navigationStack.length - 1].id;
    }
    
    if (!categoryId) {
      notify(t("no_category_selected") || "Kateqoriya seçilməyib", "error");
      return;
    }

    setIsExportingPdf(true);
    try {
      await userPrivateApi.post("/faqs/exports/generate-pdf", {
        category: categoryId,
      });
      
      // Show success modal
      setIsExportModalOpen(true);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      notify(
        error?.response?.data?.message || t("export_failed") || "Export uğursuz oldu",
        "error"
      );
    } finally {
      setIsExportingPdf(false);
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
          disabled={!searchQuery && !selectedSubCategoryId && navigationStack.length === 0}
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
        <Grid2 size={{ xs: 12, md: showSearchResults || showCategoryView ? 12 : isMostSearched ? 4 : 7 }}>
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
                        createdDate={item.created_date}
                        files={item.files}
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
              {/* Back Button - Show only when viewing a subcategory (has parent but current has no subs) */}
              {parentCategoryData && (!currentCategoryData?.subs || currentCategoryData.subs.length === 0) && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<img src={ArrowLeftIcon} alt="back" style={{ width: 20, height: 20 }} />}
                    onClick={handleBackToParent}
                    sx={{
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                      },
                    }}
                  >
                    {t("back") || "Geri"}
                  </Button>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  className="faq-title"
                  sx={{ color: "#d32f2f", fontWeight: 600 }}
                >
                  {currentCategoryData?.title || t("category_faqs")}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  sx={{ minWidth: "fit-content" }}
                >
                  {isExportingPdf ? t("exporting") || "Yüklənir..." : t("export_pdf") || "PDF Export"}
                </Button>
              </Box>
              {pinnedFaq && (
                <Box 
                  sx={{ 
                    mb: 6,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: '900px',
                      border: '3px solid #d32f2f',
                      borderRadius: '16px',
                      padding: 4,
                      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
                      boxShadow: '0 8px 24px rgba(211, 47, 47, 0.15)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                        borderRadius: '16px',
                        zIndex: -1,
                        opacity: 0.1,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 4,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          padding: '8px 20px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px',
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                        }}
                      >
                        <PushPin /> {t("pinned_faq") || "Pinned FAQ"}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Grid2 container spacing={2} rowSpacing={5}>
                        <Grid2 size={12}>
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
                            createdDate={pinnedFaq.created_date}
                            files={pinnedFaq.files}
                            isMostSearched={true}
                          />
                        </Grid2>
                      </Grid2>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Subcategories of Main Category */}
              {currentCategoryData?.subs && currentCategoryData.subs.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "#d32f2f", fontWeight: 600 }}
                  >
                    {t("subcategories") || "Alt Kateqoriyalar"}
                  </Typography>
                  <SubCategoriesList
                    subcategories={subcategories}
                    isLoading={isLoadingSubcategories}
                    onSubCategoryClick={handleSubCategoryClick}
                    selectedSubCategoryId={null}
                  />
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
                        createdDate={item.created_date}
                        files={item.files}
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
            {/* Breadcrumb Navigation */}
            {navigationStack.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleBreadcrumbClick(-1)}
                    sx={{
                      cursor: "pointer",
                      color: "#d32f2f",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {t("categories") || "Kateqoriyalar"}
                  </Link>
                  {navigationStack.map((item, index) => (
                    <Link
                      key={item.id}
                      component="button"
                      variant="body2"
                      onClick={() => handleBreadcrumbClick(index)}
                      sx={{
                        cursor: "pointer",
                        color: index === navigationStack.length - 1 ? "text.primary" : "#d32f2f",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: index === navigationStack.length - 1 ? "none" : "underline",
                        },
                      }}
                    >
                      {item.title}
                    </Link>
                  ))}
                </Breadcrumbs>
              </Box>
            )}
            
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                className="faq-title"
                sx={{ color: "#d32f2f", fontWeight: 600 }}
              >
                {navigationStack.length > 0 
                  ? (currentCategoryData?.title || t("subcategories"))
                  : (t("categories") || "Kateqoriyalar")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {(navigationStack.length > 0 || currentCategoryData?.id) && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    sx={{ minWidth: "fit-content" }}
                  >
                    {isExportingPdf ? t("exporting") || "Yüklənir..." : t("export_pdf") || "PDF Export"}
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/user/exports")}
                  variant="outlined"
                  color="error"
                  startIcon={<ListAltIcon />}
                  sx={{
                    minWidth: "fit-content",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("exports") || "Eksportlar"}
                </Button>
              </Box>
            </Box>
            <SubCategoriesList
              subcategories={subcategories}
              isLoading={isLoadingSubcategories}
              onSubCategoryClick={handleSubCategoryClick}
              selectedSubCategoryId={selectedSubCategoryId}
            />
          </Grid2>
        )}
      </Grid2>
      
      {/* Export PDF Success Modal */}
      <ExportPdfModal open={isExportModalOpen} setOpen={setIsExportModalOpen} />
    </Box>
  );
};

export default DashBoard;
