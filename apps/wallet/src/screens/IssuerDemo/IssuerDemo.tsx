// Pantalla: IssuerDemo | Responsable: Fabian | Issue: #TBD
// TODO: pulir formulario y presentacion del resultado
// TODO: estados de carga y error al emitir credencial
// TODO: mejorar accesibilidad del formulario

import { FormEvent, useState } from 'react';
import type { IssueCredentialResponse } from '@mi-billetera/shared';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import styles from './IssuerDemo.module.css';

export default function IssuerDemo() {
  const [holderId, setHolderId] = useState('holder-santiago-villarreal');
  const [achievement, setAchievement] = useState('');
  const [description, setDescription] = useState('');
  const [issuedToName, setIssuedToName] = useState('Santiago Villarreal');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IssueCredentialResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!achievement.trim() || !issuedToName.trim()) {
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await api.issueCredential({
        holderId,
        claims: {
          achievement: achievement.trim(),
          institution: 'TEC',
          issuedToName: issuedToName.trim(),
          description: description.trim() || undefined,
        },
      });
      setResult(response);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <InfraBadge infra="acta" />
        <h1 className={styles.title}>Emisor demo: TEC</h1>
        <p className={styles.lead}>
          Pantalla de demostracion para emitir credenciales academicas con ACTA.
          En produccion solo el emisor autorizado tendria acceso.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="holderId">
          ID del titular (holderId)
        </label>
        <input
          id="holderId"
          className={styles.input}
          type="text"
          value={holderId}
          onChange={(event) => setHolderId(event.target.value)}
          required
        />

        <label className={styles.label} htmlFor="achievement">
          Logro
        </label>
        <input
          id="achievement"
          className={styles.input}
          type="text"
          value={achievement}
          onChange={(event) => setAchievement(event.target.value)}
          placeholder="Ej. Administracion de Proyectos"
          required
        />

        <label className={styles.label} htmlFor="description">
          Descripcion
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Detalle opcional del logro"
        />

        <label className={styles.label} htmlFor="issuedToName">
          Nombre del titular
        </label>
        <input
          id="issuedToName"
          className={styles.input}
          type="text"
          value={issuedToName}
          onChange={(event) => setIssuedToName(event.target.value)}
          required
        />

        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? 'Emitiendo...' : 'Emitir credencial'}
        </button>
      </form>

      {result ? (
        <section className={styles.result}>
          <h2 className={styles.resultTitle}>Credencial emitida</h2>
          <p>
            ID:{' '}
            <code>{result.credential.proof?.credentialId ?? result.credential.id}</code>
          </p>
          <p>
            Logro:{' '}
            <strong>
              {String(result.credential.credentialSubject.achievement)}
            </strong>
          </p>
          <p>
            <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer">
              Ver transaccion en explorador Stellar
            </a>
          </p>
        </section>
      ) : null}
    </main>
  );
}
