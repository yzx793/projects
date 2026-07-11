import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SearchRecord {
  id: number;
  subject: string;
  subjectColor: string;
  date: string;
  content: string;
  answer: string;
}

interface DailyStats {
  searchCount: number;
  favoriteCount: number;
  wrongCount: number;
  remainingSearches: number;
}

interface SearchContextType {
  dailyStats: DailyStats;
  recentSearches: SearchRecord[];
  addSearchRecord: (record: Omit<SearchRecord, 'id' | 'date'>) => void;
  addFavorite: () => void;
  addWrong: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const MAX_RECENT_SEARCHES = 20;
const MAX_DAILY_SEARCHES = 10;

let nextId = 1;

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    searchCount: 0,
    favoriteCount: 0,
    wrongCount: 0,
    remainingSearches: MAX_DAILY_SEARCHES,
  });

  const [recentSearches, setRecentSearches] = useState<SearchRecord[]>([]);

  const addSearchRecord = useCallback((record: Omit<SearchRecord, 'id' | 'date'>) => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

    const newRecord: SearchRecord = {
      ...record,
      id: nextId++,
      date: dateStr,
    };

    setRecentSearches(prev => [newRecord, ...prev].slice(0, MAX_RECENT_SEARCHES));
    setDailyStats(prev => ({
      ...prev,
      searchCount: prev.searchCount + 1,
      remainingSearches: Math.max(0, prev.remainingSearches - 1),
    }));
  }, []);

  const addFavorite = useCallback(() => {
    setDailyStats(prev => ({
      ...prev,
      favoriteCount: prev.favoriteCount + 1,
    }));
  }, []);

  const addWrong = useCallback(() => {
    setDailyStats(prev => ({
      ...prev,
      wrongCount: prev.wrongCount + 1,
    }));
  }, []);

  return (
    <SearchContext.Provider value={{ dailyStats, recentSearches, addSearchRecord, addFavorite, addWrong }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};