jest.mock('./config/flags', () => ({
  skipFirebase: true,
  demoUserId: 'demo',
  useCentralVerificationInbox: false,
  extraInstitutionalEmailDomains: [],
}));

import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('preview mode shows main home shell', async () => {
  render(<App />);
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { level: 1, name: /^home$/i })
    ).toBeInTheDocument();
  });
});
