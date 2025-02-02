import { useCallback } from "react";
import { useSelector } from "react-redux";

export const useTranslate = () => {
  const { static_words } = useSelector((state) => state.lang);

  const getTranslation = useCallback(
    (key) => {
      return static_words[key] ? static_words[key] : `{${key}}`;
    },
    [static_words]
  );

  return getTranslation;
};
