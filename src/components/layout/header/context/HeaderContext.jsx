import { createContext, useState } from "react";

export const HeaderContext = createContext();

export function HeaderProvider({ children }) {
  const [content, setContent] = useState(null);

  const value = {
    content,
    setContent,
  };

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
}
