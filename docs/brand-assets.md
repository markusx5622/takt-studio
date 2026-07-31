# Takt Studio Brand Assets

Esta guía define el uso correcto de cada variante del logotipo de Takt Studio dentro del proyecto. Todos los assets gráficos se encuentran en la carpeta `/public`.

## Sistema de SVG

### `/favicon.svg`
- **Uso:** Icono base de la app, naveador y metadatos principales.
- **Formato:** Cuadrado con bordes curvos, diseño 100% exacto al original.

### `/logo.svg`
- **Uso:** Logo corporativo accesible.
- **Formato:** Idéntico al favicon pero incluye `title` y `desc` para accesibilidad. Ideal para la raíz del README o documentación oficial.

### `/logo-mark.svg`
- **Uso:** Símbolo para UI (Header, Sidebar, Loaders, Empty States).
- **Formato:** Escalable, con etiquetas `aria-label`.

### `/logo-mark-transparent.svg`
- **Uso:** Fondos claros personalizados, PDFs, portadas o secciones donde el contenedor azul no sea adecuado.
- **Formato:** Variante del mark sin fondo azul, elementos adaptados para contrastar.

### `/logo-horizontal.svg`
- **Uso:** Landing, presentaciones, portada de documentación, informes ejecutivos.
- **Formato:** Icono + wordmark + tagline en colores corporativos.

### `/logo-horizontal-dark.svg`
- **Uso:** Hero sections oscuras, fondos navy, footers.
- **Formato:** Mismo diseño que el horizontal pero adaptado para máximo contraste sobre oscuros.

### `/logo-horizontal-light.svg`
- **Uso:** Header institucional, documentos completamente blancos.
- **Formato:** Sin tagline, diseño muy limpio.

### `/logo-horizontal-compact.svg`
- **Uso:** Navbar, Header principal, menú app, lugares con restricción vertical.
- **Formato:** Marca y texto más agrupados. Es la versión que usa el Header de Next.js actualmente.

### `/logo-monochrome.svg`
- **Uso:** Impresión, PDFs técnicos, contextos de máxima sobriedad.
- **Formato:** Solo usa el azul base (#2563EB).

### `/logo-white.svg`
- **Uso:** Marcas de agua, hero oscuro, pie de página en fondos oscuros.
- **Formato:** 100% blanco puro (con detalles contrastados internamente si aplica).

### `/maskable-icon.svg` y `/apple-touch-icon-source.svg`
- **Uso:** Fuentes estructurales para PWA. No se deben usar en la UI general, están pensadas para generar y servir `maskable-icon-512.png` y `apple-touch-icon.png` a los sistemas operativos móviles.

## Componente BrandLogo

El componente `BrandLogo` se encuentra en `components/BrandLogo.tsx`. Permite renderizar fácilmente cualquier variante del SVG utilizando la etiqueta nativa `<img>` con el objetivo de preservar la escalabilidad del vector.

### API de uso

\`\`\`tsx
import BrandLogo from "@/components/BrandLogo";

// Variante compacta por defecto (Navbar)
<BrandLogo variant="compact" className="h-8 w-auto" />

// Variante mark para UI interna o mobile
<BrandLogo variant="mark" className="h-8 w-8" />

// Variante para dark mode
<BrandLogo variant="horizontalDark" className="h-16 w-auto" />
\`\`\`
