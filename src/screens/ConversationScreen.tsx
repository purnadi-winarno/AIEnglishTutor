import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import VoiceInput from '../components/VoiceInput';
import VoiceOutput from '../components/VoiceOutput';
import { useAIResponse } from '../utils/aiService';

interface Message {
  text: string;
  isUser: boolean;
  translation?: string;
}

const ConversationScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { getAIResponse, loading, error } = useAIResponse();

  const handleSpeechResult = async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { text, isUser: true }]);

    // Get AI response
    const response = await getAIResponse(text);
    if (response) {
      setMessages(prev => [...prev, {
        text: response.correctedEnglish,
        translation: response.explanation,
        isUser: false
      }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={message.isUser ? styles.userMessage : styles.aiMessage}>
            <VoiceOutput
              text={message.text}
              translation={message.translation}
            />
          </View>
        ))}
      </ScrollView>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <VoiceInput onSpeechResult={handleSpeechResult} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ConversationScreen;