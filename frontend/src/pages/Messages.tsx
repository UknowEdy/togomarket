import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send, Image as ImageIcon, DollarSign, ArrowLeft, MoreVertical } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { formatRelativeTime, formatPrice } from '@/utils/helpers';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { emitTyping, emitStopTyping } from '@/services/socket';

export const Messages = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    loadConversations,
    selectConversation,
    sendMessage,
    initializeSocket
  } = useMessageStore();

  const [messageText, setMessageText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialiser Socket.io
    const token = localStorage.getItem('token');
    if (token) {
      initializeSocket(token);
    }

    // Charger les conversations
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentConversation) return;

    if (showOfferInput && offerAmount) {
      // Envoyer une offre
      await sendMessage(currentConversation._id, `Offre: ${offerAmount} FCFA`, {
        amount: parseInt(offerAmount),
        currency: 'FCFA'
      });
      setOfferAmount('');
      setShowOfferInput(false);
    } else if (messageText.trim()) {
      // Envoyer un message texte
      await sendMessage(currentConversation._id, messageText);
      setMessageText('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!currentConversation) return;

    // Émettre événement "typing"
    emitTyping(currentConversation._id);

    // Arrêter après 2 secondes d'inactivité
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      emitStopTyping(currentConversation._id);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const renderMessageContent = (message: any) => {
    if (message.type === 'offer') {
      return (
        <div className="p-3 bg-secondary/10 border border-secondary rounded-lg">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
            <DollarSign className="w-4 h-4" />
            Offre de prix
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(message.priceOffer.amount)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {message.priceOffer.status === 'pending' && 'En attente de réponse'}
            {message.priceOffer.status === 'accepted' && '✅ Acceptée'}
            {message.priceOffer.status === 'rejected' && '❌ Refusée'}
            {message.priceOffer.status === 'countered' && '💱 Contre-offre'}
          </div>
        </div>
      );
    }

    return <p className="text-gray-900">{message.content?.text}</p>;
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Liste des conversations */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${
        conversationId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune conversation</p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => navigate(`/messages/${conv._id}`)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    conversationId === conv._id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {conv.otherUser.avatar?.url ? (
                      <img
                        src={conv.otherUser.avatar.url}
                        alt={conv.otherUser.fullName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {conv.otherUser.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.otherUser.fullName}
                        </h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatRelativeTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Annonce */}
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conv.listing.title}
                      </p>

                      {/* Dernier message */}
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.content}
                        </p>
                      )}

                      {/* Compteur non lus */}
                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone de chat */}
      {conversationId && currentConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {currentConversation.otherUser.avatar?.url ? (
                <img
                  src={currentConversation.otherUser.avatar.url}
                  alt={currentConversation.otherUser.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {currentConversation.otherUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentConversation.otherUser.fullName}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentConversation.listing.title}
                </p>
              </div>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isMine = message.sender._id === user?._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md ${
                    isMine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                  } rounded-lg p-3`}>
                    {renderMessageContent(message)}
                    <div className={`text-xs mt-1 ${
                      isMine ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {formatRelativeTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              {!showOfferInput ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowOfferInput(true)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="Faire une offre"
                  >
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />

                  <Button type="submit" disabled={!messageText.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Montant en FCFA"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />

                  <Button type="submit" disabled={!offerAmount}>
                    Envoyer l'offre
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOfferInput(false);
                      setOfferAmount('');
                    }}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
