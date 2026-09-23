import { Link } from 'react-router';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Pagina no encontrada</h1>
      <p className={styles.lead}>
        La ruta que buscas no existe en Mi Billetera.
      </p>
      <Link className={styles.link} to="/">
        Ir al inicio
      </Link>
    </main>
  );
}
