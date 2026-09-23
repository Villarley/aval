# Guion de demo (5 minutos)

Demo de auditoría para **Mi Billetera**: flujo completo emisión, billetera, compartir, verificar, revocar y evidencia on-chain.

**Duración objetivo:** 5 minutos  
**Audiencia:** Prof. Mauricio Arroyo / auditoría Entregable 3

## Preparación (antes de la presentación)

```bash
cd mi-billetera
npm install

cp apps/api/.env.example apps/api/.env
cp apps/wallet/.env.example apps/wallet/.env
```

En `apps/wallet/.env`:

```
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3000
```

En `apps/api/.env` (recomendado para demo estable):

```
CREDENTIAL_PROVIDER=stellar-spike
ISSUER_SECRET=<cuenta emisora ya fondeada en testnet>
```

Levantar en dos terminales:

```bash
npm run dev:api    # http://localhost:3000
npm run dev:wallet # http://localhost:5173
```

Verificar que Friendbot responde (cuenta emisora con saldo).

## Guión paso a paso

| Min | Acción | Qué decir / qué mostrar |
|-----|--------|-------------------------|
| 0:00 | Abrir `http://localhost:5173/emisor` | "Emisor demo TEC: simula que la institución emite una credencial académica." |
| 0:30 | Completar formulario y emitir credencial | Mostrar confirmación y hash de anclaje. "La API firma con Ed25519 y ancla el hash en Stellar testnet vía manageData." |
| 1:00 | Ir a `http://localhost:5173/` (onboarding) si hace falta crear holder; luego `/billetera` | "El estudiante ve la credencial recién emitida en su billetera." |
| 1:30 | Abrir detalle `/billetera/:credentialId` | Mostrar claims, emisor, estado válido, enlace a explorer. |
| 2:00 | Ir a `/billetera/:credentialId/compartir` | "Comparte con QR o enlace; el verificador no necesita la wallet." |
| 2:30 | Copiar URL del verificador (`/verificar/:token`) y abrirla en **otra ventana** | Estado: **válida** (firma + anclaje + no revocada). |
| 3:00 | Revocar vía API (terminal) | Ver sección curl abajo. "Simula que el TEC revoca la credencial; se escribe revoked:\<uuid\> on-chain." |
| 3:30 | Recargar `/verificar/:token` en la segunda ventana | Estado: **revocada** o inválida. |
| 4:00 | Abrir transacciones en [stellar.expert](https://stellar.expert/explorer/testnet) | Mostrar tx de anclaje (issue) y tx de revocación. |
| 4:30 | Mencionar limitaciones | Forma simplificada Ed25519Signature2020, datos en memoria, solo testnet. |
| 5:00 | Cierre | Enlace a `docs/PLAN.md`, ADRs y CI en GitHub. |

## Revocación con curl

Obtener el `credentialId` desde el detalle en la wallet o desde la respuesta de emisión (campo `id` de la credencial, formato `urn:uuid:...`).

```bash
curl -s -X POST http://localhost:3000/credentials/revoke \
  -H 'Content-Type: application/json' \
  -d '{"credentialId":"urn:uuid:REEMPLAZAR-CON-UUID-REAL"}' | jq
```

Respuesta esperada:

```json
{
  "revocationTxHash": "...",
  "explorerUrl": "https://stellar.expert/explorer/testnet/tx/..."
}
```

## Rutas de la wallet (referencia)

| Pantalla | Ruta |
|----------|------|
| Onboarding | `/` |
| Mi billetera | `/billetera` |
| Detalle | `/billetera/:credentialId` |
| Compartir QR | `/billetera/:credentialId/compartir` |
| Verificador | `/verificar/:token` |
| Emisor demo TEC | `/emisor` |

## Plan B

Si la UI falla en vivo:

```bash
npm run demo -w @mi-billetera/api
```

El script de consola ejecuta el mismo flujo: emitir, verificar válida, revocar, verificar revocada, con URLs de explorer.

## Checklist pre-auditoría

- [ ] `VITE_USE_MOCKS=false` en wallet
- [ ] API y wallet corriendo sin errores en consola
- [ ] Cuenta emisora fondeada (`ISSUER_SECRET` configurado)
- [ ] Credencial de prueba emitida al menos una vez
- [ ] Segunda ventana del verificador probada
- [ ] curl de revocación probado
- [ ] Enlaces stellar.expert abren correctamente
