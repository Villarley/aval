// Pantalla: Onboarding | Responsable: Adrian | Issue: #TBD
// TODO: pulir diseno visual y animaciones de bienvenida
// TODO: estados de carga y error al crear la billetera
// TODO: mejorar accesibilidad (anuncios de estado, foco tras crear)

import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../api';
import InfraBadge from '../../components/InfraBadge';
import { setHolderId } from '../../session';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const holder = await api.createHolder({ displayName: displayName.trim() });
      setHolderId(holder.id);
      navigate('/billetera');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <InfraBadge infra="cavos" />
        <h1 className={styles.title}>Mi Billetera</h1>
        <p className={styles.lead}>
          Guarda tus credenciales academicas en un solo lugar. Cavos crea tu
          billetera en el dispositivo: sin frase semilla, sin pagar gas.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="displayName">
          Tu nombre
        </label>
        <input
          id="displayName"
          className={styles.input}
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Ej. Santiago Villarreal"
          autoComplete="name"
          required
        />
        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear mi billetera'}
        </button>
      </form>
    </main>
  );
}
