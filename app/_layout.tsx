import { View, Text } from 'react-native'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext';
import Toast from "react-native-toast-message";
const RootLayout = () => {
    return (
        <GluestackUIProvider mode="light">
            <AuthProvider>
                <Stack>

                      <Stack.Screen name='index' options={{ headerShown: false }} />

                   

                    <Stack.Screen name='home' options={{ headerShown: false }} />
                    <Stack.Screen name='login' options={{ headerShown: false }} />
                    <Stack.Screen name='verify_otp' options={{ headerShown: false }} />
                    <Stack.Screen name='ticket_details/[ticketId]' options={{
                        headerShown: false,
                    }} />
                    <Stack.Screen name='data_storage/[homescreen]' options={{
                        headerShown: false,
                    }} />
                    <Stack.Screen
                        name="image_viewer/[uri]"
                        options={{
                            presentation: "modal",
                            headerShown: false,
                        }}
                    />
                </Stack>
                <Toast />
            </AuthProvider>
        </GluestackUIProvider>
    );
}

export default RootLayout