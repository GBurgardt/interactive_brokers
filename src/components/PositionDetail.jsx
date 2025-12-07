import React from 'react';
import { Box, Text, useInput } from 'ink';
import { formatMoney, formatPercent } from '../utils/format.js';
import StatusBar from './StatusBar.jsx';

export function PositionDetail({
  position,
  currentPrice,
  priceLoading,
  onBuy,
  onSell,
  onBack,
  onChart,
}) {
  const { symbol, quantity, avgCost, marketValue } = position;

  const currentValue = currentPrice ? quantity * currentPrice : marketValue;
  const gain = currentValue - marketValue;
  const gainPercent = marketValue > 0 ? (gain / marketValue) * 100 : 0;
  const isPositive = gain >= 0;
  const gainColor = isPositive ? 'green' : 'red';

  useInput((input, key) => {
    if (key.escape || key.leftArrow) {
      onBack?.();
    } else if (key.rightArrow) {
      onChart?.(symbol);
    } else if (input === 'b') {
      onBuy?.(symbol);
    } else if (input === 's') {
      onSell?.(symbol, quantity);
    } else if (input === 'h') {
      // Alternate way to access chart
      onChart?.(symbol);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header del símbolo */}
      <Box
        borderStyle="round"
        borderColor="blue"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        <Text bold color="white">{symbol}</Text>
        <Text color="gray">{quantity} acciones</Text>
      </Box>

      {/* Detalles */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        paddingX={2}
        paddingY={1}
        gap={1}
      >
        <Box justifyContent="space-between">
          <Text color="gray">Valor actual:</Text>
          <Text color="white" bold>{formatMoney(currentValue)}</Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Precio compra:</Text>
          <Text>{formatMoney(avgCost)}</Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Precio actual:</Text>
          {priceLoading ? (
            <Text color="yellow">Cargando...</Text>
          ) : currentPrice ? (
            <Text>{formatMoney(currentPrice)}</Text>
          ) : (
            <Text color="gray">--</Text>
          )}
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Ganancia:</Text>
          <Text color={gainColor} bold>
            {formatMoney(gain, true)} ({formatPercent(gainPercent, true)})
          </Text>
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar screen="detail" />
    </Box>
  );
}

export default PositionDetail;
