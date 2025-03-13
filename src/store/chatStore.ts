import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  assistantId: string | null;
  threadId: string | null;
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    translation?: string;
  }>;
  setAssistantId: (id: string) => void;
  setThreadId: (id: string) => void;
  addMessage: (message: { text: string; isUser: boolean; translation?: string }) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      assistantId: null,
      threadId: null,
      messages: [],
      setAssistantId: (id) => set({ assistantId: id }),
      setThreadId: (id) => set({ threadId: id }),
      addMessage: (message) => 
        set((state) => ({
          messages: [...state.messages, { id: Date.now().toString(), ...message }],
        })),
      clearChat: () => set({ threadId: null, messages: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
); 