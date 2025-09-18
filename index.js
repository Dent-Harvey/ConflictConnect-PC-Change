import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import './i18n';
import { LogBox } from 'react-native';
import { errorHandler } from "./utils/errorHandler";

ErrorUtils.setGlobalHandler((error) => {
  errorHandler({
    filePath: "index.js",
    functionName: "ErrorUtils.setGlobalHandler",
    error,
  });
});

LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);