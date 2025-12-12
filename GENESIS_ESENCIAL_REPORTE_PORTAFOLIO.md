# GÉNESIS ESENCIAL — Reporte de Portafolio (Folio)

MODO: ZEN ABSOLUTO / GÉNESIS ESENCIAL  
ENTRADA: “Una pantalla grande con un gráfico del portafolio total en el tiempo, con hitos de ingresos/egresos y transacciones”.

---

## PASO 1: LA EXCAVACIÓN DEL DESEO

### Verbo primario
**Ver.** (No “gestionar”, no “analizar”: ver lo que está pasando, ahora, con el paso del tiempo.)

### Dolor específico que elimina
La ansiedad de “no sé si mi portafolio se mueve por mercado o por mis acciones” y la fricción de reconstruir mentalmente qué evento causó un cambio.

### Qué haría el usuario si esto no existiera
Miraría números sueltos (NetLiquidation, Cash, PnL), abriría actividad/órdenes, y “adivinaría” correlaciones. O exportaría a Excel. O dejaría de mirar.

### Estado emocional antes / después
**Confusión → Claridad.**  
**Ansiedad → Control silencioso.**

### Brújula (≤ 5 palabras)
**“Ver el portafolio respirar.”**

---

## PASO 1.1: LA BÚSQUEDA DE LA ELEGANCIA (INVESTIGACIÓN)

### Principios (no “features”)
- **Baja tinta/noise**: el contraste debe servir al dato, no al marco.
- **Contexto sin texto**: el tiempo se entiende por ritmo y posición (inicio/medio/fin).
- **Anotar sin contaminar**: eventos como “cicatrices” mínimas, alineadas al eje temporal.
- **El gráfico es la pantalla**: el UI es el dato; todo lo demás es soporte.

### Referencias encontradas (síntesis)
- Tufte / *Sparklines*: bajar ruido visual, priorizar línea de datos; contraste con intención; evitar adornos que compiten con la forma del dato.
- Anti‑patrones frecuentes: exceso de leyendas, gridlines dominantes, demasiadas series/colores, tooltips obligatorios, ejes ilegibles.
- Naturaleza (análogo): **anillos de crecimiento / dendrocronología**: una historia continua donde eventos “marcan” un año; no hay paneles, hay registro.

---

## PASO 2: EL MONÓLOGO DEL ARQUITECTO (300 LÍNEAS)

001. Pantalla en blanco.
002. No hay menú.
003. No hay lista.
004. Hay una pregunta: ¿qué cambió?
005. La respuesta debe ser una línea.
006. Esa línea es el portafolio.
007. El usuario llega y no quiere “opciones”.
008. Quiere ver.
009. Ver sin pensar.
010. Si necesita pensar, fallé.
011. Trazo un eje horizontal: tiempo.
012. Trazo un eje vertical: valor.
013. Todo lo demás se gana el derecho de existir.
014. El gráfico ocupa la pantalla.
015. No “bonito”: legible.
016. Legible en dos segundos.
017. El ojo busca forma.
018. La forma debe ser quieta.
019. Quietud = poco ruido.
020. Quito bordes innecesarios.
021. Dejo solo lo que ancla.
022. El usuario necesita un “ahora”.
023. El “ahora” es el último punto.
024. Ese punto no se etiqueta con palabras.
025. Se insinúa con posición: a la derecha.
026. El tiempo corre hacia la derecha.
027. La derecha es presente.
028. El pasado se degrada solo: queda atrás.
029. Me tienta mostrar mil números.
030. No.
031. Un número máximo: el valor actual.
032. Pero incluso ese número puede sobrar.
033. Si el gráfico es claro, el número es eco.
034. Dejo el número como susurro.
035. No como cartel.
036. El contraste: fondo silencioso.
037. Línea protagonista.
038. Una línea.
039. Si agrego otra, rompo el verbo.
040. El verbo es ver, no comparar.
041. El usuario pide hitos.
042. Un hito no es un botón.
043. Un hito es una marca mínima.
044. Como un anillo en un árbol.
045. El evento deja cicatriz, no panel.
046. La cicatriz debe alinearse al tiempo.
047. No debe tapar la respiración del gráfico.
048. No debe pedir leyenda.
049. Pero debe ser distinguible.
050. Uso forma antes que texto.
051. Un triángulo hacia arriba: ingreso.
052. Un triángulo hacia abajo: egreso.
053. Un punto: trade.
054. Si varios coinciden: un diamante.
055. No agrego colores por deporte.
056. Color solo si baja ambigüedad.
057. Verde para arriba.
058. Rojo para abajo.
059. Cian para selección y foco.
060. La selección debe ser opcional.
061. El usuario no viene a navegar.
062. Viene a mirar.
063. Entonces, por defecto: sin cursor.
064. Sin “modo”.
065. Pero sí: un escape para volver.
066. Porque el camino debe ser reversible.
067. Si el usuario se pierde, fallé.
068. El gráfico necesita tiempo en el eje.
069. Pero demasiadas etiquetas ensucian.
070. Tres etiquetas bastan: inicio, medio, fin.
071. El cerebro interpola.
072. No compito con el cerebro.
073. Dejo que complete.
074. Si el período cambia, debe ser natural.
075. Flecha arriba: más tiempo.
076. Flecha abajo: menos tiempo.
077. Es un zoom, no una preferencia.
078. No guardo configuraciones.
079. La memoria es del usuario, no del sistema.
080. El sistema recuerda lo esencial: la historia.
081. La historia no se pide.
082. La historia se acumula sola.
083. Cada refresh es un latido.
084. Cada latido agrega un punto.
085. Si no hay puntos, no invento.
086. Muestro silencio: “cargando…”
087. Pero sin dramatismo.
088. El usuario no debe sentir fallo.
089. Solo espera.
090. El eje vertical debe ser consistente.
091. El rango se ajusta al período.
092. Sin saltos bruscos de escala.
093. Pero tampoco recorto tanto que mienta.
094. El objetivo es verdad visual.
095. La línea debe tener aire arriba y abajo.
096. Margen pequeño, no enorme.
097. El “cero” rara vez importa aquí.
098. Importa el cambio.
099. Pero el cambio necesita contexto.
100. Contexto = escala legible.
101. Formateo dinero con anchura fija.
102. Para que el eje no baile.
103. Si el eje baila, el ojo se cansa.
104. El ojo cansado deja de mirar.
105. Y el verbo muere.
106. El gráfico debe ser grande.
107. Grande en ancho.
108. Grande en alto.
109. Uso la altura disponible.
110. No fuerzo 12 líneas si hay 30.
111. Pero dejo espacio para respirar.
112. Un pequeño footer para controles.
113. No explico con párrafos.
114. Solo señalo.
115. La pantalla debe sentirse inevitable.
116. Una vez vista, no puede “no existir”.
117. El usuario pide “reporte”.
118. No es un reporte.
119. Es un espejo.
120. Un espejo del tiempo.
121. En un espejo, no hay filtros.
122. Solo reflejo.
123. Los hitos no deben competir con el reflejo.
124. Deben ser discretos.
125. Pero precisos.
126. Precisión en posición.
127. Discreción en forma.
128. Si un depósito ocurre, se marca.
129. Si un retiro ocurre, se marca.
130. Si una compra ocurre, se marca.
131. Si una venta ocurre, se marca.
132. La marca no explica.
133. Solo señala.
134. La explicación, si existe, es secundaria.
135. No abro un panel lateral.
136. No pongo una tabla abajo.
137. Eso es tentación.
138. Si el usuario quiere detalle, ya hay Actividad.
139. Esta pantalla es contexto, no log.
140. Entonces la integración debe ser simple.
141. Desde “inicio”, una tecla abre el reporte.
142. Una sola tecla.
143. No un submenú.
144. La tecla es “g”: gráfico.
145. Porque no hay que memorizar palabras.
146. El regreso es Escape.
147. Siempre.
148. Si el usuario no toca nada, igual funciona.
149. El gráfico se actualiza solo.
150. Porque el tiempo no espera.
151. La app no debe esperar al usuario.
152. Debe respirar sin que se lo pidan.
153. Auto‑refresh, suave.
154. No obsesivo.
155. Treinta segundos es humano.
156. No interrumpe.
157. No satura.
158. Es un latido lento.
159. Con cada latido, se agrega un punto.
160. Si el punto es igual al anterior, no ensucio.
161. No repito.
162. La historia se limpia sola.
163. Guardo un máximo razonable.
164. Porque infinito es ruido.
165. Si se pierde historia vieja, no duele.
166. Esta es una pantalla de “ahora”.
167. Pero con memoria suficiente.
168. La memoria debe ser suficiente para sentir tendencia.
169. Tendencia = forma.
170. El usuario entiende forma.
171. Forma con marcas = causalidad.
172. No perfecta, pero útil.
173. No prometo exactitud forense.
174. Prometo claridad.
175. Claridad > exhaustividad.
176. Me tienta agregar “P&L diario”.
177. No.
178. Me tienta agregar “benchmark”.
179. No.
180. Me tienta agregar “por activo”.
181. No.
182. El verbo es ver el total.
183. El total es el latido.
184. Los hitos son los golpes.
185. Si no puedo ver golpes, la pantalla falla.
186. Entonces debo detectar ingresos/egresos.
187. Uso cambios de cash y de net liquidation.
188. Si ambos saltan, es flujo de dinero.
189. Lo marco.
190. Si hay ejecución, es trade.
191. Lo marco.
192. Si coinciden, lo fusiono.
193. Un diamante.
194. Porque el usuario no necesita dos marcas.
195. Necesita una señal.
196. Cada pixel cuesta un millón.
197. Cada carácter cuesta un millón.
198. Dejo lo inevitable.
199. El eje x con tres marcas.
200. La línea principal.
201. La cinta de hitos.
202. Un footer mínimo.
203. Nada más.
204. Reviso: ¿hay algo que no sirva al verbo?
205. Si no sirve, fuera.
206. Reviso: ¿hay algo que el sistema pueda inferir?
207. El período por defecto: “sesión”.
208. No pido elección inicial.
209. Pero permito zoom con flechas.
210. Porque es natural.
211. Reviso interrupción: si el usuario vuelve, entiende.
212. Porque no hay estado complejo.
213. Reviso abuelo: teclas simples.
214. Reviso niño: ve una línea que sube y baja.
215. Y ve marcas cuando algo pasó.
216. Eso basta.
217. Reviso silencio: sin texto, igual se entiende.
218. Línea + marcas + tiempo.
219. El usuario no está “usando una herramienta”.
220. Está mirando un organismo.
221. Un organismo financiero.
222. La interfaz desaparece.
223. Queda el pulso.
224. El pulso es la esencia.
225. Lo demás es decoración.
226. Elimino decoración.
227. Elijo tipografía terminal: monospace.
228. Perfecto: todo es alineación.
229. Alineación = calma.
230. Calma = confianza.
231. Confianza = uso diario.
232. Uso diario = valor real.
233. Si el usuario abre esto cada mañana, gané.
234. Si lo abre solo una vez, fallé.
235. Entonces la pantalla debe ser adictivamente clara.
236. No adictiva por color.
237. Adictiva por verdad.
238. Verdad es continuidad.
239. Continuidad es historia acumulada.
240. Historia acumulada es tiempo.
241. Tiempo es el eje.
242. Eje es estructura.
243. Estructura es inevitabilidad.
244. Ahora lo implemento sin traicionar.
245. Sin agregar extras.
246. Sin “settings”.
247. Sin “export”.
248. Sin “tabs”.
249. Una pantalla.
250. Un gráfico.
251. Una cinta de hitos.
252. Un retorno.
253. Nada más.
254. Lo reviso otra vez.
255. ¿Puedo eliminar el header?
256. Si lo elimino, ¿se entiende qué es?
257. El breadcrumb ya lo dice.
258. Entonces el header puede ser solo número.
259. Sí: número y flecha.
260. Ese es el único texto que gana.
261. Porque es el “estado”.
262. Estado sin historia no sirve.
263. Historia sin estado tampoco.
264. Juntos: claridad.
265. No agrego leyenda de hitos.
266. La forma lo explica.
267. Pero doy una pista mínima: ▲ ▼ •.
268. En el footer.
269. Es suficiente.
270. Si necesito más, es que el diseño no es obvio.
271. Lo hago obvio.
272. El usuario mira.
273. El usuario entiende.
274. El usuario respira.
275. La app se vuelve invisible.
276. Invisible es perfecto.
277. Perfecto es inevitable.
278. Inevitable es “siempre debió existir”.
279. La pantalla está lista.
280. No porque sea completa.
281. Sino porque es esencial.
282. Es el mínimo que cierra el círculo.
283. Inicio → Actividad → Reporte.
284. Tres miradas.
285. Total, eventos, detalle.
286. Pero este archivo solo defiende una.
287. La mirada total.
288. La mirada que calma.
289. La mirada que explica sin hablar.
290. La mirada que respira.
291. El portafolio no es un número.
292. Es una historia.
293. La historia es una línea.
294. La línea tiene marcas.
295. Las marcas son decisiones.
296. Las decisiones dejan cicatriz.
297. La cicatriz da sentido.
298. El sentido da control.
299. El control da paz.
300. Pantalla inevitable.

---

## PASO 3: LA OBVIEDAD (EL DISEÑO FINAL)

### La Esencia
**Un pulso.** (El latido del portafolio en el tiempo.)

### El Momento Cero
Una línea grande (valor total) y marcas pequeñas (eventos), con el tiempo leyendo de izquierda a derecha. En 2 segundos se entiende: “esto es mi portafolio viviendo”.

### El Flujo Inevitable
Inicio → tecla única (`g`) → Reporte → `Esc` para volver. Sin bifurcaciones.

### La Magia Oculta
- Se acumula el historial automáticamente mientras estás conectado.
- Se actualiza a ritmo humano (auto‑refresh suave).
- Detecta y marca ingresos/egresos por saltos de cash + net liquidation.
- Marca compras/ventas usando ejecuciones existentes.

### El Micro‑Momento de Deleite
Cuando aparece un ▲ o ▼ exactamente alineado con el cambio: el sistema no “explica”, pero el usuario siente “ah, fue eso”.

---

## PASO 4: LA PRUEBA DEL FUEGO

□ TEST DEL NIÑO: La forma (sube/baja) + marcas (▲▼) se entiende sin leer.  
□ TEST DEL ABUELO: Una tecla para entrar, Escape para salir, flechas para zoom.  
□ TEST DE LA INTERRUPCIÓN: Volver no pierde contexto; es una pantalla de lectura.  
□ TEST DEL SILENCIO: Funciona con casi nada de texto (solo números/forma).  
□ TEST DE LA INEVITABILIDAD: Total+tiempo+marcas no admite “otra” pantalla más simple.
