import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import StatusBar from './StatusBar.jsx';

const POPULAR_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];

export function SearchScreen({
  onSelectSymbol,
  onCancel,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filtrar símbolos populares basado en query
  const filteredSymbols = query
    ? POPULAR_SYMBOLS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_SYMBOLS;

  useInput((input, key) => {
    if (key.escape) {
      onCancel?.();
    } else if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(filteredSymbols.length - 1, prev + 1));
    } else if (key.return) {
      // Si hay query y no hay resultados, usar query como símbolo
      if (query && filteredSymbols.length === 0) {
        onSelectSymbol?.(query.toUpperCase());
      } else if (filteredSymbols.length > 0) {
        onSelectSymbol?.(filteredSymbols[selectedIndex]);
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor="blue"
        paddingX={2}
        paddingY={1}
      >
        <Text bold>Buscar símbolo</Text>
      </Box>

      {/* Search input */}
      <Box
        borderStyle="single"
        borderColor="blue"
        marginTop={1}
        paddingX={2}
        paddingY={1}
      >
        <Text color="gray">Símbolo: </Text>
        <TextInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            setSelectedIndex(0);
          }}
          placeholder="Ej: AAPL, GOOGL, TSLA..."
        />
      </Box>

      {/* Results */}
      <Box
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        flexDirection="column"
        paddingY={1}
      >
        {filteredSymbols.length === 0 ? (
          <Box paddingX={2}>
            <Text color="gray">
              {query ? `Enter para buscar "${query.toUpperCase()}"` : 'Escribí un símbolo'}
            </Text>
          </Box>
        ) : (
          filteredSymbols.map((symbol, index) => (
            <Box key={symbol} paddingX={1}>
              <Text
                backgroundColor={selectedIndex === index ? 'blue' : undefined}
                color={selectedIndex === index ? 'white' : undefined}
              >
                {selectedIndex === index ? ' ▸ ' : '   '}
                {symbol}
              </Text>
            </Box>
          ))
        )}
      </Box>

      <StatusBar screen="search" />
    </Box>
  );
}

export default SearchScreen;
