/// <reference types="@types/jest" />

// Expo Router testing library matchers
// https://docs.expo.dev/router/reference/testing/
declare namespace jest {
  interface Matchers<R> {
    toHavePathname(pathname: string): R;
    toHavePathnameWithParams(pathnameWithParams: string): R;
    toHaveSegments(segments: string[]): R;
    toHaveRouterState(state: object): R;
  }
}
