import styles from './InfraBadge.module.css';

export type InfraType = 'cavos' | 'acta';

interface InfraBadgeProps {
  infra: InfraType;
}

const LABELS: Record<InfraType, string> = {
  cavos: 'Cavos: billetera y firma',
  acta: 'ACTA: credencial y verificacion',
};

export default function InfraBadge({ infra }: InfraBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[infra]}`} data-infra={infra}>
      {LABELS[infra]}
    </span>
  );
}
