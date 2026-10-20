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
const { crearEstado, pulsar, traducirTecla } = contexto;

// Pulsa las teclas de la secuencia una a una y devuelve lo que muestra la pantalla.
// Ejemplo: teclear("5+3=") pulsa 5, +, 3 y =.
function teclear(secuencia) {
  const teclas = secuencia.match(/CE|C|[0-9]|\.|\+|-|=/g);
  return teclas.reduce(pulsar, crearEstado()).pantalla;
}

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
