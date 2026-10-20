---
name: subir-cambios
description: Sube los cambios de la calculadora a GitHub (commit y push) poniendo al principio del mensaje la inicial de quien los sube, por ejemplo "[P] Añade la tecla C". Úsala siempre que el usuario pida subir cambios, guardarlos en Git, hacer commit, hacer push o compartirlos con el equipo.
---

# Subir cambios

Cada cambio que se sube lleva al principio del mensaje la inicial de quien lo sube, entre corchetes.

## Pasos

1. **Comprobar el repositorio.** `git remote -v` tiene que apuntar a `https://github.com/hispafox/calculadora-sobremesa.git`. Si apunta a otro sitio, para y avisa.
2. **Traer lo último.** Ejecuta `git fetch origin` y `git status -sb`. Si en GitHub hay cambios que aquí no están, tráelos con `git pull --ff-only` antes de seguir. Si no se pueden traer sin mezclar (los dos lados tienen cambios distintos), para y explícalo sin tecnicismos.
3. **Pasar las comprobaciones.** Ejecuta `node --test`. Si alguna falla, no subas nada y cuenta qué falla.
4. **Sacar la inicial.** Es la primera letra de `git config user.name`, en mayúscula: "Pedro Hernandez" da `P` y "Julia Rial" da `J`. Si `user.name` está vacío, pregunta el nombre antes de seguir. No lo inventes.
5. **Revisar qué se sube.** Mira `git status --short` y `git diff`. Añade solo los archivos del cambio, nombrándolos uno a uno (nada de `git add -A` ni `git add .`).
6. **Escribir el mensaje.** La primera línea es `[INICIAL] Resumen`: en español, en presente y con menos de 72 caracteres en total. Si hace falta, añade una línea en blanco y un párrafo corto que explique el porqué.
   - Bien: `[P] Añade el número de versión en la carcasa`
   - Mal: `Añade el número de versión` (falta la inicial), `[Pedro] ...` (va el nombre entero), `P: ...` (el formato es otro)
7. **Subir.** Haz `git commit` y después `git push origin main`.
8. **Confirmar.** `git status -sb` tiene que mostrar `## main...origin/main`, sin "ahead". Cuenta al usuario con palabras sencillas qué se ha subido y con qué mensaje.
