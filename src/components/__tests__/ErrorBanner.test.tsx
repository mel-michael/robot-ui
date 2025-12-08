import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });
  it('renders error message', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Test error message" onDismiss={onDismiss} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Test error" onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss error');
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders error icon', () => {
    const onDismiss = vi.fn();
    const { container } = render(<ErrorBanner message="Test error" onDismiss={onDismiss} />);

    const errorIcon = container.querySelector('.error-icon');
    expect(errorIcon).toBeInTheDocument();
  });

  it('renders dismiss button with correct aria label', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Test error" onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss error');
    expect(dismissButton).toBeInTheDocument();
  });
});

