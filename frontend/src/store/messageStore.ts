import { create } from 'zustand';
import { messagesAPI } from '@/services/api';
import { initSocket, getSocket, onNewMessage, joinConversation, leaveConversation } from '@/services/socket';

interface Message {
  _id: string;
  conversation: string;
  sender: any;
  content: {
    text?: string;
    images?: any[];
  };
  priceOffer?: {
    amount: number;
    currency: string;
    status: string;
  };
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  buyer: any;
  seller: any;
  listing: any;
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
  otherUser: any;
  createdAt: string;
  updatedAt: string;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSocketConnected: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, priceOffer?: any) => Promise<void>;
  createConversation: (listingId: string) => Promise<Conversation | null>;
  initializeSocket: (token: string) => void;
  markAsRead: (conversationId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSocketConnected: false,

  loadConversations: async () => {
    try {
      set({ isLoading: true });
      const response = await messagesAPI.getConversations();
      set({ conversations: response.conversations || [] });
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversationId: string) => {
    try {
      set({ isLoading: true });

      // Quitter l'ancienne conversation
      const { currentConversation } = get();
      if (currentConversation) {
        leaveConversation(currentConversation._id);
      }

      // Charger les messages
      const response = await messagesAPI.getMessages(conversationId);
      const conversation = get().conversations.find(c => c._id === conversationId);

      set({
        currentConversation: conversation || null,
        messages: response.messages || []
      });

      // Rejoindre la nouvelle conversation
      joinConversation(conversationId);

      // Marquer comme lu
      get().markAsRead(conversationId);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId: string, text: string, priceOffer?: any) => {
    try {
      const response = await messagesAPI.sendMessage(conversationId, text, priceOffer);

      // Le message sera ajouté via Socket.io
      // Mais on peut l'ajouter localement aussi pour UX instantanée
      if (response.message) {
        set(state => ({
          messages: [...state.messages, response.message]
        }));
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  },

  createConversation: async (listingId: string) => {
    try {
      const response = await messagesAPI.getOrCreateConversation(listingId);
      if (response.conversation) {
        // Ajouter la conversation à la liste si elle n'existe pas
        set(state => {
          const exists = state.conversations.find(c => c._id === response.conversation._id);
          if (!exists) {
            return {
              conversations: [response.conversation, ...state.conversations]
            };
          }
          return state;
        });

        return response.conversation;
      }
      return null;
    } catch (error) {
      console.error('Erreur création conversation:', error);
      return null;
    }
  },

  initializeSocket: (token: string) => {
    const socket = initSocket(token);

    socket.on('connect', () => {
      set({ isSocketConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isSocketConnected: false });
    });

    // Écouter les nouveaux messages
    onNewMessage((message: Message) => {
      const { currentConversation, messages } = get();

      // Si le message est pour la conversation actuelle
      if (currentConversation && message.conversation === currentConversation._id) {
        // Ajouter le message si pas déjà présent
        const exists = messages.find(m => m._id === message._id);
        if (!exists) {
          set({ messages: [...messages, message] });
        }
      }

      // Mettre à jour la liste des conversations
      get().loadConversations();
    });
  },

  markAsRead: (conversationId: string) => {
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv._id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    }));
  }
}));
