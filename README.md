# Dije que sí

Landing page con scroll narrativo que sirve de fondo visual para una charla con estudiantes de bachillerato y de primer semestre. Cuenta cómo pasar de no saber programar a construir proyectos que usan miles de personas.

## Qué es

Una página de scroll narrativo con capítulos animados. No tiene backend: todo el contenido vive en `src/content.ts`.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, GSAP ScrollTrigger y Lenis.

## Requisitos

- Node.js 20 o superior (probado en Node 24).
- npm.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

Para probar la versión de producción:

```bash
npm run build
npm start
```

## Presentar la charla

| Acción | Teclas |
|---|---|
| Siguiente parada | → / ↓ / Espacio / PageDown |
| Parada anterior | ← / ↑ / Shift + Espacio / PageUp |
| Primera parada | Inicio (Home) |
| Última parada | Fin (End) |
| Pantalla completa | F |

Cada capítulo tiene dos paradas: el inicio del capítulo y el final de su animación. Así, cada pulsación reproduce una animación completa.

**Consejo:** proyecta en 1920×1080, usa el navegador en pantalla completa (F) y deja el zoom al 100%.

## Desplegar en Vercel

**Opción A: desde GitHub**

1. Sube el proyecto a un repositorio de GitHub.
2. Entra a [vercel.com/new](https://vercel.com/new) e importa el repositorio.
3. Vercel detecta Next.js automáticamente. No necesitas variables de entorno.

**Opción B: desde la terminal**

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # producción
```

## Cambiar textos

Todo el texto vive en `src/content.ts`. Cambia los valores sin tocar los componentes.

Las secciones exportadas son `site`, `hero`, `idea`, `chapter1` a `chapter6`, `closing` y `navItems`. `navItems` define el índice de capítulos y se genera solo a partir de las demás secciones.

### Bloques de texto (`blocks`)

Los capítulos usan un arreglo `blocks`. El orden del arreglo es el orden en pantalla.

- `type: "p"`: párrafo normal.
- `type: "quote"`: cita destacada en cursiva.

```ts
blocks: [
  { type: "quote", text: "Texto destacado." },
  { type: "p", text: "Párrafo normal." },
] as Block[],
```

### Capítulo 2: burbujas

- `others`: lo que sabían otros. Cada elemento es una burbuja grande.
- `mine`: texto inicial de tu burbuja pequeña.
- `mineGrown`: texto de la burbuja cuando crece.

### Capítulo 3: editor

- `code`: arreglo de líneas que se "escriben" en el editor. Cada elemento es una línea.

### Capítulo 4: hitos y contador

- `milestones`: lista de hitos, cada uno con `label` y `note`.
- `stat`: contador con `value` (número), `suffix` y `label`.

### Textos alternativos

`sceneAlt` describe cada escena para lectores de pantalla. Actualízalo si cambias el contenido visual de una escena.

## Cambiar la captura de Saldo

1. Copia la imagen en `public/`, por ejemplo `public/saldo.png`. Tamaño sugerido: vertical, cerca de 1179×2556 px.
2. En `src/content.ts`, dentro de `chapter5.app`, define la ruta:

```ts
screenshot: "/saldo.png",
```

Mientras `screenshot` sea `null`, se muestra un placeholder marcado.

## Colores y tipografías

- **Colores:** tokens en `:root` dentro de `src/app/globals.css`: `--bg`, `--surface`, `--accent`, `--ink` y `--muted`.
- **Tipografías:** se cargan en `src/app/layout.tsx`: Bricolage Grotesque (títulos), Instrument Serif (citas), Geist (texto) y Geist Mono (etiquetas).

## Accesibilidad y movimiento

- Respeta `prefers-reduced-motion`: las escenas pasan a su estado final con desvanecimientos suaves y se desactiva el scroll suave.
- Usa secciones semánticas, navegación por teclado y un índice de capítulos (barra lateral en escritorio y contador en móvil).
- Cada escena tiene texto alternativo (`sceneAlt`).
- Incluye un enlace "Saltar al contenido" al inicio de la página.

## Estructura

```
src/
├── app/
│   ├── layout.tsx          Fuentes, metadatos e idioma (es)
│   ├── page.tsx            Orden de las secciones
│   └── globals.css         Tokens de color y estilos
├── components/
│   ├── chapters/           Capítulos (Chapter4, Chapter5, ...)
│   ├── scenes/             Escenas reutilizables (Phone, Timeline)
│   ├── ChapterLayout.tsx   Diseño común de los capítulos
│   ├── Experience.tsx      Scroll suave, teclado, progreso e índice
│   ├── Hero.tsx            Portada
│   ├── WordReveal.tsx      Texto que se revela palabra por palabra
│   └── Final.tsx           Cierre
├── lib/
│   ├── motion.ts           Utilidades de GSAP, Lenis y paradas de scroll
│   └── useScene.ts         Hook que conecta la animación con cada escena
└── content.ts              Todos los textos
public/                     Imágenes, por ejemplo saldo.png
```
