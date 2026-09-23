import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, beforeEach } from 'vitest';
import WalletHome from '../screens/WalletHome/WalletHome';
import { setHolderId } from '../session';

describe('WalletHome', () => {
  beforeEach(() => {
    setHolderId('holder-santiago-villarreal');
  });

  it('shows a credential title from the mock api', async () => {
    render(
      <MemoryRouter>
        <WalletHome />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Administracion de Proyectos')).toBeInTheDocument();
    });
  });
});
