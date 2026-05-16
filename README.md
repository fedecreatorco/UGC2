# Ecomlabs UGC AI — Sistema de Producción v2.0

Generador de prompts UGC orgánicos hiper-realistas para Meta Ads, potenciado por Claude (Anthropic).

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Anthropic API** (claude-sonnet-4)

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# → Agrega tu ANTHROPIC_API_KEY en .env.local

# 3. Correr en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
app/
├── page.tsx                    # UI principal (4 pasos + resultados)
├── layout.tsx                  # Layout global
├── globals.css                 # Estilos base
└── api/
    └── generate-ugc/
        └── route.ts            # API route → Claude API
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic (console.anthropic.com) |

## Modelos soportados

| Herramienta | Duración por clip |
|---|---|
| VEo3 | 15s |
| Seedance 2.0 | 15s |
| Kling AI | 15s |
| HeyGen | 30s |

## Deploy (Vercel)

```bash
vercel --prod
```

Asegúrate de configurar `ANTHROPIC_API_KEY` en las variables de entorno de Vercel.

---

**Ecomlabs Studio** · Sistema de Producción de Contenido UGC
