import { Stack } from "expo-router";
import { colors } from "./constants/theme";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="register-encounter" />
        <Stack.Screen name="register-loss" />
        <Stack.Screen name="my-records" />
        <Stack.Screen name="details" />
      </Stack>
    </AuthProvider>
  );
}
