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

const HighlightText = ({ text, highlight }) => {
  const fuzzyHighlightHtml = useMemo(() => {
    if (!highlight?.trim()) {
      return { __html: text };
    }

    // Store all HTML tags with their positions
    const tags = [];
    let cleanText = text.replace(/<[^>]+>/g, (match, offset) => {
      tags.push({ tag: match, position: offset });
      return "§TAG§";
    });

    const searchWords = highlight.toLowerCase().split(/\s+/).filter(Boolean);
    const maxDistance = Math.min(2, Math.floor(highlight.length / 3));

    // Split only text content, preserving tag placeholders
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
        i += 4; // Skip the rest of §TAG§
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

    // Process each text part for highlighting
    const processedParts = parts.map((part) => {
      if (part.type === "tag") {
        return tags[part.index].tag;
      }

      const content = part.content;
      if (!content.trim()) return content;

      const shouldHighlight = searchWords.some((searchWord) => {
        if (content.toLowerCase().includes(searchWord)) {
          return true;
        }

        const lengthDiff = Math.abs(content.length - searchWord.length);
        if (lengthDiff <= 2) {
          const distance = levenshtein(content.toLowerCase(), searchWord);
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
                label={tag.title}
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
            <Typography variant="body1" className="faq-question">
              <HighlightText
                text={question}
                highlight={showHighLight ? searchQuery : ""}
              />
            </Typography>
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
            <Typography variant="body2" className="faq-answer">
              <HighlightText
                text={answer}
                highlight={showHighLight ? searchQuery : ""}
              />
            </Typography>
          </Collapse>
        </Paper>
      </Box>
    </Grid2>
  );
};

export default FAQItem;
