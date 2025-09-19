import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import './i18n';
import { errorHandler } from "./utils/errorHandler";

ErrorUtils.setGlobalHandler((error) => {
  errorHandler({
    filePath: "index.js",
    functionName: "ErrorUtils.setGlobalHandler",
    error,
  });
});

LogBox.ignoreAllLogs();

AppRegistry.registerComponent('ConflictConnect', () => App);