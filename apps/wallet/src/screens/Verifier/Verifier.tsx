// Pantalla: Verifier | Responsable: Fabian | Issue: #TBD
// TODO: pulir presentacion del resultado valido/invalido
// TODO: estados de carga, error y enlace expirado
// TODO: mejorar accesibilidad de las comprobaciones

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { GetShareResponse } from '@mi-billetera/shared';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import styles from './Verifier.module.css';

interface CheckItem {
  key: keyof GetShareResponse['verification']['checks'];
  label: string;
}

const CHECKS: CheckItem[] = [
  { key: 'signature', label: 'Firma del emisor valida' },
  { key: 'anchor', label: 'Registro en Stellar confirmado' },
  { key: 'notRevoked', label: 'Credencial no revocada' },
];

export default function Verifier() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<GetShareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Enlace de verificacion invalido.');
      return;
    }

    api
      .getShare(token)
      .then(setResult)
      .catch(() => {
        setError('No se pudo verificar esta credencial.');
      });
  }, [token]);

  if (error) {
    return (
      <main className={styles.page}>
        <div className={`${styles.result} ${styles.invalid}`}>
          <h1>Credencial no valida</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Verificando credencial...</p>
      </main>
    );
  }

  const achievement = String(
    result.credential.credentialSubject.achievement ?? 'Credencial',
  );
  const issuedToName = String(
    result.credential.credentialSubject.issuedToName ?? '',
  );
  const isValid = result.verification.valid;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <InfraBadge infra="acta" />
        <h1 className={styles.title}>Verificacion de credencial</h1>
      </header>

      <div
        className={`${styles.result} ${isValid ? styles.valid : styles.invalid}`}
      >
        <p className={styles.resultLabel}>
          {isValid ? 'Credencial valida' : 'Credencial no valida'}
        </p>
        <h2 className={styles.achievement}>{achievement}</h2>
        <p className={styles.meta}>
          Emitida por {result.issuerName} para {issuedToName}
        </p>
      </div>

      <section className={styles.checks}>
        <h3 className={styles.checksTitle}>Comprobaciones</h3>
        <ul className={styles.checkList}>
          {CHECKS.map((check) => {
            const passed = result.verification.checks[check.key];
            return (
              <li
                key={check.key}
                className={passed ? styles.checkPass : styles.checkFail}
              >
                {passed ? 'Si' : 'No'}: {check.label}
              </li>
            );
          })}
        </ul>
        {result.verification.reason ? (
          <p className={styles.reason}>{result.verification.reason}</p>
        ) : null}
      </section>
    </main>
  );
}
