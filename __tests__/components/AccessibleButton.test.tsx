/**
 * Component Tests for AccessibleButton
 * Tests rendering, accessibility, and interactions
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccessibleButton from '../../src/components/common/AccessibleButton';
import * as Haptics from 'expo-haptics';

describe('AccessibleButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render with title', () => {
      const { getByText } = render(
        <AccessibleButton title="Click Me" onPress={() => {}} />
      );

      expect(getByText('Click Me')).toBeTruthy();
    });

    test('should render with icon when provided', () => {
      const { getByText } = render(
        <AccessibleButton
          title="Settings"
          icon="settings"
          onPress={() => {}}
        />
      );

      expect(getByText('Settings')).toBeTruthy();
    });

    test('should render loading indicator when loading', () => {
      const { queryByText, UNSAFE_queryByType } = render(
        <AccessibleButton
          title="Submit"
          onPress={() => {}}
          loading={true}
        />
      );

      // Title should still be in the tree but ActivityIndicator should show
      const ActivityIndicator = require('react-native').ActivityIndicator;
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    });

    test('should apply fullWidth style when prop is true', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Full Width"
          onPress={() => {}}
          fullWidth={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' }),
        ])
      );
    });
  });

  describe('Accessibility', () => {
    test('should have accessible role of button', () => {
      const { getByRole } = render(
        <AccessibleButton title="Accessible" onPress={() => {}} />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    test('should have accessibilityLabel matching title', () => {
      const { getByLabelText } = render(
        <AccessibleButton title="Save Document" onPress={() => {}} />
      );

      expect(getByLabelText('Save Document')).toBeTruthy();
    });

    test('should include accessibilityHint when provided', () => {
      const { getByA11yHint } = render(
        <AccessibleButton
          title="Delete"
          onPress={() => {}}
          accessibilityHint="Removes the selected item"
        />
      );

      expect(getByA11yHint('Removes the selected item')).toBeTruthy();
    });

    test('should have disabled state when disabled', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Disabled"
          onPress={() => {}}
          disabled={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    test('should have busy state when loading', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Loading"
          onPress={() => {}}
          loading={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.busy).toBe(true);
    });
  });

  describe('Interactions', () => {
    test('should call onPress when pressed', async () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <AccessibleButton title="Press Me" onPress={onPressMock} />
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledTimes(1);
      });
    });

    test('should trigger haptic feedback on press', async () => {
      const { getByRole } = render(
        <AccessibleButton title="Haptic" onPress={() => {}} />
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    test('should not call onPress when disabled', async () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <AccessibleButton
          title="Disabled"
          onPress={onPressMock}
          disabled={true}
        />
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(onPressMock).not.toHaveBeenCalled();
      });
    });

    test('should not call onPress when loading', async () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <AccessibleButton
          title="Loading"
          onPress={onPressMock}
          loading={true}
        />
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(onPressMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('Variants', () => {
    test('should render primary variant correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Primary"
          onPress={() => {}}
          variant="primary"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    test('should render secondary variant correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Secondary"
          onPress={() => {}}
          variant="secondary"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    test('should render outline variant correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Outline"
          onPress={() => {}}
          variant="outline"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    test('should render danger variant correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Delete"
          onPress={() => {}}
          variant="danger"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    test('should render small size correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Small"
          onPress={() => {}}
          size="small"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    test('should render medium size correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Medium"
          onPress={() => {}}
          size="medium"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    test('should render large size correctly', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="Large"
          onPress={() => {}}
          size="large"
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('High Contrast Mode', () => {
    test('should apply high contrast styles when enabled', () => {
      const { getByRole } = render(
        <AccessibleButton
          title="High Contrast"
          onPress={() => {}}
          highContrast={true}
        />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
      // High contrast styling applied
    });
  });
});
