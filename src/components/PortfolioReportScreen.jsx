import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import asciichart from 'asciichart';
import { formatMoney, formatPercent } from '../utils/format.js';
import { resampleLinear } from '../utils/resample.js';

const debug = (...args) => {
  if (process.argv.includes('--debug')) {
    console.error('[PORTFOLIO-REPORT]', ...args);
  }
};

// ═══════════════════════════════════════════════════════════════
// PERIODOS DISPONIBLES
// ═══════════════════════════════════════════════════════════════
const PORTFOLIO_PERIODS = {
  '1M': { kind: 'months', n: 1, label: '1m' },
  '6M': { kind: 'months', n: 6, label: '6m' },
  '1Y': { kind: 'years', n: 1, label: '1y' },
  'ALL': { kind: 'all', n: null, label: 'all' },
};
const PORTFOLIO_PERIOD_KEYS = ['1M', '6M', '1Y', 'ALL'];
const DEFAULT_PERIOD = 'ALL';

// Y-axis padding: 8 chars para el valor + 1 espacio
const Y_AXIS_PADDING = 9;

// ═══════════════════════════════════════════════════════════════
// FORMATO COMPACTO PARA EJE Y
// ═══════════════════════════════════════════════════════════════
function formatCompact(value) {
  if (value === null || value === undefined || isNaN(value)) return '$--';

  const absValue = Math.abs(value);
  let formatted;

  if (absValue >= 1_000_000) {
    formatted = `${(absValue / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    formatted = `${(absValue / 1_000).toFixed(0)}K`;
  } else {
    formatted = absValue.toFixed(0);
  }

  return value >= 0 ? `$${formatted}` : `-$${formatted}`;
}

// ═══════════════════════════════════════════════════════════════
// FORMATO DE FECHA PARA EJE X
// ═══════════════════════════════════════════════════════════════
function formatDateLabel(date, periodKey) {
  if (!date) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const y = String(date.getFullYear()).slice(-2);

  // Para periodos cortos, mostrar día + mes
  if (periodKey === '1M') {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  // Para periodos largos, mostrar mes + año
  return `${months[date.getMonth()]} '${y}`;
}

// ═══════════════════════════════════════════════════════════════
// GENERADOR DE EJE X MINIMALISTA (SOLO 2 FECHAS)
// ═══════════════════════════════════════════════════════════════
function generateSimpleXAxis(dates, chartWidth, periodKey) {
  if (!dates || dates.length === 0 || chartWidth <= 0) {
    return { line: '' };
  }

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const firstLabel = formatDateLabel(firstDate, periodKey);
  const lastLabel = formatDateLabel(lastDate, periodKey);

  // Construir línea con fechas en los extremos
  const totalWidth = chartWidth + Y_AXIS_PADDING;
  const chars = new Array(totalWidth).fill(' ');

  // Fecha inicial (después del padding del eje Y)
  for (let i = 0; i < firstLabel.length && Y_AXIS_PADDING + i < totalWidth; i++) {
    chars[Y_AXIS_PADDING + i] = firstLabel[i];
  }

  // Fecha final (alineada a la derecha)
  const lastStart = totalWidth - lastLabel.length;
  for (let i = 0; i < lastLabel.length; i++) {
    chars[lastStart + i] = lastLabel[i];
  }

  return { line: chars.join('') };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export function PortfolioReportScreen({
  history,
  onBack,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const { stdout } = useStdout();

  const terminalWidth = stdout?.columns || 80;
  const terminalHeight = stdout?.rows || 24;
  const innerWidth = Math.max(0, terminalWidth - 2);
  const chartWidth = Math.max(20, innerWidth - Y_AXIS_PADDING);

  // ALTURA DEL GRÁFICO: 45% de la terminal (más protagonismo)
  // Mínimo 8 líneas, máximo 16 líneas
  const chartHeight = Math.min(16, Math.max(8, Math.floor(terminalHeight * 0.45)));

  debug(`Terminal: ${terminalWidth}x${terminalHeight}, Chart: ${chartWidth}x${chartHeight}`);

  // ═══════════════════════════════════════════════════════════════
  // INPUT: Solo Esc para volver, ↑↓ para cambiar periodo
  // Sin instrucciones visibles - el usuario descubre
  // ═══════════════════════════════════════════════════════════════
  useInput((input, key) => {
    if (key.escape) {
      debug('Navigating back');
      onBack?.();
    } else if (key.upArrow) {
      const i = PORTFOLIO_PERIOD_KEYS.indexOf(selectedPeriod);
      if (i < PORTFOLIO_PERIOD_KEYS.length - 1) {
        debug(`Period up: ${selectedPeriod} -> ${PORTFOLIO_PERIOD_KEYS[i + 1]}`);
        setSelectedPeriod(PORTFOLIO_PERIOD_KEYS[i + 1]);
      }
    } else if (key.downArrow) {
      const i = PORTFOLIO_PERIOD_KEYS.indexOf(selectedPeriod);
      if (i > 0) {
        debug(`Period down: ${selectedPeriod} -> ${PORTFOLIO_PERIOD_KEYS[i - 1]}`);
        setSelectedPeriod(PORTFOLIO_PERIOD_KEYS[i - 1]);
      }
    }
  });

  useEffect(() => {
    if (!PORTFOLIO_PERIODS[selectedPeriod]) setSelectedPeriod(DEFAULT_PERIOD);
  }, [selectedPeriod]);

  // ═══════════════════════════════════════════════════════════════
  // FILTRAR HISTORIA POR PERIODO
  // ═══════════════════════════════════════════════════════════════
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    const period = PORTFOLIO_PERIODS[selectedPeriod];
    if (!period || period.kind === 'all') return history;

    const cutoffDate = new Date();
    if (period.kind === 'months') cutoffDate.setMonth(cutoffDate.getMonth() - period.n);
    if (period.kind === 'years') cutoffDate.setFullYear(cutoffDate.getFullYear() - period.n);
    const cutoff = cutoffDate.getTime();
    return history.filter(p => p.ts >= cutoff);
  }, [history, selectedPeriod]);

  // ═══════════════════════════════════════════════════════════════
  // RESAMPLEAR DATOS PARA EL ANCHO DEL GRÁFICO
  // ═══════════════════════════════════════════════════════════════
  const sampled = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      return { values: [], dates: [] };
    }

    const valuesRaw = filteredHistory.map(p => p.netLiquidation);
    const datesRaw = filteredHistory.map(p => new Date(p.ts));

    if (valuesRaw.length === 0) return { values: [], dates: [] };

    const values = resampleLinear(valuesRaw, chartWidth);
    if (values.length === 0) return { values: [], dates: [] };

    const ts = resampleLinear(datesRaw.map(d => d.getTime()), chartWidth);
    const dates = ts.map(t => new Date(t));
    return { values, dates };
  }, [filteredHistory, chartWidth]);

  // ═══════════════════════════════════════════════════════════════
  // CALCULAR CAMBIO
  // ═══════════════════════════════════════════════════════════════
  const chartData = useMemo(() => {
    if (!sampled.values || sampled.values.length < 2) return null;
    const first = sampled.values[0];
    const last = sampled.values[sampled.values.length - 1];
    const change = last - first;
    const changePercent = first > 0 ? (change / first) * 100 : 0;
    return { first, last, change, changePercent };
  }, [sampled.values]);

  // ═══════════════════════════════════════════════════════════════
  // RENDERIZAR GRÁFICO CON COLOR SEGÚN PERFORMANCE
  // ═══════════════════════════════════════════════════════════════
  const chartRender = useMemo(() => {
    if (!sampled.values || sampled.values.length < 2 || !chartData) return null;

    const isPositive = chartData.change >= 0;
    const chartColor = isPositive ? asciichart.green : asciichart.red;

    try {
      return asciichart.plot(sampled.values, {
        height: chartHeight,
        colors: [chartColor],
        format: (x) => formatCompact(x).padStart(8),
      });
    } catch (e) {
      debug('Chart render error:', e?.message);
      return null;
    }
  }, [sampled.values, chartHeight, chartData]);

  // ═══════════════════════════════════════════════════════════════
  // EJE X SIMPLE
  // ═══════════════════════════════════════════════════════════════
  const xAxis = useMemo(() => {
    return generateSimpleXAxis(sampled.dates, chartWidth, selectedPeriod);
  }, [sampled.dates, chartWidth, selectedPeriod]);

  // ═══════════════════════════════════════════════════════════════
  // ESTADOS ESPECIALES
  // ═══════════════════════════════════════════════════════════════

  // Loading
  if (!filteredHistory || filteredHistory.length < 2) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="gray">loading...</Text>
      </Box>
    );
  }

  // No data
  if (!chartData || !chartRender) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box>
          <Text bold color="white">{formatMoney(0)}</Text>
          <Text color="gray">   </Text>
          <Text color="gray">no data</Text>
          <Text color="gray">   </Text>
          <Text dimColor>{PORTFOLIO_PERIODS[selectedPeriod].label}</Text>
        </Box>
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL - DISEÑO APPLE-STYLE
  // ═══════════════════════════════════════════════════════════════

  const isPositive = chartData.change >= 0;
  const changeColor = isPositive ? 'green' : 'red';
  const changeSign = isPositive ? '+' : '';

  return (
    <Box flexDirection="column" padding={1}>
      {/* ═══ HEADER: Una sola línea. Valor + Cambio + Periodo ═══ */}
      <Box>
        <Text bold color="white">{formatMoney(chartData.last)}</Text>
        <Text color="gray">   </Text>
        <Text color={changeColor} bold>
          {changeSign}{formatMoney(chartData.change)} ({formatPercent(Math.abs(chartData.changePercent))})
        </Text>
        <Text color="gray">   </Text>
        <Text dimColor>{PORTFOLIO_PERIODS[selectedPeriod].label}</Text>
      </Box>

      {/* ═══ GRÁFICO: El protagonista ═══ */}
      <Box flexDirection="column" marginTop={1}>
        <Text>{chartRender}</Text>
      </Box>

      {/* ═══ EJE X: Solo fecha inicio y fin ═══ */}
      <Box>
        <Text color="gray">{xAxis.line}</Text>
      </Box>
    </Box>
  );
}

export default PortfolioReportScreen;
