const ib = require('ib');

// Crear cliente IB
const client = new ib({
  clientId: 0,
  host: '127.0.0.1',
  port: 7497  // Puerto para TWS paper trading (7496 para live)
});

// Manejador de errores
client.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

// Cuando se conecta exitosamente
client.on('nextValidId', (orderId) => {
  console.log('✅ Conectado exitosamente. Próximo Order ID:', orderId);
  
  // Solicitar cuentas manejadas
  client.reqManagedAccts();
  
  // Solicitar información de la cuenta
  client.reqAccountSummary(1, 'All', 'AccountType,NetLiquidation,TotalCashValue');
  
  // Solicitar posiciones actuales
  client.reqPositions();
});

// Respuesta de cuentas manejadas
client.on('managedAccounts', (accounts) => {
  console.log('📊 Cuentas disponibles:', accounts);
});

// Respuesta del resumen de cuenta
client.on('accountSummary', (reqId, account, tag, value, currency) => {
  console.log(`💰 ${tag}: ${value} ${currency || ''} (Cuenta: ${account})`);
  
  // Capturar NetLiquidation para cálculos
  if (tag === 'NetLiquidation' && currency === 'USD') {
    netLiquidation = parseFloat(value);
  }
});

// Variables para cálculos
let totalInvestment = 0;
let totalCurrentValue = 0;
let positions = [];
let netLiquidation = 0;

// Respuesta de posiciones
client.on('position', (account, contract, position, avgCost) => {
  if (position !== 0) {
    const currentValue = position * avgCost; // Simplificado, faltaría precio actual
    const positionData = {
      symbol: contract.symbol,
      position: position,
      avgCost: avgCost,
      currentValue: currentValue
    };
    positions.push(positionData);
    
    console.log(`📈 ${contract.symbol}: ${position} acciones a $${avgCost.toFixed(2)} promedio`);
    totalInvestment += currentValue; // Para este ejemplo básico
  }
});

// Cuando terminan las posiciones
client.on('positionEnd', () => {
  console.log('\n🎯 RESUMEN DE TU INVERSIÓN:');
  console.log('═══════════════════════════════════');
  
  // Métrica 1: Valor total del portfolio
  console.log(`💰 Valor total del portfolio: $${netLiquidation.toFixed(2)}`);
  
  // Métrica 2: Ganancia total estimada (simplificada)
  const estimatedGain = netLiquidation - totalInvestment;
  console.log(`📊 Ganancia estimada: $${estimatedGain.toFixed(2)}`);
  
  // Métrica 3: Porcentaje de ganancia
  const gainPercentage = totalInvestment > 0 ? (estimatedGain / totalInvestment) * 100 : 0;
  console.log(`📈 Porcentaje de ganancia: ${gainPercentage.toFixed(2)}%`);
  
  // Métrica 4: Ganancia anualizada (asumiendo 2 meses)
  const annualizedReturn = gainPercentage * 6; // 2 meses * 6 = 12 meses
  console.log(`🚀 Rendimiento anualizado: ${annualizedReturn.toFixed(2)}%`);
  
  // Métrica 5: Ganancia por día (asumiendo 60 días)
  const gainPerDay = estimatedGain / 60;
  console.log(`📅 Ganancia promedio por día: $${gainPerDay.toFixed(2)}`);
  
  console.log('═══════════════════════════════════');
  
  client.disconnect();
});

// Cuando termina el resumen de cuenta
client.on('accountSummaryEnd', (reqId) => {
  console.log('✅ Información de cuenta obtenida');
});

// Iniciar conexión
console.log('🔗 Conectando a Interactive Brokers...');
client.connect();

// Solicitar el próximo ID válido para iniciar
client.reqIds(1);