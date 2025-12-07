import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

export function Loading({ message = 'Cargando...' }) {
  return (
    <Box flexDirection="column" padding={2} alignItems="center" justifyContent="center">
      <Box gap={2}>
        <Text color="blue">
          <Spinner type="dots" />
        </Text>
        <Text color="gray">{message}</Text>
      </Box>
    </Box>
  );
}

export function ConnectionError({ error, onRetry }) {
  return (
    <Box flexDirection="column" padding={2}>
      <Box
        borderStyle="round"
        borderColor="red"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        <Text bold color="red">No se pudo conectar</Text>
        <Text color="gray" wrap="wrap">{error}</Text>
      </Box>

      <Box marginTop={2} flexDirection="column" paddingX={1}>
        <Text color="gray">Para usar Folio necesitás:</Text>
        <Text color="gray">  1. TWS o IB Gateway abierto</Text>
        <Text color="gray">  2. API habilitada en Settings {'>'} API {'>'} Enable</Text>
        <Text color="gray">  3. Puerto 7496 (live) o 7497 (paper)</Text>
      </Box>

      <Box marginTop={2} paddingX={1}>
        <Text color="cyan">[r] Reintentar  [q] Salir</Text>
      </Box>
    </Box>
  );
}

export function OrderResult({ result, onContinue }) {
  const isSuccess = result.status === 'Filled' || result.status === 'Submitted' || result.status === 'PreSubmitted';

  return (
    <Box flexDirection="column" padding={1}>
      <Box
        borderStyle="round"
        borderColor={isSuccess ? 'green' : 'yellow'}
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        <Text bold color={isSuccess ? 'green' : 'yellow'}>
          {isSuccess ? 'Orden ejecutada' : 'Orden enviada'}
        </Text>
      </Box>

      <Box
        borderStyle="single"
        borderColor="gray"
        marginTop={1}
        flexDirection="column"
        paddingX={2}
        paddingY={1}
        gap={1}
      >
        <Box justifyContent="space-between">
          <Text color="gray">Orden #:</Text>
          <Text>{result.orderId}</Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Estado:</Text>
          <Text color={isSuccess ? 'green' : 'yellow'}>{result.status}</Text>
        </Box>

        {result.filled && (
          <Box justifyContent="space-between">
            <Text color="gray">Ejecutadas:</Text>
            <Text>{result.filled}</Text>
          </Box>
        )}

        {result.avgFillPrice && (
          <Box justifyContent="space-between">
            <Text color="gray">Precio promedio:</Text>
            <Text>${result.avgFillPrice.toFixed(2)}</Text>
          </Box>
        )}
      </Box>

      <Box marginTop={2} paddingX={1}>
        <Text color="cyan">[Enter] Continuar</Text>
      </Box>
    </Box>
  );
}

export default Loading;
