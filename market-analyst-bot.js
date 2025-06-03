require('dotenv').config();
const ib = require('ib');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const OpenAI = require('openai');
const inquirer = require('inquirer');

// Configuración OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Variables globales
let ibClient = null;
let portfolio = {
  positions: [],
  cash: 0,
  totalValue: 0,
  accountId: null
};
let nextOrderId = null;

console.clear();
console.log(chalk.blue.bold('🧠 Market Intelligence Analyst'));
console.log(chalk.gray('━'.repeat(50)));
console.log(chalk.cyan('Tu analista personal de mercado al estilo Elon Musk\n'));

// Fase 1: Búsqueda REAL de noticias tecnológicas
async function searchTechNews() {
  const spinner = ora('🔍 Escaneando el mercado tecnológico...').start();
  
  try {
    const techSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META'];
    const newsItems = [];
    const marketData = {};
    
    // Obtener noticias de cada empresa
    for (const symbol of techSymbols) {
      try {
        const url = `https://news.google.com/rss/search?q=${symbol}+stock+market+today&hl=en-US&gl=US&ceid=US:en`;
        const response = await axios.get(url, { timeout: 5000 });
        
        // Parsear RSS
        const matches = response.data.match(/<title>(.*?)<\/title>/g) || [];
        const headlines = matches.slice(2, 5); // Top 3 noticias
        
        const companyNews = [];
        headlines.forEach(headline => {
          const cleanHeadline = headline.replace(/<\/?title>/g, '').replace(/&[^;]+;/g, '');
          
          // Análisis de sentimiento mejorado
          const positiveWords = /surge|soar|jump|rally|gain|profit|revenue|beat|breakthrough|innovation|upgrade|record|boost/i;
          const negativeWords = /plunge|crash|fall|drop|loss|decline|miss|lawsuit|investigation|concern|cut|layoff|warning/i;
          
          let sentiment = 'neutral';
          let intensity = 'normal';
          
          if (positiveWords.test(cleanHeadline)) {
            sentiment = 'positive';
            if (/surge|soar|jump|rally|record/i.test(cleanHeadline)) intensity = 'strong';
          }
          if (negativeWords.test(cleanHeadline)) {
            sentiment = 'negative';
            if (/plunge|crash|lawsuit|layoff/i.test(cleanHeadline)) intensity = 'strong';
          }
          
          companyNews.push({
            headline: cleanHeadline,
            sentiment: sentiment,
            intensity: intensity
          });
        });
        
        marketData[symbol] = companyNews;
        newsItems.push(...companyNews.map(n => ({ symbol, ...n })));
        
      } catch (err) {
        // Silenciosamente continuar
      }
    }
    
    spinner.succeed(`✅ Análisis de mercado completado`);
    console.log(chalk.yellow(`\n📊 Detectadas ${newsItems.length} señales del mercado`));
    
    return { newsItems, marketData };
  } catch (error) {
    spinner.fail('❌ Error en análisis de mercado');
    return { newsItems: [], marketData: {} };
  }
}

// Fase 2: Análisis profundo con GPT-4.5
async function analyzeMarketWithGPT(marketData, portfolio) {
  const spinner = ora('🤖 Procesando inteligencia de mercado con GPT-4.5...').start();
  
  try {
    // Preparar contexto del portfolio
    const portfolioContext = `
MI PORTFOLIO ACTUAL:
━━━━━━━━━━━━━━━━━━
• Valor total: $${portfolio.totalValue.toFixed(2)}
• Efectivo disponible: $${portfolio.cash.toFixed(2)}
• Posiciones actuales:
${portfolio.positions.length > 0 ? 
    portfolio.positions.map(p => `  - ${p.symbol}: ${p.shares} acciones @ $${p.avgCost.toFixed(2)} (valor: $${(p.shares * p.avgCost).toFixed(2)})`).join('\n') : 
    '  - Sin posiciones abiertas'}
`;

    // Preparar contexto de noticias
    const newsContext = `
PANORAMA DEL MERCADO TECNOLÓGICO HOY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(marketData.marketData).map(([symbol, news]) => {
  if (news.length === 0) return '';
  const sentiment = news.filter(n => n.sentiment === 'positive').length > news.filter(n => n.sentiment === 'negative').length ? '📈' : '📉';
  return `
${symbol} ${sentiment}:
${news.slice(0, 2).map(n => `• ${n.headline}`).join('\n')}`;
}).filter(s => s).join('\n')}
`;

    const systemPrompt = `Eres un analista de mercado brillante con el estilo pragmático y directo de Elon Musk.
Tu trabajo es analizar el mercado tecnológico y explicarlo de forma SIMPLE, DIRECTA y ACCIONABLE.
Hablas en español, sin rodeos, yendo al grano. Usas analogías simples cuando es necesario.
Piensas en términos de oportunidades y riesgos REALES, no teorías académicas.

IMPORTANTE: Tu respuesta DEBE estar estructurada en exactamente 4 secciones XML:
1. <panorama> - Explicación pragmática del mercado hoy
2. <monologo> - Reflexión interna de EXACTAMENTE 50 líneas
3. <conclusion> - Sugerencia final concreta
4. <accion> - Acción específica a ejecutar`;

    const userPrompt = `${portfolioContext}

${newsContext}

Analiza esta situación y responde en el formato XML exacto que te especifiqué.

EJEMPLO DE RESPUESTA ESPERADA:

<analysis>
<panorama>
Hoy el mercado tech está mostrando señales mixtas interesantes. NVIDIA sigue en su rally imparable - básicamente están vendiendo palas en la fiebre del oro de la IA. Tesla por otro lado está tomando un respiro después de semanas alcistas, típica corrección saludable.

Lo más relevante: Microsoft y Google están en una guerra silenciosa por dominar la IA empresarial. Es como la carrera espacial pero con modelos de lenguaje. Apple se mantiene lateral, esperando su momento para lanzar algo que cambie el juego - típico de ellos.

Amazon está barato relativamente, el mercado está castigando injustamente su división cloud. Meta sigue recuperándose de su resaca del metaverso, pivoteando hacia IA de forma inteligente.

El contexto macro: tasas altas pero estables, inflación controlándose. El mercado tech respira aliviado pero cauteloso. Es momento de ser selectivo, no de comprar todo lo que brilla.
</panorama>

<monologo>
1. Ok, mirando mi portfolio actual, tengo $${portfolio.cash.toFixed(2)} en efectivo.
2. Eso es poder de fuego considerable en este mercado.
3. Las posiciones que tengo están ${portfolio.positions.length > 0 ? 'generando retornos decentes' : 'por definirse aún'}.
4. NVIDIA está cara, pero ¿cuándo no lo ha estado en los últimos 2 años?
5. El que esperó el "pullback perfecto" se perdió 300% de ganancia.
6. Tesla... siempre es una montaña rusa emocional.
7. Pero Elon está ejecutando bien, Model 3 highland vendiendo como pan caliente.
8. Microsoft es el gigante dormido que todos subestiman.
9. Tienen Azure, tienen OpenAI, tienen Office - es un monopolio legal.
10. Google está asustado y eso me gusta - el miedo los hace innovar.
11. Bard era mediocre, Gemini está mejorando rápido.
12. Apple... siempre tan misteriosos, pero el Vision Pro se viene.
13. ¿Será otro iPad o otro Apple Watch? Apuesto por lo segundo.
14. Mi portfolio necesita más exposición a IA pura.
15. Pero no a precios estúpidos - hay que ser paciente.
16. Amazon AWS está imprimiendo dinero mientras todos miran la tienda online.
17. Es como Tesla - todos ven autos, yo veo software y energía.
18. Meta pivoteó bien, Zuckerberg aprendió la lección del metaverso.
19. Ahora están enfocados en IA generativa y eficiencia.
20. Cortaron grasa, mejoraron márgenes - me gusta eso.
21. El mercado general está nervioso con las tasas.
22. Pero tech grande tiene tanto cash que les importa poco.
23. Apple tiene $160B en efectivo - es un banco disfrazado.
24. ¿Debería aumentar mi posición en alguna de estas?
25. O tal vez es momento de tomar ganancias en las que subieron mucho.
26. El FOMO es real, pero la disciplina paga más a largo plazo.
27. Warren Buffett dice "sé codicioso cuando otros tienen miedo".
28. Pero también dice "no pierdas dinero" - contradicción productiva.
29. Mi estrategia: concentrarme en ganadores probados.
30. No necesito encontrar el próximo Tesla, ya existe Tesla.
31. NVIDIA es obvio pero por algo es obvio - están dominando.
32. Microsoft es aburrido pero los aburridos pagan las cuentas.
33. Google tiene el moat más grande: datos infinitos.
34. ¿Y si esta corrección es la oportunidad que esperaba?
35. Los débiles venden en pánico, los fuertes compran con convicción.
36. Pero tampoco hay que atrapar cuchillos cayendo.
37. Timing perfecto es imposible, direccionalidad correcta es suficiente.
38. Mi cash está perdiendo contra inflación cada día.
39. Pero también es munición para oportunidades.
40. Tesla bajo $200 sería regalo, NVIDIA bajo $700 también.
41. Microsoft sobre $400 ya es stretch, esperaría corrección.
42. Amazon está en precio justo, podría escalar posición.
43. Meta... aún no confío 100% en Zuckerberg pero está mejorando.
44. Apple siempre es "caro" hasta que no lo es.
45. El mercado tech es bipolar: euforia o pánico, nunca equilibrio.
46. Ahora estamos en "cautela optimista" - el mejor momento.
47. Ni muy caliente ni muy frío - Goldilocks para entrar.
48. Mi movimiento debe ser calculado, no emocional.
49. Pensar en horizonte 2-3 años, no 2-3 días.
50. Decisión tomada: es momento de actuar, pero con cabeza fría.
</monologo>

<conclusion>
El mercado está dándote una ventana de oportunidad en tech de calidad. No es momento de apostar todo, pero sí de incrementar exposición estratégicamente.

RECOMENDACIÓN PRAGMÁTICA: 
Con tu efectivo disponible, aprovecha la debilidad temporal en Amazon (AWS está infravalorado) o aumenta posición en Microsoft si tienes menos del 20% de tu portfolio ahí. Ambos son jugadas conservadoras con upside significativo.

Evita FOMO en NVIDIA por ahora - está muy extendida. Tesla es lotería a corto plazo. Apple espera a ver qué hacen con Vision Pro.

La jugada inteligente: 30% del efectivo a Amazon o Microsoft, mantén 70% para oportunidades mejores. El que tiene cash en correcciones es rey.
</conclusion>

<accion>
COMPRAR 50 acciones de AMZN @ mercado (approx $155-160)
Costo estimado: $7,750-8,000
Razón: AWS infravalorado, retail recuperándose, Alexa con IA será game changer
Horizonte: 18-24 meses
Target: $200+ (25-30% upside)
</accion>
</analysis>`;

    // Preparar input para GPT-4.5
    const apiInput = [
      {
        "role": "system",
        "content": [
          {
            "type": "input_text",
            "text": systemPrompt
          }
        ]
      },
      {
        "role": "user", 
        "content": [
          {
            "type": "input_text",
            "text": userPrompt
          }
        ]
      }
    ];

    // Llamar a GPT-4.5
    const response = await openai.responses.create({
      model: "gpt-4.5-preview",
      input: apiInput,
      text: {
        "format": {
          "type": "text"
        }
      },
      reasoning: {},
      tools: [],
      temperature: 0.7,
      max_output_tokens: 3000,
      top_p: 0.9,
      store: true
    });

    const responseText = response.output?.[0]?.content?.[0]?.text || "";
    
    spinner.succeed('✅ Análisis completado');
    
    return parseAnalysis(responseText);
    
  } catch (error) {
    spinner.fail('❌ Error en análisis');
    console.error(chalk.red('Detalle:'), error.message);
    return null;
  }
}

// Parser mejorado para el análisis
function parseAnalysis(xmlText) {
  try {
    const analysisMatch = xmlText.match(/<analysis>([\s\S]*?)<\/analysis>/);
    if (!analysisMatch) {
      console.error(chalk.red('No se encontró análisis válido'));
      return null;
    }
    
    const analysis = analysisMatch[1];
    
    const panorama = analysis.match(/<panorama>([\s\S]*?)<\/panorama>/)?.[1]?.trim() || '';
    const monologo = analysis.match(/<monologo>([\s\S]*?)<\/monologo>/)?.[1]?.trim() || '';
    const conclusion = analysis.match(/<conclusion>([\s\S]*?)<\/conclusion>/)?.[1]?.trim() || '';
    const accion = analysis.match(/<accion>([\s\S]*?)<\/accion>/)?.[1]?.trim() || '';
    
    return { panorama, monologo, conclusion, accion };
    
  } catch (error) {
    console.error('Error parseando análisis:', error);
    return null;
  }
}

// Mostrar análisis de forma visual
async function displayAnalysis(analysis) {
  if (!analysis) return;
  
  // PANORAMA
  console.log(chalk.blue('\n' + '═'.repeat(60)));
  console.log(chalk.blue.bold('📊 PANORAMA DEL MERCADO'));
  console.log(chalk.blue('═'.repeat(60)));
  console.log(chalk.white(analysis.panorama));
  
  // MONÓLOGO
  console.log(chalk.yellow('\n' + '═'.repeat(60)));
  console.log(chalk.yellow.bold('🧠 MONÓLOGO INTERNO'));
  console.log(chalk.yellow('═'.repeat(60)));
  const monologoLines = analysis.monologo.split('\n');
  monologoLines.forEach(line => {
    console.log(chalk.gray(line));
  });
  
  // CONCLUSIÓN
  console.log(chalk.green('\n' + '═'.repeat(60)));
  console.log(chalk.green.bold('💡 CONCLUSIÓN Y ESTRATEGIA'));
  console.log(chalk.green('═'.repeat(60)));
  console.log(chalk.white(analysis.conclusion));
  
  // ACCIÓN SUGERIDA
  console.log(chalk.cyan('\n' + '═'.repeat(60)));
  console.log(chalk.cyan.bold('🎯 ACCIÓN RECOMENDADA'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.white(analysis.accion));
  console.log(chalk.cyan('═'.repeat(60)));
  
  return analysis.accion;
}

// Preguntar confirmación para ejecutar
async function confirmExecution(actionText) {
  console.log(chalk.yellow('\n⚠️  ¿Quieres ejecutar esta operación?'));
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Ejecutar la acción recomendada?',
      default: false
    }
  ]);
  
  return confirm;
}

// Ejecutar acción si se confirma
async function executeAction(actionText) {
  // Parsear la acción
  const buyMatch = actionText.match(/COMPRAR\s+(\d+)\s+acciones?\s+de\s+(\w+)/i);
  const sellMatch = actionText.match(/VENDER\s+(\d+)\s+acciones?\s+de\s+(\w+)/i);
  
  if (buyMatch) {
    const [_, quantity, symbol] = buyMatch;
    console.log(chalk.green(`\n📈 Ejecutando COMPRA de ${quantity} ${symbol}...`));
    
    if (ibClient && nextOrderId) {
      const contract = ib.contract.stock(symbol, 'SMART', 'USD');
      const order = ib.order.market('BUY', parseInt(quantity));
      
      ibClient.placeOrder(nextOrderId, contract, order);
      
      ibClient.on('orderStatus', (orderId, status, filled, remaining, avgFillPrice) => {
        if (orderId === nextOrderId) {
          console.log(chalk.green(`✅ Orden ${orderId}: ${status} - ${filled}/${quantity} @ $${avgFillPrice}`));
        }
      });
      
      nextOrderId++;
    }
    
  } else if (sellMatch) {
    const [_, quantity, symbol] = sellMatch;
    console.log(chalk.red(`\n📉 Ejecutando VENTA de ${quantity} ${symbol}...`));
    
    if (ibClient && nextOrderId) {
      const contract = ib.contract.stock(symbol, 'SMART', 'USD');
      const order = ib.order.market('SELL', parseInt(quantity));
      
      ibClient.placeOrder(nextOrderId, contract, order);
      
      ibClient.on('orderStatus', (orderId, status, filled, remaining, avgFillPrice) => {
        if (orderId === nextOrderId) {
          console.log(chalk.red(`✅ Orden ${orderId}: ${status} - ${filled}/${quantity} @ $${avgFillPrice}`));
        }
      });
      
      nextOrderId++;
    }
    
  } else {
    console.log(chalk.blue('\n📊 No hay acción específica para ejecutar (HOLD)'));
  }
}

// Conectar a IB
async function connectToIB() {
  const spinner = ora('Conectando con Interactive Brokers...').start();
  
  return new Promise((resolve) => {
    ibClient = new ib({
      clientId: 2,
      host: '127.0.0.1',
      port: 7497
    });

    portfolio.positions = [];

    ibClient.on('error', (err) => {
      if (!err.message.toLowerCase().includes('info')) {
        console.error(chalk.red(`Error IB: ${err.message}`));
      }
    });

    ibClient.on('nextValidId', (orderId) => {
      spinner.succeed('✅ Conectado a IB');
      nextOrderId = orderId;
      
      ibClient.reqAccountSummary(1, 'All', 'TotalCashValue,NetLiquidation');
      ibClient.reqPositions();
      
      setTimeout(resolve, 3000);
    });

    ibClient.on('accountSummary', (reqId, account, tag, value, currency) => {
      if (tag === 'TotalCashValue' && currency === 'USD') {
        portfolio.cash = parseFloat(value);
      }
      if (tag === 'NetLiquidation' && currency === 'USD') {
        portfolio.totalValue = parseFloat(value);
      }
    });

    ibClient.on('position', (account, contract, pos, avgCost) => {
      if (pos !== 0) {
        portfolio.positions.push({
          symbol: contract.symbol,
          shares: pos,
          avgCost: avgCost
        });
      }
    });

    ibClient.connect();
    ibClient.reqIds(1);
  });
}

// Ciclo principal
async function runAnalysisCycle() {
  console.log(chalk.blue.bold(`\n🔄 Iniciando análisis de mercado - ${new Date().toLocaleTimeString()}`));
  console.log(chalk.gray('━'.repeat(60)));
  
  try {
    // Actualizar portfolio
    if (ibClient && ibClient.connected) {
      ibClient.reqAccountSummary(2, 'All', 'TotalCashValue,NetLiquidation');
      ibClient.reqPositions();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Buscar noticias
    const marketData = await searchTechNews();
    
    if (marketData.newsItems.length === 0) {
      console.log(chalk.yellow('⚠️  No hay datos de mercado disponibles'));
      return;
    }
    
    // Analizar con GPT-4.5
    const analysis = await analyzeMarketWithGPT(marketData, portfolio);
    
    // Mostrar análisis
    const actionText = await displayAnalysis(analysis);
    
    // Confirmar y ejecutar si se desea
    if (actionText) {
      const shouldExecute = await confirmExecution(actionText);
      if (shouldExecute) {
        await executeAction(actionText);
      } else {
        console.log(chalk.gray('\n✋ Acción cancelada por el usuario'));
      }
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error en ciclo:'), error.message);
  }
  
  console.log(chalk.gray('\n' + '━'.repeat(60)));
}

// Main
async function main() {
  console.log(chalk.yellow('\n⚡ Iniciando Market Intelligence Analyst...'));
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_api_key_aqui') {
    console.error(chalk.red('\n❌ ERROR: Configura tu OPENAI_API_KEY en .env'));
    process.exit(1);
  }
  
  await connectToIB();
  
  // Ejecutar análisis inmediatamente
  await runAnalysisCycle();
  
  // Preguntar si quiere otro análisis
  const askForNext = async () => {
    const { next } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'next',
        message: '\n¿Quieres ejecutar otro análisis?',
        default: true
      }
    ]);
    
    if (next) {
      await runAnalysisCycle();
      await askForNext();
    } else {
      console.log(chalk.yellow('\n👋 Cerrando Market Intelligence Analyst...'));
      if (ibClient) ibClient.disconnect();
      process.exit(0);
    }
  };
  
  await askForNext();
}

// Manejo de cierre
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Cerrando...'));
  if (ibClient) ibClient.disconnect();
  process.exit(0);
});

// Iniciar
main().catch(console.error);