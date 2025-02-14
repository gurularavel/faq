import React, { useState } from "react";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Collapse,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { stripHtmlTags } from "@src/utils/helpers/stripHtmlTags";
import { levenshtein } from "@src/utils/helpers/levenshtein";

const HighlightText = ({ text, highlight }) => {
  const fuzzyHighlightHtml = (htmlContent, searchText, maxDistance = 2) => {
    if (!searchText?.trim()) {
      return { __html: htmlContent };
    }

    const tags = [];
    let cleanText = htmlContent.replace(/<[^>]+>/g, (match, offset) => {
      tags.push({ tag: match, position: offset });
      return "§TAG§";
    });

    const parts = cleanText.split(/(\s+|[.,!?;])/);

    const processedParts = parts.map((part) => {
      const trimmedPart = part.trim();
      if (!trimmedPart) return part;

      const distance = levenshtein(
        trimmedPart.toLowerCase(),
        searchText.toLowerCase()
      );

      return distance <= maxDistance
        ? `<span style="background-color: #ffeb3b">${part}</span>`
        : part;
    });

    let finalHtml = processedParts.join("");

    tags.reverse().forEach(({ tag, position }) => {
      const parts = finalHtml.split("§TAG§");
      finalHtml = parts[0] + tag + parts.slice(1).join("§TAG§");
    });

    return { __html: finalHtml };
  };

  return <span dangerouslySetInnerHTML={fuzzyHighlightHtml(text, highlight)} />;
};

const FAQItem = ({ question, answer, searchQuery, showHighLight }) => {
  const [isExpanded, setIsExpanded] = useState(
    searchQuery && stripHtmlTags(answer).includes(searchQuery)
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
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
  );
};

export default FAQItem;
