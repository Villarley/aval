# Plan de proyecto: Mi Billetera (Entregable 3)

**Curso:** IC-4810 Administración de Proyectos  
**Profesor:** Mauricio Arroyo  
**Proyecto:** Identidad Digital Descentralizada  
**Equipo:** Santiago Villarreal, Adrián Mora, Luis Diego Richmond, Fabián Sánchez

## Objetivo

Entregar un prototipo interactivo de billetera digital y una prueba de concepto técnica que demuestre emisión, almacenamiento, compartición y verificación de credenciales académicas verificables sobre Stellar testnet, con evidencia de gestión de proyecto lista para Auditoría 4 (aprox. semana 12, 19 oct 2025) y cierre en Auditoría 5 (aprox. semana 15, 13 nov 2025).

## EDT y responsables

| ID | Entregable | Descripción | Responsable principal |
|----|------------|-------------|------------------------|
| 3.1 | Requerimientos de la wallet | Alcance funcional, rutas, contrato compartido, criterios de aceptación | Santiago Villarreal (contrato); equipo (validación) |
| 3.2 | Prototipo interactivo | Mock-up horizontal: onboarding, billetera, detalle, compartir QR, verificador, emisor demo | Adrián Mora (onboarding + inicio); Luis Diego Richmond (detalle + compartir); Fabián Sánchez (verificador + emisor) |
| 3.3 | Prueba de concepto técnica | API NestJS, `CredentialProvider`, emisión/verificación/anclaje/revocación en Stellar testnet; intento adaptador ACTA | Santiago Villarreal |
| 3.4 | Validación y demo | Pruebas end-to-end, guion de demo, evidencias de auditoría | Fabián Sánchez (E2E + demo); equipo (revisión) |

Responsables intercambiables por acuerdo del equipo.

## Cronograma

Semanas estimadas desde el acta de constitución (27 ago 2025 = semana 4 del curso).

| Sprint | Semana del curso | Fechas | Objetivo | Entregables clave |
|--------|------------------|--------|----------|-------------------|
| S0 | 4 | 23-27 sep 2025 | Arranque | Repo, scaffold monorepo, contrato `packages/shared`, CI, tablero GitHub, primer PR pequeño por integrante |
| S1 | 5 | 28 sep - 4 oct 2025 | Backend + UI aislada | API con `StellarSpikeProvider`; pantallas wallet con mocks (`VITE_USE_MOCKS=true`) |
| S2 | 6 | 5-11 oct 2025 | Integración | Pantallas conectadas a API: emitir, billetera, compartir, verificar |
| S3 | 7 | 12-18 oct 2025 | Cierre PoC | Intento adaptador ACTA, pruebas, guion de demo; evidencia lista para **Auditoría 4** |
| Buffer | 8-11 | hasta ~13 nov 2025 | Estabilización | Ajustes, demo final, traspaso; **Auditoría 5** y cierre |

## Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Dependencia de ACTA (acceso a API) | Media | Alto | Spike `StellarSpikeProvider` operativo; interfaz `CredentialProvider` + selector `CREDENTIAL_PROVIDER`; ACTA como adaptador cuando haya acceso |
| Dependencia de Cavos (wallet embebida) | Alta | Bajo | Objetivo extendido; onboarding simula wallet; llaves en memoria del API (solo demo) |
| Caída de Stellar testnet o Friendbot | Media | Medio | Reintentos; `ISSUER_SECRET` con cuenta preconfigurada y fondeada; documentar estado en minutas |
| Curva de aprendizaje React / NestJS / Stellar | Media | Medio | Pair programming; tech lead en API; mocks en wallet para trabajo paralelo |
| Disponibilidad del equipo (otros cursos) | Alta | Medio | Sync semanal 15 min; issues con dueño y fecha; buffer S3-B |
| Cambios de contrato que rompen trabajo paralelo | Media | Alto | Contrato en `packages/shared`; cambios de contrato en PRs separados y anunciados en minuta |

## Mapeo a evidencias de auditoría

| Evidencia requerida | Artefacto en el repo | Ubicación |
|---------------------|----------------------|-----------|
| Gantt / seguimiento de avance | GitHub Project + milestones por sprint | GitHub (proyecto del equipo) |
| Aseguramiento y control de calidad | PR reviews + CI (lint, test, build) | `.github/workflows/`, historial de PRs |
| Minutas de reuniones | Sync semanal documentado | `docs/minutas/` (plantilla en `PLANTILLA.md`) |
| Verificación del alcance (EDT) | Issues etiquetados con ítem EDT (3.1-3.4) | GitHub Issues |
| Contribución individual | Commits y PRs por autor | Historial de Git |

## Limitaciones conocidas

- Forma simplificada `Ed25519Signature2020`; no cumple Data Integrity completo de W3C VC 2.0.
- Datos de holders y credenciales en memoria (sin persistencia).
- Solo Stellar testnet; no producción ni mainnet.
- Cavos y ACTA completos quedan como evolución posterior al spike.

## Referencias

- [Guion de demo](./demo.md)
- [ADR 0001: Monorepo](./decisions/0001-monorepo.md)
- [ADR 0002: CredentialProvider](./decisions/0002-credential-provider.md)
- [Plantilla de minutas](./minutas/PLANTILLA.md)
