import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileSettingsPage from './ProfileSettingsPage';
import { renderWithI18n } from '../test/testUtils.jsx';

const refreshProfileMock = vi.fn();
const getProfileMock = vi.fn();
const updateProfileMock = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/profileService', () => ({
  getProfile: (...args) => getProfileMock(...args),
  updateProfile: (...args) => updateProfileMock(...args),
}));

const deleteAccountMock = vi.fn();

vi.mock('../services/authService', () => ({
  deleteAccount: (...args) => deleteAccountMock(...args),
}));

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

import { useAuth } from '../hooks/useAuth';

const user = {
  id: 'user-1',
  email: 'ada@example.com',
  user_metadata: { full_name: 'Ada Lovelace' },
};

function renderPage() {
  return renderWithI18n(
    <MemoryRouter>
      <ProfileSettingsPage />
    </MemoryRouter>
  );
}

describe('ProfileSettingsPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user,
      refreshProfile: refreshProfileMock,
      isAuthenticated: true,
      isLoading: false,
      isConfigured: true,
      profile: null,
      session: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });
    refreshProfileMock.mockReset();
    getProfileMock.mockReset();
    updateProfileMock.mockReset();
    deleteAccountMock.mockReset();
  });

  it('renders Settings heading and tab bar with Profile active', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    expect(screen.getByRole('tab', { name: /notifications/i })).toBeDisabled();
    expect(
      screen.getByRole('tab', { name: /connected accounts/i })
    ).toBeDisabled();
  });

  it('prefills display name from profile row', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Saved Name',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toHaveValue('Saved Name');
    });
  });

  it('prefills display name from metadata when profile name is null', async () => {
    getProfileMock.mockResolvedValue({
      display_name: null,
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toHaveValue(
        'Ada Lovelace'
      );
    });
  });

  it('saves profile changes and shows success state', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });
    updateProfileMock.mockResolvedValue({
      display_name: 'Ada Lovelace',
      avatar_url: null,
      avatar_preference: 'generated',
      plan: 'free',
      email: 'ada@example.com',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /profile picture/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledTimes(2);
      expect(updateProfileMock).toHaveBeenNthCalledWith(1, 'user-1', {
        avatarPreference: 'generated',
      });
      expect(updateProfileMock).toHaveBeenNthCalledWith(2, 'user-1', {
        displayName: 'Ada Lovelace',
        avatarPreference: 'generated',
      });
      expect(refreshProfileMock).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
    });
  });

  it('shows error toast when save fails', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });
    updateProfileMock.mockRejectedValue(new Error('save failed'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/could not save your profile/i)
      ).toBeInTheDocument();
    });
  });

  it('Escape key dismisses delete modal', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('deletes account after typing email confirmation via modal', async () => {
    getProfileMock.mockResolvedValue({
      display_name: 'Ada',
      avatar_url: null,
      avatar_preference: 'google',
      plan: 'free',
      email: 'ada@example.com',
    });
    deleteAccountMock.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    const triggerButton = screen.getByRole('button', {
      name: /delete account/i,
    });
    fireEvent.click(triggerButton);

    const dialog = await screen.findByRole('dialog');

    const confirmInput = within(dialog).getByLabelText(
      /type your email to confirm/i
    );
    fireEvent.change(confirmInput, { target: { value: 'ada@example.com' } });

    const deleteButton = within(dialog).getByRole('button', {
      name: /delete account/i,
    });
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteAccountMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/account has been deleted/i)).toBeInTheDocument();
    });
  });
});
