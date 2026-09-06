"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type CardCoordinate = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string; // Optional context for the AI
};

type TourGuideContextType = {
  activeTarget: CardCoordinate | null;
  setActiveTarget: (target: CardCoordinate | null) => void;
  registerCard: (card: CardCoordinate) => void;
  removeCard: (id: string) => void;
  cards: Record<string, CardCoordinate>;
};

const TourGuideContext = createContext<TourGuideContextType | undefined>(undefined);

export const TourGuideProvider = ({ children }: { children: ReactNode }) => {
  const [activeTarget, setActiveTarget] = useState<CardCoordinate | null>(null);
  const [cards, setCards] = useState<Record<string, CardCoordinate>>({});

  const registerCard = (card: CardCoordinate) => {
    setCards((prev) => ({ ...prev, [card.id]: card }));
  };

  const removeCard = (id: string) => {
    setCards((prev) => {
      const newCards = { ...prev };
      delete newCards[id];
      return newCards;
    });
  };

  return (
    <TourGuideContext.Provider
      value={{ activeTarget, setActiveTarget, registerCard, removeCard, cards }}
    >
      {children}
    </TourGuideContext.Provider>
  );
};

export const useTourGuide = () => {
  const context = useContext(TourGuideContext);
  if (!context) {
    throw new Error("useTourGuide must be used within a TourGuideProvider");
  }
  return context;
};
