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
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return text;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} style={{ backgroundColor: "#ffeb3b" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

const FAQItem = ({ question, answer, searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <HighlightText text={question} highlight={searchQuery} />
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
          <HighlightText text={answer} highlight={searchQuery} />
        </Typography>
      </Collapse>
    </Paper>
  );
};

export default FAQItem;
