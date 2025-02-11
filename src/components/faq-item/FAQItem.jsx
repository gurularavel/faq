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
import { stripHtmlTags } from "../../utils/helpers/stripHtmlTags";

const HighlightText = ({ text, highlight }) => {
  const highlightHtml = (htmlContent, searchText) => {
    if (!searchText?.trim()) {
      return { __html: htmlContent };
    }

    const tags = [];
    let cleanText = htmlContent.replace(/<[^>]+>/g, (match, offset) => {
      tags.push({ tag: match, position: offset });
      return "§TAG§";
    });

    const regex = new RegExp(`(${searchText})`, "gi");
    cleanText = cleanText.replace(
      regex,
      '<span style="background-color: #ffeb3b">$1</span>'
    );

    let finalHtml = cleanText;
    tags.reverse().forEach(({ tag, position }) => {
      const parts = finalHtml.split("§TAG§");
      finalHtml = parts[0] + tag + parts.slice(1).join("§TAG§");
    });

    return { __html: finalHtml };
  };

  return <span dangerouslySetInnerHTML={highlightHtml(text, highlight)} />;
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
