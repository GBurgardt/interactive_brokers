import { useState, useEffect, useCallback, useRef } from 'react';

const ACCOUNT_SUMMARY_REQ_ID = 9001;

export function usePortfolio(getClient, isConnected) {
  const [positions, setPositions] = useState([]);
  const [accountData, setAccountData] = useState({
    netLiquidation: 0,
    totalCashValue: 0,
    availableFunds: 0,
    buyingPower: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const positionsRef = useRef([]);
  const accountDataRef = useRef({});

  const fetchPortfolio = useCallback(() => {
    const client = getClient();
    if (!client || !isConnected) {
      return;
    }

    setLoading(true);
    setError(null);
    positionsRef.current = [];
    accountDataRef.current = {
      netLiquidation: 0,
      totalCashValue: 0,
      availableFunds: 0,
      buyingPower: 0,
    };

    let accountSummaryDone = false;
    let positionsDone = false;

    const checkComplete = () => {
      if (accountSummaryDone && positionsDone) {
        setPositions([...positionsRef.current]);
        setAccountData({ ...accountDataRef.current });
        setLoading(false);
        cleanup();
      }
    };

    const onAccountSummary = (reqId, account, tag, value, currency) => {
      if (reqId !== ACCOUNT_SUMMARY_REQ_ID) return;

      const numValue = parseFloat(value);

      switch (tag) {
        case 'NetLiquidation':
          accountDataRef.current.netLiquidation = numValue;
          break;
        case 'TotalCashValue':
          accountDataRef.current.totalCashValue = numValue;
          break;
        case 'AvailableFunds':
          accountDataRef.current.availableFunds = numValue;
          break;
        case 'BuyingPower':
          accountDataRef.current.buyingPower = numValue;
          break;
      }
    };

    const onAccountSummaryEnd = (reqId) => {
      if (reqId !== ACCOUNT_SUMMARY_REQ_ID) return;
      accountSummaryDone = true;
      checkComplete();
    };

    const onPosition = (account, contract, position, avgCost) => {
      if (position !== 0) {
        const existingIndex = positionsRef.current.findIndex(
          p => p.symbol === contract.symbol
        );

        const positionData = {
          symbol: contract.symbol,
          secType: contract.secType,
          quantity: position,
          avgCost: avgCost,
          marketValue: position * avgCost,
          currency: contract.currency || 'USD',
        };

        if (existingIndex >= 0) {
          positionsRef.current[existingIndex] = positionData;
        } else {
          positionsRef.current.push(positionData);
        }
      }
    };

    const onPositionEnd = () => {
      positionsDone = true;
      checkComplete();
    };

    const cleanup = () => {
      client.removeListener('accountSummary', onAccountSummary);
      client.removeListener('accountSummaryEnd', onAccountSummaryEnd);
      client.removeListener('position', onPosition);
      client.removeListener('positionEnd', onPositionEnd);
      try {
        client.cancelAccountSummary(ACCOUNT_SUMMARY_REQ_ID);
      } catch (e) {
        // ignore
      }
    };

    const timeout = setTimeout(() => {
      setError('Timeout obteniendo datos del portfolio');
      setLoading(false);
      cleanup();
    }, 15000);

    client.on('accountSummary', onAccountSummary);
    client.on('accountSummaryEnd', onAccountSummaryEnd);
    client.on('position', onPosition);
    client.on('positionEnd', onPositionEnd);

    client.reqAccountSummary(
      ACCOUNT_SUMMARY_REQ_ID,
      'All',
      ['NetLiquidation', 'TotalCashValue', 'AvailableFunds', 'BuyingPower']
    );
    client.reqPositions();

    return () => {
      clearTimeout(timeout);
      cleanup();
    };
  }, [getClient, isConnected]);

  useEffect(() => {
    if (isConnected) {
      fetchPortfolio();
    }
  }, [isConnected, fetchPortfolio]);

  const totalInvested = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalGain = accountData.netLiquidation - totalInvested - accountData.totalCashValue;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    positions,
    accountData,
    loading,
    error,
    refresh: fetchPortfolio,
    computed: {
      totalInvested,
      totalGain,
      gainPercent,
      cash: accountData.totalCashValue || accountData.availableFunds,
    },
  };
}

export default usePortfolio;
