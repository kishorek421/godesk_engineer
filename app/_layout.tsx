import { View, Text } from 'react-native'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { Stack } from 'expo-router'

const RootLayout = () => {
    return (
        <GluestackUIProvider mode="light">
            <Stack>
                <Stack.Screen name='home' options={{ headerShown: false }} />
                <Stack.Screen name='login' options={{ headerShown: false }} />
                <Stack.Screen name='verify_otp' options={{ headerShown: false }} />
                <Stack.Screen name='ticket_details/[ticketId]' options={{ 
                    headerTitle: "Ticket Details",
                    headerBackTitle: "Home",
                 }} />
            </Stack>
        </GluestackUIProvider>
    );
}

export default RootLayout