import 'expo-router/entry';
import './i18n';
import { LogBox } from 'react-native';

// Configure LogBox to hide warnings during development
if (__DEV__) {
  LogBox.ignoreAllLogs(false); // Set to false to see important logs
  LogBox.ignoreLogs([
    'Warning: AsyncStorage has been extracted from react-native',
    'Remote debugger',
    'VirtualizedLists should never be nested',
    'Possible unhandled promise rejection',
    'Non-serializable values were found in the navigation state'
  ]);
}