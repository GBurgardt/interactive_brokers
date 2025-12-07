import { useState, useEffect, useCallback, useRef } from 'react';
import IB from 'ib';

const INFO_CODES = new Set([2104, 2106, 2158, 2119]);
const IGNORED_CODES = new Set([300, 354, 10167]);

export function useIBConnection(options = {}) {
  const {
    host = process.env.IB_HOST || '127.0.0.1',
    port = parseInt(process.env.IB_PORT || '7496', 10),
    clientId = parseInt(process.env.IB_CLIENT_ID || '0', 10),
  } = options;

  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [error, setError] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const clientRef = useRef(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectingRef.current || status === 'connected') {
      return;
    }

    isConnectingRef.current = true;
    setStatus('connecting');
    setError(null);

    const client = new IB({
      clientId,
      host,
      port,
    });

    clientRef.current = client;

    const connectionTimeout = setTimeout(() => {
      if (status !== 'connected') {
        setStatus('error');
        setError('Timeout - TWS no responde. Verificá que esté abierto.');
        isConnectingRef.current = false;
      }
    }, 10000);

    client.on('error', (err, data) => {
      const code = data?.code;

      if (code && (INFO_CODES.has(code) || IGNORED_CODES.has(code))) {
        return;
      }

      const message = err?.message || String(err);
      if (message.includes('ECONNREFUSED')) {
        clearTimeout(connectionTimeout);
        setStatus('error');
        setError('No puedo conectar a TWS. ¿Está abierto?');
        isConnectingRef.current = false;
      }
    });

    client.on('nextValidId', () => {
      clearTimeout(connectionTimeout);
      setStatus('connected');
      isConnectingRef.current = false;
      client.reqManagedAccts();
    });

    client.on('managedAccounts', (accounts) => {
      const firstAccount = accounts.split(',')[0];
      setAccountId(firstAccount);
    });

    client.on('disconnected', () => {
      setStatus('disconnected');
      isConnectingRef.current = false;
    });

    client.connect();
    client.reqIds(1);
  }, [host, port, clientId, status]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      clientRef.current = null;
    }
    setStatus('disconnected');
    isConnectingRef.current = false;
  }, []);

  const getClient = useCallback(() => {
    return clientRef.current;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    error,
    accountId,
    connect,
    disconnect,
    getClient,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
}

export default useIBConnection;
