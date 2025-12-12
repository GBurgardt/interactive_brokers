#!/usr/bin/env bun
/**
 * FOLIO TUI - Interactive Brokers Portfolio Manager
 *
 * Built with OpenTUI for that cyberpunk terminal aesthetic.
 */

import 'dotenv/config';
import { App } from './app/App';
import { UIRenderer } from './ui/Renderer';

// Parse arguments
const args = process.argv.slice(2);
const paperTrading = args.includes('--paper') || args.includes('-p');
const showHelp = args.includes('--help') || args.includes('-h');
const debugMode = args.includes('--debug') || args.includes('-d');

// Export debug mode globally
(global as any).DEBUG_MODE = debugMode;

function debug(...args: any[]) {
  if (debugMode) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`[${timestamp}] [DEBUG]`, ...args);
  }
}
(global as any).debug = debug;

if (showHelp) {
  console.log(`
  Folio TUI - Interactive Brokers Portfolio Manager

  Usage:
    bun start              Conectar a cuenta REAL (puerto 7496)
    bun start -- --paper   Conectar a cuenta PAPER (puerto 7497)

  Opciones:
    --paper, -p    Usar paper trading (puerto 7497)
    --debug, -d    Modo debug con logs detallados
    --help, -h     Mostrar esta ayuda

  Navegación:
    ↑↓         Navegar posiciones
    Enter      Ver detalle de posición
    b          Comprar
    s          Vender (en detalle)
    /          Buscar símbolo
    r          Refrescar datos
    Esc        Volver
    q          Salir

  Requisitos:
    - TWS o IB Gateway abierto
    - API habilitada en Settings > API
    - Puerto 7496 (live) o 7497 (paper)
  `);
  process.exit(0);
}

// Check if terminal supports interactive mode
if (!process.stdin.isTTY) {
  console.log(`
  Este CLI necesita ejecutarse en una terminal interactiva.

  Ejecutá directamente:
    bun run src/index.ts

  O:
    bun start
  `);
  process.exit(1);
}

console.log('[FOLIO-TUI] Iniciando aplicación...');
console.log('[FOLIO-TUI] Paper trading:', paperTrading ? 'SÍ (puerto 7497)' : 'NO (puerto 7496)');

async function main() {
  // Import createCliRenderer directly to test
  const { createCliRenderer, TextRenderable, BoxRenderable, SelectRenderable, SelectRenderableEvents } = await import("@opentui/core");

  console.log('[FOLIO-TUI] Creando renderer primero...');

  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    targetFps: 60,
  });

  console.log('[FOLIO-TUI] Renderer creado!');
  console.log('[FOLIO-TUI] Screen:', renderer.width, 'x', renderer.height);

  // Simple UI
  const header = new BoxRenderable(renderer, {
    id: 'header',
    width: renderer.width - 2,
    height: 4,
    backgroundColor: '#1a1a2e',
    borderStyle: 'round',
    borderColor: '#4a9eff',
    position: 'absolute',
    left: 1,
    top: 0,
  });

  const title = new TextRenderable(renderer, {
    id: 'title',
    content: '  FOLIO TUI - Conectando a TWS...',
    fg: '#ffffff',
    position: 'absolute',
    left: 2,
    top: 1,
  });

  const status = new TextRenderable(renderer, {
    id: 'status',
    content: ' [q] Salir',
    fg: '#888888',
    position: 'absolute',
    left: 0,
    top: renderer.height - 1,
  });

  renderer.root.add(header);
  renderer.root.add(title);
  renderer.root.add(status);

  console.log('[FOLIO-TUI] UI básica lista');

  // Now create app
  console.log('[FOLIO-TUI] Creando App...');
  const app = new App({ paperTrading });

  // Update UI on state change
  app.on('stateChange', () => {
    const state = app.state;
    if (state.connectionStatus === 'connected') {
      title.content = `  FOLIO TUI - Conectado | ${state.accountId || ''}`;
      title.fg = '#00ff00';
    } else if (state.connectionStatus === 'error') {
      title.content = `  ERROR: ${state.connectionError}`;
      title.fg = '#ff4444';
    }
  });

  app.on('quit', () => {
    renderer.stop();
    process.exit(0);
  });

  // Keyboard
  renderer.keyInput.on('keypress', (key: any) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      renderer.stop();
      process.exit(0);
    }
    if (key.name === 'r' && app.state.screen === 'error') {
      app.retry();
    }
  });

  console.log('[FOLIO-TUI] Conectando a IB...');

  // Connect after a small delay
  setTimeout(() => {
    app.connect();
  }, 500);
}

main().catch((err) => {
  console.error('[FOLIO-TUI] Error fatal:', err);
  process.exit(1);
});
