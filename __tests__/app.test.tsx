import { render } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text, View } from 'react-native';

// Example component for testing
function WelcomeMessage({ name }: { name: string }) {
  return (
    <View>
      <Text>Welcome, {name}!</Text>
    </View>
  );
}

describe('WelcomeMessage', () => {
  it('renders welcome text correctly', () => {
    const { getByText } = render(<WelcomeMessage name="Ray" />);

    getByText('Welcome, Ray!');
  });

  it('renders with different names', () => {
    const { getByText } = render(<WelcomeMessage name="Expo" />);

    getByText('Welcome, Expo!');
  });
});

// Snapshot test example
describe('Snapshot', () => {
  it('WelcomeMessage matches snapshot', () => {
    const tree = render(<WelcomeMessage name="Test" />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});

// Expo Router integration tests
describe('Router', () => {
  it('renders home screen at root', () => {
    renderRouter(
      {
        index: () => <Text>Home</Text>,
      },
      { initialUrl: '/' }
    );

    expect(screen).toHavePathname('/');
  });

  it('navigates to nested routes', () => {
    renderRouter(
      {
        index: () => <Text>Home</Text>,
        'settings/profile': () => <Text>Profile</Text>,
      },
      { initialUrl: '/settings/profile' }
    );

    expect(screen).toHavePathname('/settings/profile');
  });
});
