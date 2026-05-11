import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hero headline', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: /curiosity/i })
  ).toBeInTheDocument();
});

test('renders home link with brand', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /^Erudis$/i })).toBeInTheDocument();
});
