// Mock SDK 55 winter runtime modules that aren't yet mocked by jest-expo
// This is needed until jest-expo is updated for SDK 55's new winter modules

jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {},
}));

jest.mock('@ungap/structured-clone', () => ({
  default: (value) => JSON.parse(JSON.stringify(value)),
}));
