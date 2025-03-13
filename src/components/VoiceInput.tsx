import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert, Animated } from 'react-native';
import Voice, { 
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechResultsEvent,
  SpeechErrorEvent
} from '@react-native-voice/voice';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestResultRef = useRef<string>('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pingAnim = useRef(new Animated.Value(0)).current;

  // Start pulse animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            // Main button pulse
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            // Ping effect
            Animated.sequence([
              Animated.timing(pingAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(pingAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      pingAnim.setValue(0);
    }
  }, [isListening, pulseAnim, pingAnim]);

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
    Voice.onSpeechStart = (_: SpeechStartEvent) => {
      setIsListening(true);
      latestResultRef.current = '';
    };
    
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value?.[0]) {
        latestResultRef.current = e.value[0];
      }
    };
    
    Voice.onSpeechEnd = (_: SpeechEndEvent) => {
      setIsListening(false);
      if (latestResultRef.current) {
        onSpeechResult(latestResultRef.current);
      }
    };
    
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message || 'Speech recognition failed');
      setIsListening(false);
    };

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
      <View style={styles.buttonContainer}>
        {isListening && (
          <Animated.View
            style={[
              styles.pingRing,
              {
                transform: [{ scale: pingAnim }],
                opacity: pingAnim.interpolate({
                  inputRange: [0.2, 0.5, 1],
                  outputRange: [1, 0.5, 0.2],
                }),
              },
            ]}
          />
        )}
        <TouchableOpacity
          style={[styles.button, isListening && styles.buttonActive]}
          onPress={isListening ? stopListening : startListening}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon 
              name={isListening ? "mic" : "mic-none"} 
              size={32} 
              color="white" 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {error && (
        <Animated.Text style={styles.errorText}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: '#F44336',
  },
  pingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F44336',
    opacity: 0.3,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default VoiceInput;