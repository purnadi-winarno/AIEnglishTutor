import { useState, useCallback, useEffect } from 'react';
import { SYSTEM_PROMPT, API_CONFIG } from './aiConfig';
import { useChatStore } from '../store/chatStore';

interface AIResponse {
  correctedEnglish: string;
  explanation: string;
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// Update the API URLs
const API_BASE = 'https://api.openai.com/v1';

export const useAIResponse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    assistantId, 
    threadId, 
    setAssistantId, 
    setThreadId,
    addMessage
  } = useChatStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!assistantId) {
          setAssistantId('default-assistant');
        }
        if (!threadId) {
          setThreadId(`thread-${Date.now()}`);
        }
      } catch (e) {
        console.error('Error initializing:', e);
        setError('Failed to initialize chat');
      }
    };

    initialize();
  }, [assistantId, threadId, setAssistantId, setThreadId]);

  const getAIResponse = useCallback(async (userInput: string): Promise<AIResponse | null> => {
    if (!assistantId || !threadId) {
      setError('Chat not initialized');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      addMessage({ text: userInput, isUser: true });

      const completion = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: "system",
              content: API_CONFIG.instructions
            },
            {
              role: "user",
              content: userInput.trim()
            }
          ]
        }),
      });

      if (!completion.ok) {
        throw new Error(`HTTP error! status: ${completion.status}`);
      }

      const response = await completion.json();
      const aiMessage = response.choices[0]?.message?.content || '';

      addMessage({
        text: aiMessage,
        isUser: false,
        translation: ''
      });

      return {
        correctedEnglish: aiMessage,
        explanation: ''
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Error getting AI response:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assistantId, threadId, addMessage]);

  // Add function to clear conversation
  const clearConversation = useCallback(async () => {
    if (assistantId) {
      // Create new thread
      const threadResponse = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: "system",
              content: API_CONFIG.instructions
            }
          ]
        }),
      });

      const thread = await threadResponse.json();
      setThreadId(thread.id);
    }
  }, [assistantId, setThreadId]);

  return { getAIResponse, loading, error, clearConversation };
};

function getErrorMessage(error: any): string {
  if (error?.message?.includes('quota')) {
    return 'OpenAI API quota exceeded. Please try again later or contact support.';
  }
  if (error?.message?.includes('API key')) {
    return 'Invalid API key. Please check your configuration.';
  }
  return 'An error occurred while processing your request. Please try again.';
}