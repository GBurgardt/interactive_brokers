import { useState, useCallback, useRef } from 'react';

export function useTrade(getClient, isConnected) {
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nextOrderIdRef = useRef(null);

  const getNextOrderId = useCallback(() => {
    return new Promise((resolve, reject) => {
      const client = getClient();
      if (!client || !isConnected) {
        reject(new Error('No conectado'));
        return;
      }

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout obteniendo order ID'));
      }, 5000);

      const onNextValidId = (orderId) => {
        cleanup();
        nextOrderIdRef.current = orderId;
        resolve(orderId);
      };

      const cleanup = () => {
        clearTimeout(timeout);
        client.removeListener('nextValidId', onNextValidId);
      };

      client.once('nextValidId', onNextValidId);
      client.reqIds(1);
    });
  }, [getClient, isConnected]);

  const submitOrder = useCallback(async ({
    symbol,
    action, // 'BUY' or 'SELL'
    quantity,
    orderType = 'MKT',
    exchange = 'SMART',
    currency = 'USD',
  }) => {
    const client = getClient();
    if (!client || !isConnected) {
      throw new Error('No conectado');
    }

    setLoading(true);
    setError(null);
    setOrderStatus(null);

    try {
      const orderId = await getNextOrderId();
      const contract = client.contract.stock(symbol, exchange, currency);
      const order = client.order.market(action, quantity);

      return new Promise((resolve, reject) => {
        let lastStatus = 'Enviando';
        let resolved = false;
        const terminalStatuses = new Set(['Filled', 'Cancelled', 'Inactive']);

        const timeout = setTimeout(() => {
          if (!resolved) {
            cleanup();
            setLoading(false);
            resolve({
              orderId,
              status: lastStatus,
              filled: null,
              avgFillPrice: null,
            });
          }
        }, 30000);

        const onOrderStatus = (id, status, filled, remaining, avgFillPrice) => {
          if (id !== orderId) return;
          lastStatus = status;

          setOrderStatus({
            orderId: id,
            status,
            filled,
            remaining,
            avgFillPrice,
          });

          if (!resolved && terminalStatuses.has(status)) {
            resolved = true;
            cleanup();
            setLoading(false);
            resolve({
              orderId: id,
              status,
              filled,
              avgFillPrice,
            });
          }
        };

        const onError = (err) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          setLoading(false);
          setError(err?.message || 'Error al enviar orden');
          reject(new Error(err?.message || 'Error al enviar orden'));
        };

        const cleanup = () => {
          clearTimeout(timeout);
          client.removeListener('orderStatus', onOrderStatus);
          client.removeListener('error', onError);
        };

        client.on('orderStatus', onOrderStatus);
        client.on('error', onError);
        client.placeOrder(orderId, contract, order);
      });
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }, [getClient, isConnected, getNextOrderId]);

  const buy = useCallback((symbol, quantity) => {
    return submitOrder({ symbol, action: 'BUY', quantity });
  }, [submitOrder]);

  const sell = useCallback((symbol, quantity) => {
    return submitOrder({ symbol, action: 'SELL', quantity });
  }, [submitOrder]);

  return {
    buy,
    sell,
    submitOrder,
    orderStatus,
    loading,
    error,
  };
}

export default useTrade;
