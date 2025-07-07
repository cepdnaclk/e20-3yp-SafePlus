import React, { createContext, useContext, useState } from "react";

const HighlightContext = createContext();

export function HighlightProvider({ children }) {
  const [highlightedId, setHighlightedId] = useState(null);

  return (
    <HighlightContext.Provider value={{ highlightedId, setHighlightedId }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  return useContext(HighlightContext);
}
