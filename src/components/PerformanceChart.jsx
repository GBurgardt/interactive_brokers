import React, { useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
import { formatMoney, formatPercent } from '../utils/format.js';

const debug = (...args) => {
  if (process.argv.includes('--debug')) {
    console.error('[PERFORMANCE-CHART]', ...args);
  }
};

/**
 * PerformanceChart - Gráfico de barras con CONTEXTO
 *
 * Filosofía Tufte: "Sparklines get their context from nearby words and numbers"
 *
 * El gráfico necesita ANCLAS SEMÁNTICAS:
 * - Eje X: tiempo (fecha compra → hoy)
 * - Eje Y: magnitud (máx ganancia %, mín pérdida %)
 *
 * Sin estas anclas, las barras son arte abstracto.
 * Con ellas, el usuario ENTIENDE de un vistazo.
 */

const BLOCK_FULL = '█';
const BLOCK_UPPER = '▀';
const BLOCK_LOWER = '▄';

/**
 * Parsear fecha IB "20231215" o "20231215 14:30:00" a Date
 */
function parseIBDate(dateStr) {
  if (!dateStr) return null;
  const datePart = dateStr.split(' ')[0];
  const year = parseInt(datePart.slice(0, 4));
  const month = parseInt(datePart.slice(4, 6)) - 1;
  const day = parseInt(datePart.slice(6, 8));
  return new Date(year, month, day);
}

/**
 * Formatear fecha en formato corto: "15 sep"
 */
function formatShortDate(date) {
  if (!date) return '';
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Renderiza barras ASCII para un array de valores positivos/negativos
 */
function renderBars(values, height, width) {
  if (!values || values.length === 0) return { lines: [], barWidth: 0 };

  const maxAbs = Math.max(...values.map(Math.abs), 0.01);
  const halfHeight = Math.floor(height / 2);

  let sampledValues = values;
  if (values.length > width) {
    const step = values.length / width;
    sampledValues = [];
    for (let i = 0; i < width; i++) {
      const idx = Math.min(Math.floor(i * step), values.length - 1);
      sampledValues.push(values[idx]);
    }
  }

  debug(`Rendering ${sampledValues.length} bars, maxAbs=${maxAbs.toFixed(2)}, halfHeight=${halfHeight}`);

  const lines = [];

  // Parte superior (positivos)
  for (let row = 0; row < halfHeight; row++) {
    let line = '';
    const threshold = ((halfHeight - row) / halfHeight) * maxAbs;
    const prevThreshold = ((halfHeight - row + 1) / halfHeight) * maxAbs;

    for (let col = 0; col < sampledValues.length; col++) {
      const val = sampledValues[col];
      if (val > 0) {
        if (val >= prevThreshold) {
          line += BLOCK_FULL;
        } else if (val >= threshold) {
          line += BLOCK_LOWER;
        } else {
          line += ' ';
        }
      } else {
        line += ' ';
      }
    }
    lines.push({ text: line, color: 'green', isTop: row === 0 });
  }

  // Eje
  lines.push({ text: '─'.repeat(sampledValues.length), color: 'gray', isAxis: true });

  // Parte inferior (negativos)
  for (let row = 0; row < halfHeight; row++) {
    let line = '';
    const threshold = ((row + 1) / halfHeight) * maxAbs;
    const prevThreshold = (row / halfHeight) * maxAbs;

    for (let col = 0; col < sampledValues.length; col++) {
      const val = sampledValues[col];
      if (val < 0) {
        const absVal = Math.abs(val);
        if (absVal >= threshold) {
          line += BLOCK_FULL;
        } else if (absVal > prevThreshold) {
          line += BLOCK_UPPER;
        } else {
          line += ' ';
        }
      } else {
        line += ' ';
      }
    }
    lines.push({ text: line, color: 'red', isBottom: row === halfHeight - 1 });
  }

  return { lines, barWidth: sampledValues.length };
}

export function PerformanceChart({
  symbol,
  historicalData,
  avgCost,
  quantity,
  purchaseDate,
  currentPrice,
}) {
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const chartWidth = Math.min(terminalWidth - 20, 80); // Dejamos espacio para labels
  const chartHeight = 10;

  // Calcular performance y extremos
  const performanceData = useMemo(() => {
    if (!historicalData || historicalData.length === 0 || !avgCost) {
      debug('No data for performance chart:', { hasHistorical: !!historicalData, avgCost });
      return null;
    }

    // Diferencias respecto al avgCost (en $)
    const diffs = historicalData.map(bar => bar.close - avgCost);

    // Diferencias en % respecto al avgCost
    const diffPercents = diffs.map(d => (d / avgCost) * 100);

    // Precio actual como último punto
    if (currentPrice) {
      diffs[diffs.length - 1] = currentPrice - avgCost;
      diffPercents[diffPercents.length - 1] = ((currentPrice - avgCost) / avgCost) * 100;
    }

    const currentDiff = diffs[diffs.length - 1];
    const totalGain = currentDiff * quantity;
    const totalGainPercent = (currentDiff / avgCost) * 100;

    // Extremos históricos
    const maxPercent = Math.max(...diffPercents);
    const minPercent = Math.min(...diffPercents);
    const hasLoss = minPercent < 0;
    const hasGain = maxPercent > 0;

    // Fechas del rango
    const firstDate = parseIBDate(historicalData[0]?.date);
    const lastDate = parseIBDate(historicalData[historicalData.length - 1]?.date);

    debug(`Performance: gain=${totalGain.toFixed(2)}, max=${maxPercent.toFixed(1)}%, min=${minPercent.toFixed(1)}%`);

    return {
      diffs,
      diffPercents,
      totalGain,
      totalGainPercent,
      maxPercent,
      minPercent,
      hasLoss,
      hasGain,
      firstDate,
      lastDate,
      isPositive: totalGain >= 0,
    };
  }, [historicalData, avgCost, quantity, currentPrice]);

  // Renderizar barras
  const { lines: chartLines, barWidth } = useMemo(() => {
    if (!performanceData) return { lines: [], barWidth: 0 };
    return renderBars(performanceData.diffs, chartHeight, chartWidth);
  }, [performanceData, chartHeight, chartWidth]);

  // Si no hay datos
  if (!performanceData || chartLines.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="white" bold>{symbol}</Text>
        <Text color="gray">Sin datos de performance</Text>
      </Box>
    );
  }

  const {
    totalGain,
    totalGainPercent,
    maxPercent,
    minPercent,
    hasLoss,
    hasGain,
    firstDate,
    lastDate,
    isPositive,
  } = performanceData;

  const gainColor = isPositive ? 'green' : 'red';
  const gainSign = isPositive ? '+' : '';

  // Formatear labels de escala Y
  const maxLabel = hasGain ? `+${maxPercent.toFixed(0)}%` : '';
  const minLabel = hasLoss ? `${minPercent.toFixed(0)}%` : '';

  // Formatear fechas para eje X
  const startDateLabel = firstDate ? formatShortDate(firstDate) : '';
  const endDateLabel = 'hoy';

  // Calcular padding para alinear labels a la derecha del gráfico
  const rightPadding = Math.max(0, barWidth - 6); // 6 chars aprox para "+XX%"

  return (
    <Box flexDirection="column">
      {/* Header: GOOG  +$2,733.63 +56.22% */}
      <Box marginBottom={1}>
        <Text color="white" bold>{symbol}</Text>
        <Text>  </Text>
        <Text color={gainColor} bold>
          {gainSign}{formatMoney(totalGain)} {gainSign}{formatPercent(Math.abs(totalGainPercent))}
        </Text>
      </Box>

      {/* Escala Y superior: máximo histórico */}
      {hasGain && (
        <Box>
          <Text color="gray">{' '.repeat(rightPadding)}</Text>
          <Text color="green">{maxLabel}</Text>
        </Box>
      )}

      {/* Gráfico de barras */}
      <Box flexDirection="column">
        {chartLines.map((line, idx) => (
          <Text key={idx} color={line.color}>
            {line.text}
          </Text>
        ))}
      </Box>

      {/* Escala Y inferior: mínimo histórico (solo si hubo pérdida) */}
      {hasLoss && (
        <Box>
          <Text color="gray">{' '.repeat(rightPadding)}</Text>
          <Text color="red">{minLabel}</Text>
        </Box>
      )}

      {/* Eje X: fechas + precio de compra */}
      <Box marginTop={1}>
        <Text color="gray">{startDateLabel}</Text>
        <Text color="gray">{' '.repeat(Math.max(0, barWidth - startDateLabel.length - endDateLabel.length - 12))}</Text>
        <Text color="white">{endDateLabel}</Text>
        <Text color="gray">   </Text>
        <Text color="gray">compra </Text>
        <Text color="white">{formatMoney(avgCost)}</Text>
      </Box>
    </Box>
  );
}

export default PerformanceChart;
