// Pantalla: CredentialDetail | Responsable: Luis Diego | Issue: #TBD
// TODO: pulir layout del detalle y tipografia
// TODO: estados de carga, error y credencial no encontrada
// TODO: mejorar accesibilidad del acordeon de detalles tecnicos

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { WalletCredential } from '@mi-billetera/shared';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import StatusPill from '../../components/StatusPill';
import { getHolderId } from '../../session';
import styles from './CredentialDetail.module.css';

export default function CredentialDetail() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<WalletCredential | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const holderId = getHolderId();
    if (!holderId || !credentialId) {
      navigate('/billetera');
      return;
    }

    api.listHolderCredentials(holderId).then((response) => {
      const found = response.credentials.find(
        (credential) =>
          credential.credential.proof?.credentialId === credentialId,
      );
      setItem(found ?? null);
    });
  }, [credentialId, navigate]);

  if (!item) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Cargando credencial...</p>
      </main>
    );
  }

  const achievement = String(
    item.credential.credentialSubject.achievement ?? 'Credencial',
  );
  const description = String(
    item.credential.credentialSubject.description ?? '',
  );
  const issuedToName = String(
    item.credential.credentialSubject.issuedToName ?? '',
  );
  const issuedDate = new Date(item.credential.issuanceDate).toLocaleDateString(
    'es-MX',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/billetera">
          Volver
        </Link>
        <InfraBadge infra="acta" />
        <h1 className={styles.title}>{achievement}</h1>
        <StatusPill status={item.status} />
      </header>

      <section className={styles.section}>
        <dl className={styles.details}>
          <div>
            <dt>Emisor</dt>
            <dd>{item.issuerName}</dd>
          </div>
          <div>
            <dt>Titular</dt>
            <dd>{issuedToName}</dd>
          </div>
          <div>
            <dt>Fecha de emision</dt>
            <dd>{issuedDate}</dd>
          </div>
          {description ? (
            <div>
              <dt>Descripcion</dt>
              <dd>{description}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <div className={styles.actions}>
        <Link
          className={styles.shareButton}
          to={`/billetera/${credentialId}/compartir`}
        >
          Compartir
        </Link>
      </div>

      <details
        className={styles.techDetails}
        open={detailsOpen}
        onToggle={(event) =>
          setDetailsOpen((event.target as HTMLDetailsElement).open)
        }
      >
        <summary>Detalles tecnicos</summary>
        <dl className={styles.techList}>
          <div>
            <dt>DID del emisor</dt>
            <dd className={styles.mono}>{item.credential.issuer}</dd>
          </div>
          <div>
            <dt>DID del titular</dt>
            <dd className={styles.mono}>
              {String(item.credential.credentialSubject.id)}
            </dd>
          </div>
          <div>
            <dt>Firma</dt>
            <dd className={styles.mono}>
              {item.credential.proof?.type ?? 'Ed25519Signature2020'}
            </dd>
          </div>
          <div>
            <dt>Transaccion Stellar (manageData)</dt>
            <dd>
              <a
                href={item.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en explorador
              </a>
            </dd>
          </div>
        </dl>
      </details>
    </main>
  );
}
