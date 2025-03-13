import React, { useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import VoiceInput from '../components/VoiceInput';
import VoiceOutput from '../components/VoiceOutput';
import { useAIResponse } from '../utils/aiService';
import { useChatStore } from '../store/chatStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConversationScreen = () => {
  const { messages, clearChat } = useChatStore();
  const { getAIResponse, loading, error } = useAIResponse();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSpeechResult = async (text: string) => {
    await getAIResponse(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat History</Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={message.isUser ? styles.userMessage : styles.aiMessage}
          >
            <VoiceOutput
              text={message.text}
              translation={message.translation}
              shouldSpeak={!message.isUser}
            />
          </View>
        ))}
      </ScrollView>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <VoiceInput 
        onSpeechResult={handleSpeechResult}
        disabled={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
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