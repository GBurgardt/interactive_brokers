import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useSymbolSearch } from '../hooks/useSymbolSearch.js';

/**
 * SearchScreen - Find any stock symbol
 *
 * Design: Search-first experience
 * - Input field with autofocus
 * - Smart suggestions when empty (portfolio + recent + popular)
 * - Live search results from TickerSymbol API
 * - Navigate with arrows, Enter to select
 */
export function SearchScreen({
  positions = [],
  executions = [],
  onViewChart,
  onBuy,
  onCancel,
}) {
  const {
    query,
    setQuery,
    results,
    loading,
    isSearching,
  } = useSymbolSearch(positions, executions);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel?.();
    } else if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(Math.max(0, results.length - 1), prev + 1));
    } else if (key.return) {
      // Enter -> select symbol
      if (results.length > 0 && selectedIndex < results.length) {
        const selected = results[selectedIndex];
        onViewChart?.(selected.symbol);
      } else if (query.length > 0) {
        // If no results but has query, try the query as symbol
        onViewChart?.(query.toUpperCase());
      }
    } else if (input === 'b' && key.ctrl) {
      // Ctrl+B -> buy selected symbol directly
      if (results.length > 0 && selectedIndex < results.length) {
        onBuy?.(results[selectedIndex].symbol);
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header with search input */}
      <Box
        borderStyle="round"
        borderColor="blue"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Box>
          <Text color="cyan">Símbolo: </Text>
          <TextInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar..."
          />
        </Box>
      </Box>

      {/* Results or suggestions */}
      <Box
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        flexDirection="column"
        paddingY={1}
      >
        {loading && (
          <Box paddingX={2}>
            <Text color="gray">buscando...</Text>
          </Box>
        )}

        {!loading && results.length === 0 && isSearching && (
          <Box paddingX={2}>
            <Text color="gray">
              Sin resultados. Enter para buscar "{query.toUpperCase()}"
            </Text>
          </Box>
        )}

        {!loading && results.length === 0 && !isSearching && (
          <Box paddingX={2}>
            <Text color="gray">Escribí para buscar (mínimo 2 letras)</Text>
          </Box>
        )}

        {!loading && results.length > 0 && (
          <>
            {!isSearching && (
              <Box paddingX={2} marginBottom={1}>
                <Text color="gray" dimColor>Sugerencias:</Text>
              </Box>
            )}
            {results.map((item, index) => (
              <Box key={item.symbol} paddingX={1}>
                <Text
                  color={selectedIndex === index ? 'cyan' : 'white'}
                  bold={selectedIndex === index}
                >
                  {selectedIndex === index ? '▸ ' : '  '}
                  <Text color={selectedIndex === index ? 'cyan' : 'white'} bold>
                    {item.symbol.padEnd(6)}
                  </Text>
                  {item.name && (
                    <Text color="gray"> {item.name.slice(0, 35)}</Text>
                  )}
                  {item.source === 'portfolio' && (
                    <Text color="green" dimColor> (tuyo)</Text>
                  )}
                  {item.source === 'recent' && (
                    <Text color="yellow" dimColor> (reciente)</Text>
                  )}
                </Text>
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box marginTop={1} gap={2}>
        <Box>
          <Text color="gray">↑↓ </Text>
          <Text>navegar</Text>
        </Box>
        <Box>
          <Text color="gray">Enter </Text>
          <Text>ver gráfico</Text>
        </Box>
      </Box>
    </Box>
  );
}

export default SearchScreen;
