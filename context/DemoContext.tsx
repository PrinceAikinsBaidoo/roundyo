"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoContextValue {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(localStorage.getItem("roundyo_demo") === "1");
  }, []);

  function enterDemo() {
    localStorage.setItem("roundyo_demo", "1");
    setIsDemo(true);
  }

  function exitDemo() {
    localStorage.removeItem("roundyo_demo");
    setIsDemo(false);
  }

  return (
    <DemoContext.Provider value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
