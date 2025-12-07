import React, { useState, useEffect, useCallback } from 'react';
import { Box, useApp, useInput } from 'ink';

function debug(...args) {
  if (global.DEBUG_MODE) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`[${timestamp}] [APP]`, ...args);
  }
}

import { useIBConnection } from '../hooks/useIBConnection.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { useMarketData } from '../hooks/useMarketData.js';
import { useTrade } from '../hooks/useTrade.js';
import { useHistoricalData, DEFAULT_PERIOD } from '../hooks/useHistoricalData.js';

import { Loading, ConnectionError, OrderResult } from './Loading.jsx';
import Portfolio from './Portfolio.jsx';
import BuyScreen from './BuyScreen.jsx';
import SellScreen from './SellScreen.jsx';
import SearchScreen from './SearchScreen.jsx';
import ChartScreen from './ChartScreen.jsx';

// Screens: connecting, error, portfolio, chart, buy, sell, search, order-result
export function App({ paperTrading = false }) {
  const { exit } = useApp();

  const port = paperTrading ? 7497 : 7496;
  debug('App initialized with paperTrading:', paperTrading, 'port:', port);
  const {
    status: connectionStatus,
    error: connectionError,
    accountId,
    connect,
    disconnect,
    getClient,
    isConnected,
  } = useIBConnection({ port });

  const {
    positions,
    accountData,
    computed,
    loading: portfolioLoading,
    refresh: refreshPortfolio,
  } = usePortfolio(getClient, isConnected);

  const {
    prices,
    fetchPrice,
    isLoading: isPriceLoading,
  } = useMarketData(getClient, isConnected);

  const {
    buy,
    sell,
    orderStatus,
    loading: orderLoading,
    error: orderError,
  } = useTrade(getClient, isConnected);

  const {
    fetchHistorical,
    getData: getHistoricalData,
    isLoading: isHistoricalLoading,
    getError: getHistoricalError,
    prefetch: prefetchHistorical,
  } = useHistoricalData(getClient, isConnected);

  const [screen, setScreen] = useState('connecting');
  const [chartPeriod, setChartPeriod] = useState(DEFAULT_PERIOD);
  const [chartSymbol, setChartSymbol] = useState(null); // Symbol being viewed in chart
  const [chartPosition, setChartPosition] = useState(null); // Position if owned
  const [buySymbol, setBuySymbol] = useState(null);
  const [sellData, setSellData] = useState(null);
  const [lastOrderResult, setLastOrderResult] = useState(null);

  // Conectar al iniciar - SOLO UNA VEZ
  const hasConnectedRef = React.useRef(false);
  useEffect(() => {
    if (hasConnectedRef.current) {
      debug('Already connected once, skipping');
      return;
    }
    hasConnectedRef.current = true;
    debug('Initial connect useEffect triggered (first time only)');
    connect();
    return () => {
      debug('Cleanup: disconnecting');
      disconnect();
    };
  }, []); // Sin dependencias para que solo corra una vez

  // Cambiar pantalla según estado de conexión
  useEffect(() => {
    debug('Connection status changed:', connectionStatus, 'Error:', connectionError);
    debug('Current screen:', screen);
    if (connectionStatus === 'connected' && screen === 'connecting') {
      debug('Transitioning to portfolio screen');
      setScreen('portfolio');
    } else if (connectionStatus === 'error') {
      debug('Transitioning to error screen');
      setScreen('error');
    }
  }, [connectionStatus, screen, connectionError]);

  // Cargar precios de posiciones al conectar
  useEffect(() => {
    if (isConnected && positions.length > 0) {
      positions.forEach(pos => {
        fetchPrice(pos.symbol).catch(() => {});
      });
    }
  }, [isConnected, positions, fetchPrice]);

  // Handlers
  const handleViewChart = useCallback((symbolOrPosition) => {
    // Can receive either a position object or a symbol string
    const isPosition = typeof symbolOrPosition === 'object';
    const symbol = isPosition ? symbolOrPosition.symbol : symbolOrPosition;
    const position = isPosition ? symbolOrPosition : null;

    debug('Navigating to chart for', symbol, isPosition ? '(owned)' : '(not owned)');

    setChartSymbol(symbol);
    setChartPosition(position);
    setScreen('chart');
    setChartPeriod(DEFAULT_PERIOD);

    // Fetch data
    fetchPrice(symbol).catch(() => {});
    fetchHistorical(symbol, DEFAULT_PERIOD).catch(() => {});
  }, [fetchPrice, fetchHistorical]);

  const handleChartPeriodChange = useCallback((period) => {
    debug('Chart period changed to', period);
    setChartPeriod(period);
    if (chartSymbol) {
      fetchHistorical(chartSymbol, period).catch(() => {});
    }
  }, [fetchHistorical, chartSymbol]);

  const handleBuy = useCallback((symbol) => {
    setBuySymbol(symbol);
    setScreen('buy');
    fetchPrice(symbol).catch(() => {});
  }, [fetchPrice]);

  const handleSell = useCallback((symbol, quantity) => {
    setSellData({ symbol, quantity });
    setScreen('sell');
    fetchPrice(symbol).catch(() => {});
  }, [fetchPrice]);

  const handleSearch = useCallback(() => {
    setScreen('search');
  }, []);

  const handleConfirmBuy = useCallback(async (symbol, quantity) => {
    try {
      const result = await buy(symbol, quantity);
      setLastOrderResult(result);
      setScreen('order-result');
    } catch (err) {
      console.error('Error buying:', err);
    }
  }, [buy]);

  const handleConfirmSell = useCallback(async (symbol, quantity) => {
    try {
      const result = await sell(symbol, quantity);
      setLastOrderResult(result);
      setScreen('order-result');
    } catch (err) {
      console.error('Error selling:', err);
    }
  }, [sell]);

  const handleBack = useCallback(() => {
    setScreen('portfolio');
    setChartSymbol(null);
    setChartPosition(null);
    setBuySymbol(null);
    setSellData(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshPortfolio();
    positions.forEach(pos => {
      fetchPrice(pos.symbol).catch(() => {});
    });
  }, [refreshPortfolio, positions, fetchPrice]);

  const handleQuit = useCallback(() => {
    disconnect();
    exit();
  }, [disconnect, exit]);

  const handleRetry = useCallback(() => {
    setScreen('connecting');
    connect();
  }, [connect]);

  const handleOrderContinue = useCallback(() => {
    setLastOrderResult(null);
    handleBack();
    refreshPortfolio();
  }, [handleBack, refreshPortfolio]);

  // Global key handlers
  useInput((input, key) => {
    if (screen === 'error') {
      if (input === 'r') handleRetry();
      if (input === 'q') handleQuit();
    }
    if (screen === 'order-result' && key.return) {
      handleOrderContinue();
    }
  });

  // Render
  return (
    <Box flexDirection="column">
      {screen === 'connecting' && (
        <Loading message="Conectando a TWS..." />
      )}

      {screen === 'error' && (
        <ConnectionError
          error={connectionError}
          onRetry={handleRetry}
        />
      )}

      {screen === 'portfolio' && (
        <Portfolio
          positions={positions}
          accountData={accountData}
          computed={computed}
          accountId={accountId}
          prices={prices}
          loading={portfolioLoading}
          onViewChart={handleViewChart}
          onBuy={handleBuy}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onQuit={handleQuit}
        />
      )}

      {screen === 'chart' && chartSymbol && (
        <ChartScreen
          symbol={chartSymbol}
          position={chartPosition}
          historicalData={getHistoricalData(chartSymbol, chartPeriod)}
          loading={isHistoricalLoading(chartSymbol, chartPeriod)}
          error={getHistoricalError(chartSymbol, chartPeriod)}
          currentPrice={prices[chartSymbol]?.price}
          onPeriodChange={handleChartPeriodChange}
          onBuy={handleBuy}
          onSell={handleSell}
          onBack={handleBack}
        />
      )}

      {screen === 'buy' && buySymbol && (
        <BuyScreen
          symbol={buySymbol}
          currentPrice={prices[buySymbol]?.price}
          priceLoading={isPriceLoading(buySymbol)}
          availableCash={computed.cash}
          onConfirm={handleConfirmBuy}
          onCancel={handleBack}
        />
      )}

      {screen === 'sell' && sellData && (
        <SellScreen
          symbol={sellData.symbol}
          currentPrice={prices[sellData.symbol]?.price}
          priceLoading={isPriceLoading(sellData.symbol)}
          ownedQuantity={sellData.quantity}
          onConfirm={handleConfirmSell}
          onCancel={handleBack}
        />
      )}

      {screen === 'search' && (
        <SearchScreen
          onViewChart={handleViewChart}
          onCancel={handleBack}
        />
      )}

      {screen === 'order-result' && lastOrderResult && (
        <OrderResult
          result={lastOrderResult}
          onContinue={handleOrderContinue}
        />
      )}

      {orderLoading && (
        <Box marginTop={1} paddingX={1}>
          <Loading message="Enviando orden..." />
        </Box>
      )}
    </Box>
  );
}

export default App;
