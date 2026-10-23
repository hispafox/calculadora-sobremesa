# Calculadora de sobremesa

Calculadora web que imita una calculadora de sobremesa clásica. Solo suma y resta.

## Cómo usarla

Abre `index.html` con doble clic y se verá en el navegador. No hace falta instalar nada.

Funciona con el ratón y con el teclado del ordenador: números, `+`, `-`, coma o punto, `Enter` para el resultado, `Esc` o la letra `C` para borrar todo y `Retroceso` o `Supr` para borrar el número que estás escribiendo.

Está en español, inglés, francés y portugués. Sale en el idioma de tu navegador (o en español, si es otro) y se cambia con `ES · EN · FR · PT`, en la cabecera. Recuerda el que elijas para la próxima vez.

El manual de uso está en [`docs/manual-calculadora.pdf`](docs/manual-calculadora.pdf).

## Comprobaciones automáticas

Necesitan [Node.js](https://nodejs.org) (probadas con la versión 22). Desde la carpeta del proyecto:

```bash
node --test
```

## Seguir trabajando con Claude Code

Abre esta carpeta con Claude Code. Las instrucciones del proyecto están en `CLAUDE.md`, y las tareas pendientes, en las [issues de GitHub](https://github.com/hispafox/calculadora-sobremesa/issues).
