import { useState, useCallback, useRef } from 'react';

let marketDataReqCounter = 6000;

export function useMarketData(getClient, isConnected) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState({});
  const activeRequestsRef = useRef({});

  const fetchPrice = useCallback((symbol, exchange = 'SMART', currency = 'USD') => {
    const client = getClient();
    if (!client || !isConnected) {
      return Promise.reject(new Error('No conectado'));
    }

    if (activeRequestsRef.current[symbol]) {
      return activeRequestsRef.current[symbol];
    }

    const reqId = ++marketDataReqCounter;
    setLoading(prev => ({ ...prev, [symbol]: true }));

    const promise = new Promise((resolve, reject) => {
      const contract = client.contract.stock(symbol, exchange, currency);
      let resolved = false;

      const interestingFields = new Set([
        client.TICK_TYPE.LAST,
        client.TICK_TYPE.DELAYED_LAST,
        client.TICK_TYPE.MARK_PRICE,
        client.TICK_TYPE.BID,
        client.TICK_TYPE.ASK,
        client.TICK_TYPE.CLOSE,
        client.TICK_TYPE.DELAYED_CLOSE,
      ]);

      const timeout = setTimeout(() => {
        if (!resolved) {
          cleanup();
          setLoading(prev => ({ ...prev, [symbol]: false }));
          reject(new Error(`Timeout obteniendo precio de ${symbol}`));
        }
      }, 8000);

      const onTickPrice = (tickerId, field, price) => {
        if (tickerId !== reqId || !interestingFields.has(field) || price <= 0 || resolved) {
          return;
        }

        resolved = true;
        cleanup();

        const priceData = {
          price,
          field,
          fieldLabel: client.util.tickTypeToString(field),
          timestamp: Date.now(),
        };

        setPrices(prev => ({ ...prev, [symbol]: priceData }));
        setLoading(prev => ({ ...prev, [symbol]: false }));
        resolve(priceData);
      };

      const onError = (err, data) => {
        if (resolved) return;
        const code = data?.code;
        if (code && [2104, 2106, 2158].includes(code)) return;

        cleanup();
        setLoading(prev => ({ ...prev, [symbol]: false }));
        reject(new Error(err?.message || `Error obteniendo precio de ${symbol}`));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        delete activeRequestsRef.current[symbol];
        client.removeListener('tickPrice', onTickPrice);
        client.removeListener('error', onError);
        try {
          client.cancelMktData(reqId);
        } catch (e) {
          // ignore
        }
      };

      client.on('tickPrice', onTickPrice);
      client.on('error', onError);
      client.reqMarketDataType(3); // delayed data si no hay realtime
      client.reqMktData(reqId, contract, '', true, false);
    });

    activeRequestsRef.current[symbol] = promise;
    return promise;
  }, [getClient, isConnected]);

  const getPrice = useCallback((symbol) => {
    return prices[symbol]?.price || null;
  }, [prices]);

  const isLoading = useCallback((symbol) => {
    return loading[symbol] || false;
  }, [loading]);

  return {
    prices,
    fetchPrice,
    getPrice,
    isLoading,
  };
}

export default useMarketData;
