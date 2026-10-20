# Calculadora de sobremesa

Calculadora web que imita una calculadora de sobremesa clásica, tanto en el aspecto como en el comportamiento. Solo suma y resta.

## Cómo comunicarte conmigo

- No soy técnico. Explícame todo lo que tenga que ver con el proyecto con palabras sencillas, sin tecnicismos ni conceptos complejos.
- Si un término técnico es inevitable, explícalo en una frase con un ejemplo cotidiano.
- Cuéntame qué cambia para mí (qué veo, qué hago, qué pasa), no cómo está hecho por dentro.
- Si te digo o te doy a entender que no entiendo algo, vuelve a explicármelo de otra forma, más sencilla y sin tecnicismos. No repitas la misma explicación.

## Alcance

- Operaciones: suma (`+`) y resta (`−`). Nada más.
- Teclas: `0`–`9`, `.`, `+`, `−`, `=`, `C` (borra todo) y `CE` (borra el número que se está tecleando).
- Teclado del ordenador: `0`–`9`, `+`, `-`, `.` o `,` (punto decimal), `Enter` o `=` (resultado), `Escape` (C), `Retroceso` o `Supr` (CE). El botón de pantalla se hunde un momento al pulsar su tecla. Los atajos con Ctrl, Alt o Cmd no se tocan.
- Historial: un botón con un reloj en la cabecera abre una lista con las últimas operaciones terminadas (como mucho 20, la más reciente primero), por ejemplo `5 + 3 − 2 = 6`. Solo se apuntan las cuentas cerradas con `=` que tenían una suma o una resta. `C` y `E` no lo borran; se pierde al cerrar la página.
- Fuera de alcance: multiplicar, dividir, porcentaje, memoria (M+, M−), raíz, cambio de signo. No añadir nada de esto sin pedírmelo.

## Stack

- HTML, CSS y JavaScript sin frameworks, sin dependencias y sin paso de build.
- Sin `package.json`. Los tests usan solo el test runner integrado de Node (`node:test` y `node:assert`).
- La página tiene que funcionar se abra donde se abra: con doble clic desde el disco (`file://`) o en la vista previa de la app de Claude (que la carga como `data:` y no puede leer archivos vecinos). Por eso `index.html` es autosuficiente: nada de `<script src>`, hojas de estilo externas ni `<script type="module">`.

## Estructura

```
index.html            La calculadora completa: maquetación, estilos y dos bloques de script
calculadora.test.js   Tests de la lógica
```

Dentro de `index.html` hay dos bloques `<script>` separados:

- `<script id="logica">`: estado y operaciones. Sin acceso al DOM. Expone `crearEstado()`, `pulsar(estado, tecla)` y `traducirTecla(teclaDelOrdenador)`.
- El bloque siguiente conecta los botones y el teclado del ordenador con la lógica y pinta la pantalla. No hace cálculos.

`calculadora.test.js` lee `index.html`, extrae el bloque `<script id="logica">` y lo ejecuta con `node:vm`. Si se cambia el `id` o se divide el bloque, hay que ajustar el test.

## Comportamiento (como una calculadora de sobremesa)

- Pantalla de 8 dígitos. Al encender o tras `C` muestra `0`.
- Cálculo encadenado de izquierda a derecha: `5 + 3 − 2 =` da `6`. Al pulsar un operador se muestra el resultado parcial.
- Pulsar dos operadores seguidos se queda con el último: `5 + − 3 =` da `2`.
- Después de `=`, teclear un dígito empieza un cálculo nuevo; pulsar un operador sigue operando sobre el resultado.
- Un solo punto decimal por número. Teclear `.` al empezar un número muestra `0.`.
- Los errores de coma flotante no llegan a la pantalla: `0.1 + 0.2 =` muestra `0.3`. Se quitan los ceros sobrantes a la derecha.
- Los resultados negativos se muestran con `-` delante.
- Si un resultado no cabe en 8 dígitos, la pantalla muestra `E` y solo responde a `C`.

## Estilo visual

- Carcasa de plástico gris o beige con esquinas redondeadas y una sombra suave.
- Pantalla LCD: fondo verde grisáceo, dígitos oscuros alineados a la derecha, fuente monoespaciada.
- Teclas con relieve que se hunden al pulsarlas. `C` y `CE` en un color distinto; `=` destacada.
- Detalles decorativos opcionales: placa solar falsa y una marca genérica. Nunca una marca real.
- Número de versión (`v1.0`) en letra pequeña y poco contraste, abajo a la derecha de la carcasa. Solo se cambia cuando yo lo pida.
- Todo el CSS va en `index.html`. Sin fuentes ni recursos externos.

## Tests

- Cada cambio en la lógica lleva sus tests en `calculadora.test.js`.
- Se ejecutan con:

```bash
node --test
```

- Los tests cubren como mínimo: suma, resta, encadenado, operadores seguidos, decimales (`0.1 + 0.2`), resultados negativos, desbordamiento (`E`), `C`, `CE`, el historial y la traducción de las teclas del ordenador.

## Subir cambios

- Repositorio: https://github.com/hispafox/calculadora-sobremesa (público, rama `main`).
- Para subir cambios se usa siempre la skill `subir-cambios` (`.claude/skills/subir-cambios/SKILL.md`): el mensaje empieza por la inicial de quien sube, por ejemplo `[P] Añade la tecla C`.

## Convenciones

- Identificadores, comentarios y textos de la interfaz en español.
- Funciones pequeñas y legibles. Sin clases ni abstracciones que no hagan falta.
- El bloque de lógica no toca el DOM; el bloque de los botones no hace cálculos.

## Pendiente

- En el navegador integrado de VS Code, `Esc`, `Retroceso` y `Supr` no llegan a la calculadora. En el visor de la app de Claude sí funcionan. Falta probarlo en Chrome o Edge. Causa probable: VS Code se queda en algunas situaciones con las teclas especiales (Esc, Retroceso, Supr, Enter, flechas) y solo deja pasar letras, números y símbolos.
- Propuesta a la espera de respuesta: que la tecla `C` del teclado haga lo mismo que el botón C (borrar todo), porque VS Code siempre deja pasar las letras.
