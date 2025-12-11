import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce.js';

const debug = (...args) => {
  if (process.argv.includes('--debug')) {
    console.error('[SYMBOL-SEARCH]', ...args);
  }
};

// Yahoo Finance Search API - comprehensive coverage
const YAHOO_API_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

// Fallback popular symbols if API fails
const POPULAR_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];

/**
 * Hook for searching stock symbols
 *
 * Features:
 * - Debounced API calls (300ms)
 * - Smart suggestions based on portfolio + recent trades + popular
 * - Yahoo Finance API for comprehensive symbol search
 * - Fallback to local search if API fails
 *
 * @param {Array} positions - Current portfolio positions
 * @param {Array} executions - Recent trade executions
 */
export function useSymbolSearch(positions = [], executions = []) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 300);

  // Generate smart suggestions based on user's history
  const suggestions = useMemo(() => {
    debug('Generating suggestions from', positions.length, 'positions,', executions.length, 'executions');

    // Priority order: current positions, recent trades, popular
    const fromPortfolio = positions.map(p => ({
      symbol: p.symbol,
      name: '',
      source: 'portfolio'
    }));

    const fromExecutions = executions
      .map(e => ({
        symbol: e.symbol,
        name: '',
        source: 'recent'
      }))
      .filter(e => !fromPortfolio.find(p => p.symbol === e.symbol));

    const fromPopular = POPULAR_SYMBOLS
      .map(s => ({
        symbol: s,
        name: '',
        source: 'popular'
      }))
      .filter(p =>
        !fromPortfolio.find(pos => pos.symbol === p.symbol) &&
        !fromExecutions.find(ex => ex.symbol === p.symbol)
      );

    const all = [...fromPortfolio, ...fromExecutions, ...fromPopular];
    const deduped = all.slice(0, 8);

    debug('Suggestions:', deduped.map(s => s.symbol).join(', '));
    return deduped;
  }, [positions, executions]);

  // Search the API when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const searchSymbols = async () => {
      debug('Searching for:', debouncedQuery);
      setLoading(true);
      setError(null);

      try {
        const url = `${YAHOO_API_URL}?q=${encodeURIComponent(debouncedQuery)}&quotesCount=6&newsCount=0`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        debug('Yahoo API returned', data.quotes?.length || 0, 'results');

        // Filter to only EQUITY type and take top 5
        const equityResults = (data.quotes || [])
          .filter(q => q.quoteType === 'EQUITY')
          .slice(0, 5)
          .map(item => ({
            symbol: item.symbol,
            name: item.shortname || item.longname || '',
            exchange: item.exchDisp || item.exchange || '',
          }));

        setResults(equityResults);
      } catch (err) {
        debug('API error, falling back to local search:', err.message);
        setError(err.message);

        // Fallback: filter suggestions locally
        const q = debouncedQuery.toUpperCase();
        const localResults = suggestions
          .filter(s => s.symbol.includes(q))
          .slice(0, 5);

        setResults(localResults);
      } finally {
        setLoading(false);
      }
    };

    searchSymbols();
  }, [debouncedQuery, suggestions]);

  // Clear search
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  // Items to display: results if searching, suggestions if empty
  const displayItems = query.length >= 2 ? results : suggestions;

  return {
    query,
    setQuery,
    results: displayItems,
    loading,
    error,
    suggestions,
    isSearching: query.length >= 2,
    clear,
  };
}

export default useSymbolSearch;
