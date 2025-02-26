import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Collapse,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { stripHtmlTags } from "@src/utils/helpers/stripHtmlTags";
import { levenshtein } from "@src/utils/helpers/levenshtein";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";

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

    const wordBoundary = /([^\w]|$)/;

    const parts = cleanText.split(/(\s+|[.,!?;])/);
    const maxDistance = Math.min(2, Math.floor(highlight.length / 3));

    const processedParts = parts.map((part) => {
      const trimmedPart = part.trim();
      if (!trimmedPart) return part;

      const shouldHighlight = searchWords.some((searchWord) => {
        if (trimmedPart.toLowerCase().includes(searchWord)) {
          return true;
        }

        const lengthDiff = Math.abs(trimmedPart.length - searchWord.length);
        if (lengthDiff <= 2) {
          const distance = levenshtein(trimmedPart.toLowerCase(), searchWord);
          return distance <= maxDistance;
        }
        return false;
      });

      return shouldHighlight
        ? `<span style="background-color: #ffeb3b">${part}</span>`
        : part;
    });

    let finalHtml = processedParts.join("");

    tags.reverse().forEach(({ tag, position }) => {
      const parts = finalHtml.split("§TAG§");
      finalHtml = parts[0] + tag + parts.slice(1).join("§TAG§");
    });

    return { __html: finalHtml };
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
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!searchQuery) return false;
    const normalizedQuery = searchQuery.toLowerCase();
    const normalizedAnswer = stripHtmlTags(answer).toLowerCase();
    return normalizedAnswer.includes(normalizedQuery);
  });

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
  );
};

export default FAQItem;
