import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Collapse,
  Divider,
  Chip,
  Grid2,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { levenshtein } from "@src/utils/helpers/levenshtein";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import dayjs from "dayjs";
const HighlightText = ({ text, highlight }) => {
  const fuzzyHighlightHtml = useMemo(() => {
    if (!highlight?.trim()) {
      return { __html: text };
    }

    const tags = [];
    let cleanText = text.replace(/<[^>]+>/g, (match, offset) => {
      tags.push({ tag: match, position: offset });
      return "§TAG§";
    });

    const searchWords = highlight.toLowerCase().split(/\s+/).filter(Boolean);

    const containsSpecialCharsOrNumbers =
      /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(highlight);

    const maxDistance = containsSpecialCharsOrNumbers
      ? Math.min(1, Math.floor(highlight.length / 4))
      : Math.min(2, Math.floor(highlight.length / 3));

    const parts = [];
    let currentPart = "";
    let currentTagIndex = 0;

    for (let i = 0; i < cleanText.length; i++) {
      if (
        i <= cleanText.length - 5 &&
        cleanText.substring(i, i + 5) === "§TAG§"
      ) {
        if (currentPart) {
          parts.push({ type: "text", content: currentPart });
          currentPart = "";
        }
        parts.push({ type: "tag", index: currentTagIndex });
        currentTagIndex++;
        i += 4;
      } else if (/\s|[.,!?;]/.test(cleanText[i])) {
        if (currentPart) {
          parts.push({ type: "text", content: currentPart });
          currentPart = "";
        }
        parts.push({ type: "text", content: cleanText[i] });
      } else {
        currentPart += cleanText[i];
      }
    }

    if (currentPart) {
      parts.push({ type: "text", content: currentPart });
    }

    const processedParts = parts.map((part) => {
      if (part.type === "tag") {
        return tags[part.index].tag;
      }

      const content = part.content;
      if (!content.trim()) return content;

      const shouldHighlight = searchWords.some((searchWord) => {
        if (content.toLowerCase() === searchWord) {
          return true;
        }

        if (content.toLowerCase().includes(searchWord)) {
          if (containsSpecialCharsOrNumbers) {
            return true;
          } else {
            return true;
          }
        }

        const contentHasSpecialChars =
          /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(content);

        const maxLengthDiff =
          contentHasSpecialChars || containsSpecialCharsOrNumbers ? 1 : 2;

        const lengthDiff = Math.abs(content.length - searchWord.length);
        if (lengthDiff <= maxLengthDiff) {
          const distance = levenshtein(content.toLowerCase(), searchWord);

          if (contentHasSpecialChars || containsSpecialCharsOrNumbers) {
            return distance <= (maxDistance === 0 ? 0 : maxDistance - 1);
          }

          return distance <= maxDistance;
        }
        return false;
      });

      return shouldHighlight
        ? `<span style="background-color: #ffeb3b">${content}</span>`
        : content;
    });

    return { __html: processedParts.join("") };
  }, [text, highlight]);

  return <span dangerouslySetInnerHTML={fuzzyHighlightHtml} />;
};

const FAQItem = ({
  id,
  question,
  answer,
  searchQuery,
  showHighLight,
  tags,
  category,
  updatedDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const postFaqId = async (id) => {
    try {
      await userPrivateApi.post(`/faqs/open/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      postFaqId(id);
    }
  };

  return (
    <Grid2 size={{ xs: 12, md: isExpanded ? 12 : 6 }} item>
      <Box position="relative">
        <Box position="absolute" top="-24px" left="20px">
          <Typography variant="caption" color="text.secondary">
            {dayjs(updatedDate).format("DD.MM.YYYY  HH:mm")}
          </Typography>
        </Box>
        {tags && tags.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "-28px",
              right: "16px",
              zIndex: 1,
              display: "flex",
              gap: "4px",
            }}
          >
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={<span dangerouslySetInnerHTML={{ __html: tag.title }} />}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        )}

        <Paper
          className={`faq-item ${isExpanded ? "expanded" : ""}`}
          elevation={0}
          onClick={!isExpanded ? toggleExpand : undefined}
        >
          <Box className="faq-header">
            <Box display="flex" flexDirection="column" gap="4px">
              <Box display="flex" gap="4px">
                {category?.parent && (
                  <Chip
                    label={category?.parent?.title}
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                    color="error"
                  />
                )}
                {category?.title && (
                  <Chip
                    label={
                      <Box alignItems="center" display="flex" gap="4px">
                        <SubdirectoryArrowRightIcon />
                        {category?.title}
                      </Box>
                    }
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                    color="secondary"
                  />
                )}
              </Box>
              <Box
                dangerouslySetInnerHTML={{
                  __html: question,
                }}
                className="faq-question"
              />
            </Box>
            {isExpanded && (
              <IconButton
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {isExpanded && <Divider className="question-divider" />}

          <Collapse in={isExpanded}>
            <Box
              className="faq-answer"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </Collapse>
        </Paper>
      </Box>
    </Grid2>
  );
};

export default FAQItem;
