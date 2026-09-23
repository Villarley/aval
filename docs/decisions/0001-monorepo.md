# ADR 0001: Monorepo con npm workspaces

## Estado

Aceptado (2025-09)

## Contexto

El Entregable 3 incluye frontend (wallet React), backend (API NestJS) y un contrato TypeScript compartido (tipos, DTOs, rutas). Varios integrantes trabajan en paralelo en pantallas distintas mientras el tech lead avanza la API y el proveedor Stellar.

Se evaluaron dos repositorios separados (wallet + api) versus un monorepo.

## Decisión

Usar un **monorepo npm workspaces** con tres paquetes:

- `apps/wallet`: React + Vite (interfaz móvil simulada)
- `apps/api`: NestJS (emisión, verificación, anclaje on-chain)
- `packages/shared`: contrato tipado compartido

Un solo pipeline de CI ejecuta lint, test y build en los tres paquetes. Los cambios en `packages/shared` rompen el build de wallet y API de inmediato, forzando alineación del contrato.

## Consecuencias

**Positivas**

- Un cambio de contrato se detecta en CI antes de merge.
- Un clone, un `npm install`, scripts unificados (`dev:api`, `dev:wallet`, `ci`).
- Issues y PRs referencian el mismo historial y el mismo tablero.

**Negativas**

- Repo más grande; curva inicial de workspaces para integrantes nuevos en monorepos.
- Despliegues futuros requieren decidir qué app publicar en cada entorno (no bloquea el entregable académico).

**Alternativa rechazada:** dos repos implicaría publicar `@mi-billetera/shared` como paquete npm o duplicar tipos, con riesgo de desincronización durante sprints cortos.
