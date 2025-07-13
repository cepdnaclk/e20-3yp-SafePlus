// HighlightContext.js
import { createContext, useContext, useState } from "react";

const HighlightContext = createContext();

export function HighlightProvider({ children }) {
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightedGroupIds, setHighlightedGroupIds] = useState([]);

  return (
    <HighlightContext.Provider value={{
      highlightedId,
      setHighlightedId,
      highlightedGroupIds,
      setHighlightedGroupIds
    }}>
      {children}
    </HighlightContext.Provider>
  );
}

export const useHighlight = () => useContext(HighlightContext);
