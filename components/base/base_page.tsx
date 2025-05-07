import { View, Text, SafeAreaView } from 'react-native';
import React, { ReactNode } from 'react';
import { Translator } from '@/context/TranslationContext'; // Assuming Translator is in this path

const BasePage = ({children}:{children: ReactNode}) => {
    return (
        <SafeAreaView className="">
            <Translator>
                {children}
            </Translator>
        </SafeAreaView>
    );
};

export default BasePage;
