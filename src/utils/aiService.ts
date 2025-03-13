import { useState } from 'react';

interface AIResponse {
  correctedEnglish: string;
  explanation: string;
}

export const useAIResponse = () => {
  const [loading, setLoading] = useState(false);

  const getAIResponse = async (userInput: string): Promise<AIResponse | null> => {
    try {
      setLoading(true);
      
      const completion = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an English tutor. Correct any grammar or pronunciation mistakes and provide explanations in Indonesian."
            },
            {
              role: "user",
              content: userInput
            }
          ],
          model: "gpt-3.5-turbo",
        }),
      });

      if (!completion.ok) {
        throw new Error(`HTTP error! status: ${completion.status}`);
      }

      const response = await completion.json();
      
      return {
        correctedEnglish: response.choices[0]?.message?.content || '',
        explanation: response.choices[1]?.message?.content || ''
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getAIResponse, loading };
};