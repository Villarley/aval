import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusPill from '../components/StatusPill';

describe('StatusPill', () => {
  it('renders Spanish labels for each status', () => {
    const { rerender } = render(<StatusPill status="valid" />);
    expect(screen.getByText('Verificada')).toBeInTheDocument();

    rerender(<StatusPill status="revoked" />);
    expect(screen.getByText('Revocada')).toBeInTheDocument();

    rerender(<StatusPill status="unknown" />);
    expect(screen.getByText('Sin verificar')).toBeInTheDocument();
  });
});
