import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

test('renders search input', () => {
  render(<App />);
  const searchInputElement = screen.getByText("Search");
  expect(searchInputElement).toBeInTheDocument();
});
