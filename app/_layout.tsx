import { View, Text } from 'react-native'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext';

const RootLayout = () => {
    return (
        <GluestackUIProvider mode="light">
            <AuthProvider>
                <Stack>
                    <Stack.Screen name='home' options={{ headerShown: false }} />
                    <Stack.Screen name='login' options={{ headerShown: false }} />
                    <Stack.Screen name='verify_otp' options={{ headerShown: false }} />
                    <Stack.Screen name='ticket_details/[ticketId]' options={{
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
            </AuthProvider>
        </GluestackUIProvider>
    );
}

export default RootLayout