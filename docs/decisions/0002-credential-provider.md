# ADR 0002: Interfaz CredentialProvider (spike Stellar vs ACTA)

## Estado

Aceptado (2025-09)

## Contexto

El acta de constitución del proyecto asume **ACTA** (`acta.build`, financiado por Stellar Community Fund #42) como capa de credenciales verificables W3C VC 2.0 con `did:pkh:stellar`. Al inicio del Entregable 3 aún no hay acceso garantizado a la API de ACTA.

Se necesita demostrar emisión, verificación, anclaje on-chain y revocación antes de Auditoría 4, sin bloquear el desarrollo de la wallet.

## Decisión

Definir una interfaz **`CredentialProvider`** en la API con tres operaciones: `issue`, `verify`, `revoke`, más `issuerDid()`.

Implementaciones:

| Provider | Variable `CREDENTIAL_PROVIDER` | Estado |
|----------|-------------------------------|--------|
| `StellarSpikeProvider` | `stellar-spike` (default) | Operativo |
| `ActaProvider` | `acta` | Stub; activar cuando exista acceso a API ACTA |

**Spike actual (`stellar-spike`):**

- Emisor con `did:key` derivado de clave Ed25519 Stellar
- Hash SHA-256 de JSON canónico de la credencial
- Firma Ed25519 sobre el hash
- Anclaje on-chain vía `manageData` en cuenta emisora
- Revocación vía clave `revoked:<uuid>` en la misma cuenta

**ACTA (planificado):** integración con API oficial, VC 2.0 completo, `did:pkh:stellar`; mismo contrato expuesto al frontend vía `packages/shared`.

Cavos (wallet embebida) queda como objetivo extendido; el onboarding actual simula la wallet y las llaves viven en memoria del API (solo demo).

## Consecuencias

**Positivas**

- La wallet y el emisor demo no dependen del backend concreto; solo del contrato HTTP y tipos compartidos.
- El spike entrega evidencia técnica verificable en testnet sin esperar ACTA.
- Cambiar a ACTA es configuración + adaptador, no reescritura del frontend.

**Negativas**

- El spike usa forma simplificada (`Ed25519Signature2020`), no Data Integrity completo W3C.
- Mantener dos providers implica tests y documentación duplicada parcial.
- Riesgo de percepción de "doble implementación"; mitigado documentando este ADR y el plan de migración.

**Plan de migración:** cuando ACTA esté disponible, implementar `ActaProvider`, validar paridad E2E con el guion de demo, y evaluar deprecar el spike o mantenerlo como fallback de desarrollo local.
