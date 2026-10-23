const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// La lógica vive dentro de index.html, en el bloque <script id="logica">. La leemos de ahí.
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const logica = html.match(/<script id="logica">([\s\S]*?)<\/script>/)[1];
const contexto = {};
vm.runInNewContext(logica, contexto);
const { crearEstado, pulsar, traducirTecla, elegirIdioma } = contexto;
// Las constantes (const) no quedan colgadas del contexto como las funciones: hay que pedirlas.
const TEXTOS = vm.runInContext("TEXTOS", contexto);

// Pulsa las teclas de la secuencia una a una y devuelve lo que muestra la pantalla.
// Ejemplo: teclear("5+3=") pulsa 5, +, 3 y =.
function teclear(secuencia) {
  const teclas = secuencia.match(/CE|C|[0-9]|\.|\+|-|=/g);
  return teclas.reduce(pulsar, crearEstado()).pantalla;
}

test("la calculadora muestra su número de versión", () => {
  assert.match(html, /<div class="version">v1\.0<\/div>/);
});

test("al encender muestra 0", () => {
  assert.strictEqual(crearEstado().pantalla, "0");
});

test("suma", () => {
  assert.strictEqual(teclear("5+3="), "8");
  assert.strictEqual(teclear("125+75="), "200");
});

test("resta", () => {
  assert.strictEqual(teclear("9-4="), "5");
});

test("cálculo encadenado de izquierda a derecha", () => {
  assert.strictEqual(teclear("5+3-2="), "6");
});

test("al pulsar un operador muestra el resultado parcial", () => {
  assert.strictEqual(teclear("5+3-"), "8");
});

test("dos operadores seguidos: vale el último", () => {
  assert.strictEqual(teclear("5+-3="), "2");
});

test("después de =, un dígito empieza un cálculo nuevo", () => {
  assert.strictEqual(teclear("5+3=7"), "7");
  assert.strictEqual(teclear("5+3=7+1="), "8");
});

test("después de =, un operador sigue sobre el resultado", () => {
  assert.strictEqual(teclear("5+3=+2="), "10");
});

test("sin ceros a la izquierda", () => {
  assert.strictEqual(teclear("007"), "7");
});

test("como mucho 8 cifras al teclear", () => {
  assert.strictEqual(teclear("123456789"), "12345678");
});

test("decimales", () => {
  assert.strictEqual(teclear("2.5+0.25="), "2.75");
});

test("los errores de coma flotante no llegan a la pantalla", () => {
  assert.strictEqual(teclear("0.1+0.2="), "0.3");
});

test("se quitan los ceros sobrantes a la derecha", () => {
  assert.strictEqual(teclear("1.50+1.50="), "3");
});

test("un decimal que no cabe se redondea a 8 cifras", () => {
  assert.strictEqual(teclear("1234567.5+0.25="), "1234567.8");
});

test("el punto al empezar un número muestra 0.", () => {
  assert.strictEqual(teclear("."), "0.");
  assert.strictEqual(teclear("5+.5="), "5.5");
});

test("un solo punto por número", () => {
  assert.strictEqual(teclear("1..5"), "1.5");
});

test("resultados negativos", () => {
  assert.strictEqual(teclear("3-5="), "-2");
  assert.strictEqual(teclear("3-5-2="), "-4");
});

test("si el resultado no cabe en 8 cifras muestra E", () => {
  assert.strictEqual(teclear("99999999+1="), "E");
  assert.strictEqual(teclear("99999999+0.6="), "E");
  assert.strictEqual(teclear("0-99999999-1="), "E");
});

test("con E en pantalla solo responde a C", () => {
  assert.strictEqual(teclear("99999999+1=5+.=CE"), "E");
  assert.strictEqual(teclear("99999999+1=C"), "0");
  assert.strictEqual(teclear("99999999+1=C2+2="), "4");
});

test("C borra todo", () => {
  assert.strictEqual(teclear("5+3C"), "0");
  assert.strictEqual(teclear("5+3C2="), "2");
});

test("CE borra solo el número que se está tecleando", () => {
  assert.strictEqual(teclear("5+3CE"), "0");
  assert.strictEqual(teclear("5+3CE4="), "9");
});

// Pulsa las teclas de la secuencia una a una y devuelve el historial.
// Array.from lo copia a una lista normal: la que crea vm no se compara bien con deepStrictEqual.
function historialTras(secuencia) {
  const teclas = secuencia.match(/CE|C|[0-9]|\.|\+|-|=/g);
  return Array.from(teclas.reduce(pulsar, crearEstado()).historial);
}

test("al encender el historial está vacío", () => {
  assert.strictEqual(crearEstado().historial.length, 0);
});

test("el historial apunta cada operación terminada con =", () => {
  assert.deepStrictEqual(historialTras("5+3="), ["5 + 3 = 8"]);
  assert.deepStrictEqual(historialTras("5+3-2="), ["5 + 3 − 2 = 6"]);
});

test("el historial pone la operación más reciente primero", () => {
  assert.deepStrictEqual(historialTras("5+3=9-4="), ["9 − 4 = 5", "5 + 3 = 8"]);
});

test("el historial sigue sobre el resultado anterior", () => {
  assert.deepStrictEqual(historialTras("5+3=+2="), ["8 + 2 = 10", "5 + 3 = 8"]);
});

test("el historial: dos operadores seguidos apuntan el último", () => {
  assert.deepStrictEqual(historialTras("5+-3="), ["5 − 3 = 2"]);
});

test("el historial: decimales y negativos", () => {
  assert.deepStrictEqual(historialTras("0.1+0.2="), ["0.1 + 0.2 = 0.3"]);
  assert.deepStrictEqual(historialTras("3-5="), ["3 − 5 = -2"]);
  assert.deepStrictEqual(historialTras("3.+1="), ["3 + 1 = 4"]);
});

test("el historial no apunta = sin operación ni cuentas a medias", () => {
  assert.deepStrictEqual(historialTras("5="), []);
  assert.deepStrictEqual(historialTras("5+3"), []);
  assert.deepStrictEqual(historialTras("5+3=="), ["5 + 3 = 8"]);
});

test("el historial apunta el número que queda tras CE", () => {
  assert.deepStrictEqual(historialTras("5+3CE4="), ["5 + 4 = 9"]);
});

test("C y E no borran el historial", () => {
  assert.deepStrictEqual(historialTras("5+3=C"), ["5 + 3 = 8"]);
  assert.deepStrictEqual(historialTras("5+3=99999999+1="), ["5 + 3 = 8"]);
  assert.deepStrictEqual(historialTras("5+3=C1+1="), ["1 + 1 = 2", "5 + 3 = 8"]);
});

test("el historial guarda como mucho 20 operaciones", () => {
  const historial = historialTras("1+1=".repeat(25));
  assert.strictEqual(historial.length, 20);
});

test("teclado del ordenador: números, suma y resta", () => {
  assert.strictEqual(traducirTecla("0"), "0");
  assert.strictEqual(traducirTecla("7"), "7");
  assert.strictEqual(traducirTecla("+"), "+");
  assert.strictEqual(traducirTecla("-"), "-");
});

test("teclado del ordenador: el punto y la coma son el punto decimal", () => {
  assert.strictEqual(traducirTecla("."), ".");
  assert.strictEqual(traducirTecla(","), ".");
});

test("teclado del ordenador: Enter y = dan el resultado", () => {
  assert.strictEqual(traducirTecla("Enter"), "=");
  assert.strictEqual(traducirTecla("="), "=");
});

test("teclado del ordenador: Escape es C; Retroceso y Supr son CE", () => {
  assert.strictEqual(traducirTecla("Escape"), "C");
  assert.strictEqual(traducirTecla("Backspace"), "CE");
  assert.strictEqual(traducirTecla("Delete"), "CE");
});

test("teclado del ordenador: las demás teclas no hacen nada", () => {
  for (const tecla of ["*", "/", "a", "C", "Shift", "Tab", " ", "F1"]) {
    assert.strictEqual(traducirTecla(tecla), null, `la tecla "${tecla}" debería ignorarse`);
  }
});

test("teclado del ordenador: una cuenta completa", () => {
  const teclas = ["1", "2", ",", "5", "+", "3", "Enter"];
  const estado = teclas.map(traducirTecla).reduce(pulsar, crearEstado());
  assert.strictEqual(estado.pantalla, "15.5");
});

test("idiomas: español, inglés, francés y portugués", () => {
  assert.deepStrictEqual(Object.keys(TEXTOS).sort(), ["en", "es", "fr", "pt"]);
});

test("idiomas: todos tienen las mismas frases que el español y ninguna vacía", () => {
  const frases = Object.keys(TEXTOS.es).sort();
  for (const idioma of Object.keys(TEXTOS)) {
    assert.deepStrictEqual(Object.keys(TEXTOS[idioma]).sort(), frases, `al idioma "${idioma}" le faltan o le sobran frases`);
    for (const frase of frases) {
      assert.notStrictEqual(TEXTOS[idioma][frase].trim(), "", `la frase "${frase}" está vacía en "${idioma}"`);
    }
  }
});

test("idiomas: cada texto que se traduce en la página tiene su frase", () => {
  const usadas = [...html.matchAll(/data-(?:texto|etiqueta|titulo)="([^"]+)"/g)].map((encontrado) => encontrado[1]);
  assert.ok(usadas.length > 0);
  for (const frase of usadas) {
    assert.ok(Object.hasOwn(TEXTOS.es, frase), `la página usa "${frase}", que no está en los textos`);
  }
});

test("idioma inicial: el del navegador, si es uno de los cuatro", () => {
  assert.strictEqual(elegirIdioma(null, "es-ES"), "es");
  assert.strictEqual(elegirIdioma(null, "en-US"), "en");
  assert.strictEqual(elegirIdioma(null, "fr-FR"), "fr");
  assert.strictEqual(elegirIdioma(null, "pt-BR"), "pt");
  assert.strictEqual(elegirIdioma(null, "pt"), "pt");
});

test("idioma inicial: con cualquier otro idioma, o sin idioma, español", () => {
  assert.strictEqual(elegirIdioma(null, "de-DE"), "es");
  assert.strictEqual(elegirIdioma(null, ""), "es");
  assert.strictEqual(elegirIdioma(null, undefined), "es");
});

test("idioma inicial: manda el guardado; uno guardado que no existe se ignora", () => {
  assert.strictEqual(elegirIdioma("fr", "en-US"), "fr");
  assert.strictEqual(elegirIdioma("es", "pt-BR"), "es");
  assert.strictEqual(elegirIdioma("de", "pt-BR"), "pt");
  assert.strictEqual(elegirIdioma("toString", "en-US"), "en");
});
