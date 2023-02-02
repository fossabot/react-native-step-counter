import { TurboModule, TurboModuleRegistry } from 'react-native';
import { Platform } from 'react-native';

export const LINKING_ERROR =
  `The package 'react-native-walking-tracker' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({
    ios: '- You have run `pod install` in the `ios` directory and then clean, rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.\n',
    android:
      '- You have the Android development environment set up: `https://reactnative.dev/docs/environment-setup.`',
    default: '',
  }) +
  `- Use the "npx react-native clean" command to clean up the module's cache and select the "watchman", "yarn", "metro", "android", "npm" options with comma-separated. Re-Install packages and re-build the app again .` +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n' +
  'If none of these fix the issue, please open an issue on the Github repository: https://github.com/AndrewDongminYoo/react-native-step-counter`';

export type StepCountData = {
  steps: number;
};

export interface Spec extends TurboModule {
  getConstants(): {
    platform: string; // 'ios'|'android'
  };
  isStepCountingSupported(): boolean;
  isWritingStepsSupported(): boolean;
  startStepCounterUpdate(from: number): Promise<StepCountData>;
  stopStepCounterUpdate(): void;
  queryStepCounterDataBetweenDates(
    startDate: number, // new Date()
    endDate: number
  ): Promise<StepCountData[]>;
  requestPermission(): Promise<PermissionStatus>;
  checkPermission(): PermissionStatus;
}

const RESULTS = Object.freeze({
  UNAVAILABLE: 'unavailable', // no-support device
  BLOCKED: 'blocked', // never_ask_again in Android
  DENIED: 'denied', // disallowed
  GRANTED: 'granted', // allowed
  LIMITED: 'limited', // partial permission allowed
} as const);
type Values<T extends object> = T[keyof T];
type PermissionStatus = Values<typeof RESULTS>;

const StepCounterModule = TurboModuleRegistry.getEnforcing<Spec>('StepCounter');

export default StepCounterModule;
