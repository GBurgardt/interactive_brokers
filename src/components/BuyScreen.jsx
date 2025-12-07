import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { formatMoney } from '../utils/format.js';
import StatusBar from './StatusBar.jsx';

export function BuyScreen({
  symbol,
  currentPrice,
  priceLoading,
  availableCash,
  onConfirm,
  onCancel,
}) {
  const [quantity, setQuantity] = useState('');
  const [step, setStep] = useState('input'); // input, confirm
  const [error, setError] = useState(null);

  const maxShares = currentPrice > 0 ? Math.floor(availableCash / currentPrice) : 0;
  const estimatedCost = quantity ? parseInt(quantity, 10) * currentPrice : 0;

  const handleSubmit = () => {
    const qty = quantity.toLowerCase() === 'max' ? maxShares : parseInt(quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      setError('Ingresá un número válido');
      return;
    }

    if (qty > maxShares) {
      setError(`Máximo ${maxShares} acciones con tu cash disponible`);
      return;
    }

    setError(null);
    setQuantity(String(qty));
    setStep('confirm');
  };

  const handleConfirm = () => {
    const qty = parseInt(quantity, 10);
    onConfirm?.(symbol, qty);
  };

  useInput((input, key) => {
    if (key.escape) {
      if (step === 'confirm') {
        setStep('input');
      } else {
        onCancel?.();
      }
    } else if (key.return && step === 'confirm') {
      handleConfirm();
    }
  });

  if (priceLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box
          borderStyle="round"
          borderColor="blue"
          paddingX={2}
          paddingY={1}
        >
          <Text>Obteniendo precio de {symbol}...</Text>
        </Box>
      </Box>
    );
  }

  if (!currentPrice) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box
          borderStyle="round"
          borderColor="red"
          paddingX={2}
          paddingY={1}
        >
          <Text color="red">No se pudo obtener el precio de {symbol}</Text>
        </Box>
        <StatusBar screen="buy" />
      </Box>
    );
  }

  if (step === 'confirm') {
    const qty = parseInt(quantity, 10);
    const total = qty * currentPrice;

    return (
      <Box flexDirection="column" padding={1}>
        <Box
          borderStyle="round"
          borderColor="yellow"
          flexDirection="column"
          paddingX={2}
          paddingY={1}
        >
          <Text bold color="yellow">¿Confirmar compra?</Text>
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
            <Text color="gray">Cantidad:</Text>
            <Text bold>{qty} × {symbol}</Text>
          </Box>

          <Box justifyContent="space-between">
            <Text color="gray">Precio aprox:</Text>
            <Text>{formatMoney(currentPrice)}</Text>
          </Box>

          <Box justifyContent="space-between">
            <Text color="gray">Total estimado:</Text>
            <Text bold color="white">{formatMoney(total)}</Text>
          </Box>
        </Box>

        <StatusBar screen="confirm" />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor="blue"
        paddingX={2}
        paddingY={1}
      >
        <Text bold>Comprar {symbol}</Text>
      </Box>

      {/* Info */}
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
          <Text color="gray">Cash disponible:</Text>
          <Text color="green">{formatMoney(availableCash)}</Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Precio actual:</Text>
          <Text>{formatMoney(currentPrice)}</Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color="gray">Máximo:</Text>
          <Text>{maxShares} acciones</Text>
        </Box>
      </Box>

      {/* Input */}
      <Box
        borderStyle="single"
        borderColor="blue"
        marginTop={1}
        paddingX={2}
        paddingY={1}
        flexDirection="column"
        gap={1}
      >
        <Box>
          <Text color="gray">Cantidad: </Text>
          <TextInput
            value={quantity}
            onChange={setQuantity}
            onSubmit={handleSubmit}
            placeholder="Ej: 10 o 'max'"
          />
        </Box>

        {quantity && !isNaN(parseInt(quantity, 10)) && (
          <Box>
            <Text color="gray">
              Costo estimado: {formatMoney(parseInt(quantity, 10) * currentPrice)}
            </Text>
          </Box>
        )}

        {error && (
          <Text color="red">{error}</Text>
        )}
      </Box>

      <StatusBar screen="buy" />
    </Box>
  );
}

export default BuyScreen;
