import React from 'react';
import { Box, Text } from 'ink';

const shortcuts = {
  portfolio: [
    { key: '↑↓', label: 'Navegar' },
    { key: 'Enter', label: 'Detalles' },
    { key: 'b', label: 'Comprar' },
    { key: '/', label: 'Buscar' },
    { key: 'r', label: 'Refrescar' },
    { key: 'q', label: 'Salir' },
  ],
  detail: [
    { key: '→', label: 'Histórico' },
    { key: 'b', label: 'Comprar' },
    { key: 's', label: 'Vender' },
    { key: '←', label: 'Volver' },
  ],
  chart: [
    { key: '↑↓', label: 'Período' },
    { key: '←', label: 'Volver' },
  ],
  buy: [
    { key: 'Enter', label: 'Confirmar' },
    { key: 'Esc', label: 'Cancelar' },
  ],
  search: [
    { key: 'Enter', label: 'Seleccionar' },
    { key: 'Esc', label: 'Volver' },
  ],
  confirm: [
    { key: 'Enter', label: 'Sí' },
    { key: 'Esc', label: 'No' },
  ],
};

export function StatusBar({ screen = 'portfolio' }) {
  const items = shortcuts[screen] || shortcuts.portfolio;

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      marginTop={1}
    >
      <Box flexDirection="row" gap={2}>
        {items.map((item, i) => (
          <Box key={i} gap={1}>
            <Text color="cyan">[{item.key}]</Text>
            <Text color="gray">{item.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default StatusBar;
