import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

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

describe('Snapshot', () => {
  it('WelcomeMessage matches snapshot', () => {
    const tree = render(<WelcomeMessage name="Test" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
