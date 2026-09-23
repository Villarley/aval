// Pantalla: ShareCredential | Responsable: Luis Diego | Issue: #TBD
// TODO: pulir presentacion del QR y feedback al copiar enlace
// TODO: estados de carga y error al crear enlace de compartir
// TODO: mejorar accesibilidad del codigo QR y del contador

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import type { CreateShareResponse } from '@mi-billetera/shared';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import styles from './ShareCredential.module.css';

function formatRemainingTime(expiresAt: string): string {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 'El enlace expiro.';
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  return `El enlace expira en ${minutes} min ${seconds} s.`;
}

export default function ShareCredential() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [share, setShare] = useState<CreateShareResponse | null>(null);
  const [countdown, setCountdown] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!credentialId) {
      navigate('/billetera');
      return;
    }

    api.createShare({ credentialId }).then(setShare);
  }, [credentialId, navigate]);

  useEffect(() => {
    if (!share) {
      return;
    }

    const updateCountdown = () => {
      setCountdown(formatRemainingTime(share.expiresAt));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [share]);

  async function handleCopyLink() {
    if (!share) {
      return;
    }

    await navigator.clipboard.writeText(share.verifyUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!share) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Generando enlace...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to={`/billetera/${credentialId}`}>
          Volver
        </Link>
        <InfraBadge infra="acta" />
        <h1 className={styles.title}>Compartir credencial</h1>
        <p className={styles.lead}>
          Escanea el codigo QR o copia el enlace. Un tercero puede verificar
          sin crear cuenta.
        </p>
      </header>

      <div className={styles.qrWrapper}>
        <QRCodeSVG value={share.verifyUrl} size={200} />
      </div>

      <p className={styles.url}>{share.verifyUrl}</p>
      <p className={styles.countdown}>{countdown}</p>

      <button className={styles.copyButton} type="button" onClick={handleCopyLink}>
        {copied ? 'Enlace copiado' : 'Copiar enlace'}
      </button>
    </main>
  );
}
