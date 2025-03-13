import { useState, useCallback } from 'react';

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

const API_URL = 'https://api.openai.com/v1/chat/completions';
// const MODEL = 'gpt-3.5-turbo';
const MODEL = 'gpt-4o-mini';

const getErrorMessage = (error: any): string => {
  if (error?.message?.includes('quota')) {
    return 'OpenAI API quota exceeded. Please try again later or contact support.';
  }
  if (error?.message?.includes('API key')) {
    return 'Invalid API key. Please check your configuration.';
  }
  return 'An error occurred while processing your request. Please try again.';
};

export const useAIResponse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAIResponse = useCallback(async (userInput: string): Promise<AIResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('process.env.OPENAI_API_KEY: ', process.env.OPENAI_API_KEY);

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      if (!userInput.trim()) {
        throw new Error('Input is empty');
      }
      
      const completion = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are a friendly English tutor having a conversation with the user. Follow these rules:\n\n1. Engage naturally in English conversations with the user\n2. If the user makes grammar or contextual mistakes, provide corrections and explain them in Indonesian\n3. If the user speaks in Indonesian, respond in Indonesian, except for English-specific terms or examples\n4. For corrections, format your response as:\n- Original: [user's sentence]\n- Improved: [corrected sentence]\n- Penjelasan: [explanation in Indonesian]\n5. Keep the conversation friendly and encouraging"
            },
            {
              role: "user",
              content: userInput.trim()
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        }),
      });

      if (!completion.ok) {
        const errorData = await completion.json() as OpenAIError;
        throw new Error(errorData.error?.message || `HTTP error! status: ${completion.status}`);
      }

      const response = await completion.json();
      
      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      return {
        correctedEnglish: response.choices[0].message.content,
        explanation: response.choices[1]?.message?.content || 'No explanation provided'
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('Error getting AI response:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getAIResponse, loading, error };
};