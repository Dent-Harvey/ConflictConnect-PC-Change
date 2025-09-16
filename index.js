import 'expo-router/entry';
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

LogBox.ignoreAllLogs()