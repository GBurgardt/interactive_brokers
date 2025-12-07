import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import asciichart from 'asciichart';
import { formatMoney, formatPercent } from '../utils/format.js';
import { PERIODS, PERIOD_KEYS, DEFAULT_PERIOD } from '../hooks/useHistoricalData.js';

const debug = (...args) => {
  if (process.argv.includes('--debug')) {
    console.error('[CHART-SCREEN]', ...args);
  }
};

export function ChartScreen({
  symbol,
  position, // Optional - only if user owns the stock
  historicalData,
  loading,
  error,
  currentPrice,
  onPeriodChange,
  onBuy,
  onSell,
  onBack,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const { stdout } = useStdout();

  // Extract data from position if available
  const avgCost = position?.avgCost;
  const quantity = position?.quantity;
  const owned = !!position;

  // Get terminal width for chart sizing
  const terminalWidth = stdout?.columns || 80;
  const chartWidth = Math.min(terminalWidth - 10, 120); // Max 120, with padding

  debug(`ChartScreen render: symbol=${symbol} period=${selectedPeriod} hasData=${!!historicalData} loading=${loading}`);

  // Handle period change
  useEffect(() => {
    debug(`Period changed to ${selectedPeriod}, calling onPeriodChange`);
    onPeriodChange?.(selectedPeriod);
  }, [selectedPeriod, onPeriodChange]);

  // Input handling
  useInput((input, key) => {
    if (key.escape || key.leftArrow) {
      debug('Back navigation triggered');
      onBack?.();
    } else if (key.upArrow) {
      // Previous period (zoom out)
      const currentIndex = PERIOD_KEYS.indexOf(selectedPeriod);
      if (currentIndex < PERIOD_KEYS.length - 1) {
        setSelectedPeriod(PERIOD_KEYS[currentIndex + 1]);
      }
    } else if (key.downArrow) {
      // Next period (zoom in)
      const currentIndex = PERIOD_KEYS.indexOf(selectedPeriod);
      if (currentIndex > 0) {
        setSelectedPeriod(PERIOD_KEYS[currentIndex - 1]);
      }
    } else if (input === 'b') {
      debug('Buy triggered for', symbol);
      onBuy?.(symbol);
    } else if (input === 's' && owned) {
      debug('Sell triggered for', symbol);
      onSell?.(symbol, quantity);
    }
  });

  // Process data for chart
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      debug('No historical data available');
      return null;
    }

    const closes = historicalData.map(bar => bar.close);

    // Resample if needed to fit terminal width
    let sampledData = closes;
    if (closes.length > chartWidth) {
      const step = closes.length / chartWidth;
      sampledData = [];
      for (let i = 0; i < chartWidth; i++) {
        const index = Math.min(Math.floor(i * step), closes.length - 1);
        sampledData.push(closes[index]);
      }
    }

    // Add current price as last point if available
    if (currentPrice && sampledData.length > 0) {
      sampledData[sampledData.length - 1] = currentPrice;
    }

    const min = Math.min(...sampledData);
    const max = Math.max(...sampledData);
    const first = sampledData[0];
    const last = sampledData[sampledData.length - 1];
    const change = last - first;
    const changePercent = first > 0 ? (change / first) * 100 : 0;

    debug(`Chart data: ${sampledData.length} points, min=${min}, max=${max}, change=${changePercent.toFixed(2)}%`);

    return {
      prices: sampledData,
      min,
      max,
      first,
      last,
      change,
      changePercent,
    };
  }, [historicalData, currentPrice, chartWidth]);

  // Render chart
  const chartRender = useMemo(() => {
    if (!chartData) return null;

    const isPositive = chartData.change >= 0;
    const color = isPositive ? asciichart.green : asciichart.red;

    try {
      const chart = asciichart.plot(chartData.prices, {
        height: 10,
        colors: [color],
        format: (x) => formatMoney(x).padStart(10),
      });

      debug('Chart rendered successfully');
      return chart;
    } catch (err) {
      debug('Chart render error:', err.message);
      return null;
    }
  }, [chartData]);

  // Calculate if current price is above or below purchase price
  const priceVsAvgCost = useMemo(() => {
    if (!chartData || !avgCost) return null;
    const diff = chartData.last - avgCost;
    const diffPercent = avgCost > 0 ? (diff / avgCost) * 100 : 0;
    return { diff, diffPercent, isAbove: diff >= 0 };
  }, [chartData, avgCost]);

  // Period selector
  const periodSelector = PERIOD_KEYS.map(p => {
    const isSelected = p === selectedPeriod;
    return isSelected ? `[${p}]` : ` ${p} `;
  }).join('  ');

  // Loading state
  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" borderColor="blue" paddingX={2} paddingY={1}>
          <Text bold color="white">{symbol}</Text>
          <Text color="gray">  Histórico</Text>
        </Box>
        <Box marginTop={2} justifyContent="center">
          <Text color="yellow">Cargando histórico de {PERIODS[selectedPeriod].label}...</Text>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" borderColor="red" paddingX={2} paddingY={1}>
          <Text bold color="white">{symbol}</Text>
          <Text color="gray">  Histórico</Text>
        </Box>
        <Box marginTop={2} flexDirection="column" alignItems="center">
          <Text color="red">Error: {error}</Text>
          <Text color="gray" marginTop={1}>[←] Volver</Text>
        </Box>
      </Box>
    );
  }

  // No data state
  if (!chartData || !chartRender) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" borderColor="blue" paddingX={2} paddingY={1}>
          <Text bold color="white">{symbol}</Text>
          <Text color="gray">  Histórico</Text>
        </Box>
        <Box marginTop={2} justifyContent="center">
          <Text color="gray">No hay datos históricos disponibles</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">[←] Volver</Text>
        </Box>
      </Box>
    );
  }

  const isPositive = chartData.change >= 0;
  const changeColor = isPositive ? 'green' : 'red';
  const changeSign = isPositive ? '+' : '';

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor="blue"
        paddingX={2}
        paddingY={1}
        justifyContent="space-between"
      >
        <Box>
          <Text bold color="white">{symbol}</Text>
          {owned && (
            <Text color="gray">   {quantity} acc @ {formatMoney(avgCost)}</Text>
          )}
        </Box>
        <Text color={changeColor} bold>
          {changeSign}{formatPercent(chartData.changePercent)} en {PERIODS[selectedPeriod].label}
        </Text>
      </Box>

      {/* Chart */}
      <Box
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        paddingY={1}
      >
        <Text>{chartRender}</Text>

        {/* Purchase price indicator */}
        {avgCost && priceVsAvgCost && (
          <Box marginTop={1}>
            <Text color="yellow">
              ─ Tu compra: {formatMoney(avgCost)}
              {priceVsAvgCost.isAbove ? (
                <Text color="green"> (arriba {formatPercent(priceVsAvgCost.diffPercent)})</Text>
              ) : (
                <Text color="red"> (abajo {formatPercent(Math.abs(priceVsAvgCost.diffPercent))})</Text>
              )}
            </Text>
          </Box>
        )}

        {/* Min/Max */}
        <Box marginTop={1} justifyContent="space-between">
          <Text color="gray">Min: {formatMoney(chartData.min)}</Text>
          <Text color="gray">Max: {formatMoney(chartData.max)}</Text>
        </Box>
      </Box>

      {/* Period selector & controls */}
      <Box
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        paddingX={2}
        paddingY={1}
        justifyContent="space-between"
      >
        <Text>{periodSelector}</Text>
        <Text color="gray">
          [↑↓] Período  [b] Comprar{owned ? '  [s] Vender' : ''}  [←] Volver
        </Text>
      </Box>
    </Box>
  );
}

export default ChartScreen;
