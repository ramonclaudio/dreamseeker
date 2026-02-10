import { Switch, type SwitchProps } from 'react-native';

import { useColors } from '@/hooks/use-color-scheme';

type GlassSwitchProps = Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'>;

/**
 * GlassSwitch - Switch control styled for HIG compliance.
 *
 * HIG: "for controls in the content layer with a transient interactive element like
 * sliders and toggles; in these cases, the element takes on a Liquid Glass appearance
 * to emphasize its interactivity when a person activates it."
 *
 * On iOS 26+, the system Switch automatically adopts Liquid Glass during activation.
 * This component provides consistent theming across platforms.
 */
export function GlassSwitch({ value, onValueChange, disabled, ...props }: GlassSwitchProps) {
  const colors = useColors();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.muted, true: colors.primary }}
      ios_backgroundColor={colors.muted}
      {...props}
    />
  );
}
