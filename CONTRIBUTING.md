# Contribuir a Mi Billetera

Guia de flujo de trabajo para el equipo del Entregable 3 (IC-4810, TEC).

## Primer setup

1. Aceptar la invitacion al repositorio en GitHub.
2. Clonar el repo:

```bash
git clone https://github.com/Villarley/mi-billetera.git
cd mi-billetera
```

3. Usar Node 22 (definido en `.nvmrc`):

```bash
nvm use
```

4. Instalar dependencias:

```bash
npm install
```

5. Copiar variables de entorno:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/wallet/.env.example apps/wallet/.env
```

## Flujo de trabajo

### 1. Tomar un issue

- Revisar issues abiertos y asignarte uno (o pedir asignacion en el issue).
- Confirma el codigo EDT y los criterios de aceptacion antes de empezar.

### 2. Actualizar main y crear rama

```bash
git switch main
git pull
git switch -c feat/<numero-issue>-descripcion-corta
```

Prefijos de rama segun tipo de cambio:

| Prefijo | Uso |
|---------|-----|
| `feat/` | Nueva funcionalidad |
| `fix/` | Correccion de bug |
| `docs/` | Documentacion |
| `test/` | Tests |
| `chore/` | Mantenimiento, deps, CI |

Ejemplo: `feat/12-lista-credenciales`

### 3. Desarrollar y commitear

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(wallet): agrega lista de credenciales"
```

Alcances validos: `wallet`, `api`, `shared`, `docs`, `ci`.

**Regla academica del curso:** no incluir trailers de atribucion a IA en los commits (por ejemplo, `Co-authored-by: Cursor` o similares).

### 4. Push y pull request

```bash
git push -u origin feat/<numero-issue>-descripcion-corta
```

Abrir PR hacia `main` con `Closes #<numero>` en la descripcion.

## Reglas del repositorio

- PR hacia `main` con al menos **1 aprobacion** de otro integrante y **CI en verde**.
- Merge con **squash merge**.
- **Prohibido** push directo a `main`.
- **Nunca** subir `.env` ni `ISSUER_SECRET` (ni en commits, ni en PRs, ni en issues).
- Cambios al contrato compartido: editar `packages/shared` primero, en un **PR propio**, y avisar al equipo porque afecta API y wallet.

## Checklist antes de abrir PR

Ejecutar en la raiz del monorepo:

```bash
npm run lint
npm test
npm run build
```

O el equivalente completo:

```bash
npm run ci
```

## Revisiones de codigo

- Responder comentarios de review en **menos de 48 horas**.
- Comentar con respeto y de forma concreta (que cambiar, por que, sugerencia si aplica).

## Equipo

| Integrante | Rol |
|------------|-----|
| Santiago Villarreal Arley | Tech lead, repo, CI |
| Adrian Mora | Onboarding + Inicio de billetera |
| Luis Diego Richmond | Detalle + Compartir QR |
| Fabian Sanchez | Verificador + Emisor demo |
