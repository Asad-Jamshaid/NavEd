/**
 * Component Tests for SearchBar
 * Tests search functionality and accessibility
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchBar from '../../src/components/common/SearchBar';
import * as Haptics from 'expo-haptics';

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder="Search locations..."
        />
      );

      expect(getByPlaceholderText('Search locations...')).toBeTruthy();
    });

    test('should render with default placeholder when none provided', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value="" onChangeText={() => {}} />
      );

      expect(getByPlaceholderText('Search...')).toBeTruthy();
    });

    test('should display current value', () => {
      const { getByDisplayValue } = render(
        <SearchBar value="test query" onChangeText={() => {}} />
      );

      expect(getByDisplayValue('test query')).toBeTruthy();
    });

    test('should show clear button when value is not empty', () => {
      const { getByLabelText } = render(
        <SearchBar value="search text" onChangeText={() => {}} />
      );

      expect(getByLabelText('Clear search')).toBeTruthy();
    });

    test('should not show clear button when value is empty', () => {
      const { queryByLabelText } = render(
        <SearchBar value="" onChangeText={() => {}} />
      );

      expect(queryByLabelText('Clear search')).toBeNull();
    });
  });

  describe('Interactions', () => {
    test('should call onChangeText when typing', () => {
      const onChangeTextMock = jest.fn();
      const { getByRole } = render(
        <SearchBar value="" onChangeText={onChangeTextMock} />
      );

      fireEvent.changeText(getByRole('search'), 'new search');

      expect(onChangeTextMock).toHaveBeenCalledWith('new search');
    });

    test('should clear text and trigger haptic when clear button pressed', async () => {
      const onChangeTextMock = jest.fn();
      const onClearMock = jest.fn();
      const { getByLabelText } = render(
        <SearchBar
          value="search text"
          onChangeText={onChangeTextMock}
          onClear={onClearMock}
        />
      );

      fireEvent.press(getByLabelText('Clear search'));

      await waitFor(() => {
        expect(onChangeTextMock).toHaveBeenCalledWith('');
        expect(onClearMock).toHaveBeenCalled();
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    test('should call onSubmit when search is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByRole } = render(
        <SearchBar value="query" onChangeText={() => {}} onSubmit={onSubmitMock} />
      );

      fireEvent(getByRole('search'), 'submitEditing');

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have search role', () => {
      const { getByRole } = render(
        <SearchBar value="" onChangeText={() => {}} />
      );

      expect(getByRole('search')).toBeTruthy();
    });

    test('should have accessibilityLabel', () => {
      const { getByLabelText } = render(
        <SearchBar value="" onChangeText={() => {}} />
      );

      expect(getByLabelText('Search input')).toBeTruthy();
    });

    test('clear button should have proper accessibility', () => {
      const { getByLabelText, getByA11yHint } = render(
        <SearchBar value="text" onChangeText={() => {}} />
      );

      expect(getByLabelText('Clear search')).toBeTruthy();
      expect(getByA11yHint('Clears the search text')).toBeTruthy();
    });
  });

  describe('High Contrast Mode', () => {
    test('should apply high contrast styles', () => {
      const { getByRole } = render(
        <SearchBar
          value=""
          onChangeText={() => {}}
          highContrast={true}
        />
      );

      expect(getByRole('search')).toBeTruthy();
    });
  });

  describe('Focus State', () => {
    test('should handle focus and blur events', () => {
      const { getByRole } = render(
        <SearchBar value="" onChangeText={() => {}} />
      );

      const input = getByRole('search');

      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      // Should not throw
      expect(input).toBeTruthy();
    });
  });
});
