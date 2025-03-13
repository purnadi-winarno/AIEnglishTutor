import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tts from 'react-native-tts';

interface VoiceOutputProps {
  text: string;
  translation?: string;
}

const VoiceOutput: React.FC<VoiceOutputProps> = ({ text, translation }) => {
  const speak = async () => {
    try {
      await Tts.speak(text);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    speak();
  }, [text]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {translation && <Text style={styles.translation}>{translation}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    color: '#1976D2',
  },
  translation: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
});

export default VoiceOutput;