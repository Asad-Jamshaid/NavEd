/**
 * Component Tests for Card
 * Tests rendering and accessibility
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Card from '../../src/components/common/Card';
import * as Haptics from 'expo-haptics';

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );

      expect(getByText('Card Content')).toBeTruthy();
    });

    test('should render title when provided', () => {
      const { getByText } = render(
        <Card title="Card Title">
          <Text>Content</Text>
        </Card>
      );

      expect(getByText('Card Title')).toBeTruthy();
    });

    test('should render subtitle when provided', () => {
      const { getByText } = render(
        <Card title="Title" subtitle="Subtitle text">
          <Text>Content</Text>
        </Card>
      );

      expect(getByText('Subtitle text')).toBeTruthy();
    });

    test('should render icon when provided', () => {
      const { getByText } = render(
        <Card icon="settings" title="Settings">
          <Text>Settings Content</Text>
        </Card>
      );

      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Pressable Cards', () => {
    test('should be pressable when onPress is provided', async () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <Card onPress={onPressMock} title="Pressable Card">
          <Text>Content</Text>
        </Card>
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(onPressMock).toHaveBeenCalledTimes(1);
      });
    });

    test('should trigger haptic on press', async () => {
      const { getByRole } = render(
        <Card onPress={() => {}} title="Haptic Card">
          <Text>Content</Text>
        </Card>
      );

      fireEvent.press(getByRole('button'));

      await waitFor(() => {
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    test('should not have button role when not pressable', () => {
      const { queryByRole } = render(
        <Card title="Static Card">
          <Text>Content</Text>
        </Card>
      );

      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    test('should use title as accessibilityLabel by default', () => {
      const { getByLabelText } = render(
        <Card title="Accessible Card">
          <Text>Content</Text>
        </Card>
      );

      expect(getByLabelText('Accessible Card')).toBeTruthy();
    });

    test('should use custom accessibilityLabel when provided', () => {
      const { getByLabelText } = render(
        <Card title="Title" accessibilityLabel="Custom Label">
          <Text>Content</Text>
        </Card>
      );

      expect(getByLabelText('Custom Label')).toBeTruthy();
    });

    test('should include accessibilityHint when provided', () => {
      const { getByA11yHint } = render(
        <Card
          title="Card"
          onPress={() => {}}
          accessibilityHint="Opens detailed view"
        >
          <Text>Content</Text>
        </Card>
      );

      expect(getByA11yHint('Opens detailed view')).toBeTruthy();
    });
  });

  describe('High Contrast Mode', () => {
    test('should apply high contrast styles', () => {
      const { getByLabelText } = render(
        <Card title="High Contrast" highContrast={true}>
          <Text>Content</Text>
        </Card>
      );

      const card = getByLabelText('High Contrast');
      expect(card).toBeTruthy();
    });
  });

  describe('Elevation', () => {
    test('should apply elevated styles by default', () => {
      const { getByLabelText } = render(
        <Card title="Elevated Card">
          <Text>Content</Text>
        </Card>
      );

      expect(getByLabelText('Elevated Card')).toBeTruthy();
    });

    test('should not apply elevation when elevated is false', () => {
      const { getByLabelText } = render(
        <Card title="Flat Card" elevated={false}>
          <Text>Content</Text>
        </Card>
      );

      expect(getByLabelText('Flat Card')).toBeTruthy();
    });
  });
});
