import type { WalletCredential } from '@mi-billetera/shared';
import styles from './StatusPill.module.css';

type CredentialStatus = WalletCredential['status'];

interface StatusPillProps {
  status: CredentialStatus;
}

const LABELS: Record<CredentialStatus, string> = {
  valid: 'Verificada',
  revoked: 'Revocada',
  unknown: 'Sin verificar',
};

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`${styles.pill} ${styles[status]}`} data-status={status}>
      {LABELS[status]}
    </span>
  );
}
