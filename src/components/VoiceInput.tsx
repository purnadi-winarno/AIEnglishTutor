import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestResultRef = useRef<string>('');

  const checkPermission = useCallback(async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      });
      
      if (!permission) return false;

      const result = await check(permission);
      if (result === RESULTS.GRANTED) return true;
      
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    } catch (e) {
      console.error('Permission check failed:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    const voiceListeners = {
      onSpeechStart: () => {
        setIsListening(true);
        latestResultRef.current = '';
      },
      
      onSpeechResults: (e: any) => {
        if (e.value?.[0]) {
          latestResultRef.current = e.value[0];
        }
      },
      
      onSpeechEnd: () => {
        setIsListening(false);
        if (latestResultRef.current) {
          onSpeechResult(latestResultRef.current);
        }
      },
      
      onSpeechError: (e: any) => {
        setError(e.error?.message || 'Speech recognition failed');
        setIsListening(false);
      }
    };

    Object.entries(voiceListeners).forEach(([event, handler]) => {
      Voice[event as keyof typeof Voice] = handler;
    });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechResult]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice recognition');
        return;
      }

      await Voice.start('en-US');
    } catch (e) {
      setIsListening(false);
      setError('Failed to start voice recognition');
    }
  }, [checkPermission]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      setError('Failed to stop voice recognition');
    } finally {
      setIsListening(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isListening && styles.buttonActive]}
        onPress={isListening ? stopListening : startListening}
      >
        <Text style={styles.buttonText}>
          {isListening ? 'Stop Speaking' : 'Start Speaking'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default VoiceInput;