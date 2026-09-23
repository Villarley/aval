# Mi Billetera

Prototipo del Entregable 3 del proyecto **Identidad Digital Descentralizada** (IC-4810 Administración de Proyectos, TEC). Incluye un mock-up horizontal interactivo de la wallet y una prueba de concepto de emisión y verificación de credenciales verificables sobre Stellar testnet.

## Qué es

Mi Billetera es la capa de producto que permite a estudiantes y profesionales guardar, consultar y compartir credenciales académicas (por ejemplo, un curso aprobado en el TEC) con verificación criptográfica. El prototipo demuestra el flujo completo: un emisor crea la credencial, el usuario la recibe en su billetera, la comparte con un código QR y un verificador público confirma su validez.

**Limitaciones honestas del prototipo:** la prueba usa una forma simplificada (`Ed25519Signature2020`) que no cumple por completo Data Integrity de W3C; los datos viven en memoria; solo opera en Stellar testnet.

## Arquitectura

Monorepo npm workspaces con tres paquetes:

```
apps/wallet     React + Vite (interfaz móvil simulada)
apps/api        NestJS (emisión, verificación, anclaje on-chain)
packages/shared Contrato TypeScript compartido (tipos y DTOs)
```

### Flujo de datos

```
  [Emisor demo TEC]          [API NestJS]              [Stellar testnet]
        |                         |                           |
        |  POST /credentials      |  manageData (ancla)       |
        +------------------------>|-------------------------->|
        |                         |  firma Ed25519            |
        |                         |                           |
        |                    [Billetera React]                 |
        |                         |                           |
        |  GET credenciales       |                           |
        <-------------------------+                           |
        |  compartir QR           |                           |
        +---------------------------------------------------->|
        |                    [Verificador público]           |
        |  GET /verify/:token     |                           |
        +------------------------>|  consulta on-chain       |
                                  +-------------------------->|
```

El proveedor de credenciales activo se elige con la variable `CREDENTIAL_PROVIDER`:

- **`stellar-spike`** (actual): spike propio con `did:key`, hash SHA-256 de JSON canónico, firma Ed25519, anclaje vía `manageData`, revocación vía clave `revoked:<uuid>`.
- **`acta`** (futuro): integración con ACTA (`acta.build`, SCF #42, W3C VC 2.0, `did:pkh:stellar`) cuando haya acceso a su API.

Cavos (wallet embebida) es objetivo extendido; por ahora el onboarding simula la wallet y las llaves viven en memoria del API (solo demo).

## Requisitos

- **Node.js 22** (ver `.nvmrc`)
- npm 10+

```bash
nvm use   # o instalar Node 22 manualmente
```

## Cómo correr

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/wallet/.env.example apps/wallet/.env

# 3. Levantar API (puerto 3000)
npm run dev:api

# 4. Levantar wallet (puerto 5173, en otra terminal)
npm run dev:wallet

# 5. (Opcional) Script de demo end-to-end por consola
npm run demo -w @mi-billetera/api
```

La wallet funciona con mocks (`VITE_USE_MOCKS=true` en `apps/wallet/.env`) para que cualquier integrante pueda avanzar en la UI sin depender del API.

## Estructura de carpetas

```
mi-billetera/
├── apps/
│   ├── api/          Backend NestJS, providers de credenciales
│   └── wallet/       Frontend React, pantallas del mock-up
├── packages/
│   └── shared/       Tipos y contrato compartido
├── docs/
│   ├── PLAN.md       Cronograma, EDT, riesgos
│   ├── demo.md       Guion de demo para auditoría
│   ├── decisions/    ADRs (Architecture Decision Records)
│   └── minutas/      Minutas de sync semanal
├── .github/
│   ├── workflows/    CI
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── CONTRIBUTING.md
└── package.json
```

## Pantallas y responsables

| Pantalla | Ruta | Responsable (EDT 3.2) |
|----------|------|------------------------|
| Onboarding / creación de wallet | `/` | Adrián Mora Rivera |
| Mi billetera (inicio) | `/billetera` | Adrián Mora Rivera |
| Detalle de credencial | `/billetera/:credentialId` | Luis Diego Richmond Giraldo |
| Compartir con QR | `/billetera/:credentialId/compartir` | Luis Diego Richmond Giraldo |
| Verificador público | `/verificar/:token` | Fabián Sánchez |
| Emisor demo TEC | `/emisor` | Fabián Sánchez |

Responsables intercambiables por acuerdo del equipo.

## Equipo

| Integrante | Rol | GitHub |
|------------|-----|--------|
| Santiago Villarreal Arley | Tech lead, repo, CI, contrato, API, StellarSpikeProvider | Villarley |
| Adrián Mora Rivera | Onboarding + Inicio de billetera | TBD |
| Luis Diego Richmond Giraldo | Detalle + Compartir QR | TBD |
| Fabián Sánchez | Verificador + Emisor demo, prueba end-to-end | TBD |

## Documentación

- [CONTRIBUTING.md](./CONTRIBUTING.md): flujo de trabajo, PRs, checklist
- [docs/PLAN.md](./docs/PLAN.md): objetivo, EDT, cronograma, riesgos, evidencias de auditoría, limitaciones
- [docs/demo.md](./docs/demo.md): guion de demo de 5 minutos para auditoría
- [docs/decisions/0001-monorepo.md](./docs/decisions/0001-monorepo.md): ADR monorepo npm workspaces
- [docs/decisions/0002-credential-provider.md](./docs/decisions/0002-credential-provider.md): ADR interfaz CredentialProvider (spike Stellar vs ACTA)
- [docs/minutas/PLANTILLA.md](./docs/minutas/PLANTILLA.md): plantilla para minutas de sync semanal

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:api` | API en modo desarrollo |
| `npm run dev:wallet` | Wallet en modo desarrollo |
| `npm run lint` | Lint en todos los workspaces |
| `npm run test` | Tests en API y wallet |
| `npm run build` | Build de shared, API y wallet |
| `npm run ci` | Pipeline local equivalente al CI |
