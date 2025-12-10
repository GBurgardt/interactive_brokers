import React, { useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
import asciichart from 'asciichart';
import { formatMoney, formatPercent } from '../utils/format.js';

const debug = (...args) => {
  if (process.argv.includes('--debug')) {
    console.error('[PERFORMANCE-CHART]', ...args);
  }
};

/**
 * PerformanceChart - Gráfico con EJES REALES
 *
 * El usuario necesita:
 * - Eje Y (izquierda): precios en $ para saber la escala
 * - Eje X (abajo): fechas distribuidas para saber cuándo pasó cada cosa
 * - Línea de compra: referencia visual de su precio de entrada
 *
 * Usamos asciichart porque ya maneja el eje Y automáticamente.
 * Agregamos el eje X manualmente con fechas.
 */

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
 * Formatear fecha corta: "15 sep" o "Sep" según el rango
 */
function formatAxisDate(date, showDay = true) {
  if (!date) return '';
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  if (showDay) {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
  return months[date.getMonth()];
}

/**
 * Generar el eje X con fechas distribuidas
 */
function generateXAxis(dates, chartWidth, yAxisWidth) {
  if (!dates || dates.length === 0) return '';

  // Determinar cuántas etiquetas caben (cada etiqueta ~6-8 chars)
  const labelWidth = 8;
  const availableWidth = chartWidth;
  const numLabels = Math.min(5, Math.max(2, Math.floor(availableWidth / (labelWidth + 4))));

  // Determinar si mostrar día o solo mes según el rango de tiempo
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const daysDiff = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  const showDay = daysDiff < 60; // Si es menos de 2 meses, mostrar día

  // Seleccionar fechas equidistantes
  const labels = [];
  for (let i = 0; i < numLabels; i++) {
    const idx = Math.floor((i / (numLabels - 1)) * (dates.length - 1));
    const date = dates[idx];
    const label = formatAxisDate(date, showDay);
    const position = Math.floor((i / (numLabels - 1)) * (chartWidth - label.length));
    labels.push({ label, position });
  }

  // Construir la línea del eje X
  const padding = ' '.repeat(yAxisWidth);
  let axisLine = '';

  for (let i = 0; i < chartWidth; i++) {
    let char = ' ';
    for (const l of labels) {
      const labelEnd = l.position + l.label.length;
      if (i >= l.position && i < labelEnd) {
        char = l.label[i - l.position];
        break;
      }
    }
    axisLine += char;
  }

  return padding + axisLine;
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
  const chartWidth = Math.min(terminalWidth - 15, 80);
  const chartHeight = 10;

  // Procesar datos
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0 || !avgCost) {
      debug('No data for chart');
      return null;
    }

    // Extraer precios y fechas
    const prices = historicalData.map(bar => bar.close);
    const dates = historicalData.map(bar => parseIBDate(bar.date));

    // Actualizar último precio si hay currentPrice
    if (currentPrice) {
      prices[prices.length - 1] = currentPrice;
    }

    // Samplear si hay demasiados datos
    let sampledPrices = prices;
    let sampledDates = dates;
    if (prices.length > chartWidth) {
      const step = prices.length / chartWidth;
      sampledPrices = [];
      sampledDates = [];
      for (let i = 0; i < chartWidth; i++) {
        const idx = Math.min(Math.floor(i * step), prices.length - 1);
        sampledPrices.push(prices[idx]);
        sampledDates.push(dates[idx]);
      }
    }

    // Calcular ganancia actual
    const currentPriceVal = sampledPrices[sampledPrices.length - 1];
    const totalGain = (currentPriceVal - avgCost) * quantity;
    const totalGainPercent = ((currentPriceVal - avgCost) / avgCost) * 100;

    // Calcular rango de precios incluyendo avgCost para que la línea de compra sea visible
    const minPrice = Math.min(...sampledPrices, avgCost);
    const maxPrice = Math.max(...sampledPrices, avgCost);

    debug(`Chart: ${sampledPrices.length} points, min=$${minPrice.toFixed(2)}, max=$${maxPrice.toFixed(2)}, avgCost=$${avgCost.toFixed(2)}`);

    return {
      prices: sampledPrices,
      dates: sampledDates,
      totalGain,
      totalGainPercent,
      isPositive: totalGain >= 0,
      minPrice,
      maxPrice,
    };
  }, [historicalData, avgCost, quantity, currentPrice, chartWidth]);

  // Renderizar gráfico con asciichart
  const { chartRender, yAxisWidth } = useMemo(() => {
    if (!chartData) return { chartRender: null, yAxisWidth: 0 };

    const isPositive = chartData.isPositive;
    const color = isPositive ? asciichart.green : asciichart.red;

    try {
      // Crear el gráfico principal (precio)
      const chart = asciichart.plot(chartData.prices, {
        height: chartHeight,
        colors: [color],
        format: (x) => {
          // Formato del eje Y: $XXX
          return ('$' + x.toFixed(0)).padStart(6);
        },
      });

      // Calcular el ancho del eje Y (los primeros caracteres antes del gráfico)
      // asciichart usa formato: "  $XXX ┤" que son ~8 caracteres
      const yAxisWidth = 8;

      debug('Chart rendered successfully');
      return { chartRender: chart, yAxisWidth };
    } catch (err) {
      debug('Chart render error:', err.message);
      return { chartRender: null, yAxisWidth: 0 };
    }
  }, [chartData, chartHeight]);

  // Generar eje X con fechas
  const xAxisLine = useMemo(() => {
    if (!chartData) return '';
    return generateXAxis(chartData.dates, chartData.prices.length, 8);
  }, [chartData]);

  // Si no hay datos
  if (!chartData || !chartRender) {
    return (
      <Box flexDirection="column">
        <Text color="white" bold>{symbol}</Text>
        <Text color="gray">Sin datos de performance</Text>
      </Box>
    );
  }

  const { totalGain, totalGainPercent, isPositive } = chartData;
  const gainColor = isPositive ? 'green' : 'red';
  const gainSign = isPositive ? '+' : '';

  return (
    <Box flexDirection="column">
      {/* Header: TSLA  +$6,455.79 +31.76% */}
      <Box marginBottom={1}>
        <Text color="white" bold>{symbol}</Text>
        <Text>  </Text>
        <Text color={gainColor} bold>
          {gainSign}{formatMoney(totalGain)} {gainSign}{formatPercent(Math.abs(totalGainPercent))}
        </Text>
      </Box>

      {/* Gráfico con eje Y (asciichart lo incluye) */}
      <Box flexDirection="column">
        <Text>{chartRender}</Text>
      </Box>

      {/* Línea de referencia de compra */}
      <Box>
        <Text color="gray">{'─'.repeat(8)}</Text>
        <Text color="yellow"> compra ${avgCost.toFixed(0)} </Text>
        <Text color="gray">{'─'.repeat(Math.max(0, chartData.prices.length - 20))}</Text>
      </Box>

      {/* Eje X con fechas */}
      <Box>
        <Text color="gray">{xAxisLine}</Text>
      </Box>
    </Box>
  );
}

export default PerformanceChart;
