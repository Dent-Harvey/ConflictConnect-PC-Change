import { NativeModules, Platform } from "react-native";

const expoSandboxModuleMock = {
  sendMessage: (msg: { [key: string]: any }) => {
    console.warn("ExpoSandboxModule is not available on web.");
  },
};

// Load the native module from JSI
export const ExpoSandboxModuleNative = (() => {
  try {
    if (Platform.OS === "web") {
      return expoSandboxModuleMock;
    }

    // Try to access the module directly from NativeModules
    const nativeModule = NativeModules.ExpoSandboxModule;
    if (nativeModule) {
      return nativeModule;
    }

    return expoSandboxModuleMock;
  } catch (error) {
    console.error("[ExpoSandboxModuleNative] Failed to load:", error);
    return expoSandboxModuleMock;
  }
})();


const { ErrorBridgeModule } = NativeModules;

// Utility function to send errors to host app
export function errorHandler({
  filePath,
  functionName,
  error,
}: {
  filePath: string;
  functionName: string;
  error: Error;
}) {
  const enrichedErrorMessage = `Error in file ${filePath} in function ${functionName}: ${error.message}`;
  const message = {
    type: "error",
    data: {
      message: enrichedErrorMessage,
      stack: error.stack || "",
      cause: error.cause || "",
    },
  };

  if (ExpoSandboxModuleNative) {
    ExpoSandboxModuleNative.sendMessage(message);
  }

  else if (ErrorBridgeModule) {
    ErrorBridgeModule.sendErrorToHostApp(message.data);
  }

}
