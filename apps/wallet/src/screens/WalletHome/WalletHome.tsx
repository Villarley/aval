// Pantalla: WalletHome | Responsable: Adrian | Issue: #TBD
// TODO: pulir tarjetas de credencial y estados vacios
// TODO: estados de carga y error al listar credenciales
// TODO: mejorar accesibilidad de la lista (roles, navegacion por teclado)

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { WalletCredential } from '@mi-billetera/shared';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import StatusPill from '../../components/StatusPill';
import { getHolderId } from '../../session';
import styles from './WalletHome.module.css';

export default function WalletHome() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<WalletCredential[]>([]);
  const [holderName, setHolderName] = useState('');

  useEffect(() => {
    const holderId = getHolderId();
    if (!holderId) {
      navigate('/');
      return;
    }

    api.listHolderCredentials(holderId).then((response) => {
      setCredentials(response.credentials);
      setHolderName(response.holder.displayName);
    });
  }, [navigate]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <InfraBadge infra="acta" />
        <h1 className={styles.title}>Mi billetera</h1>
        {holderName ? (
          <p className={styles.subtitle}>Hola, {holderName}</p>
        ) : null}
        <p className={styles.lead}>
          Credenciales verificadas con ACTA. Toca una para ver el detalle.
        </p>
      </header>

      <ul className={styles.list}>
        {credentials.map((item) => {
          const credentialId = item.credential.proof?.credentialId ?? item.credential.id;
          const achievement = String(
            item.credential.credentialSubject.achievement ?? 'Credencial',
          );

          return (
            <li key={credentialId}>
              <Link
                className={styles.card}
                to={`/billetera/${credentialId}`}
              >
                <span className={styles.cardTitle}>{achievement}</span>
                <span className={styles.cardMeta}>{item.issuerName}</span>
                <StatusPill status={item.status} />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
