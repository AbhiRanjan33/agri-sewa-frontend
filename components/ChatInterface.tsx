"use client";

import { useCallback, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useDataCache } from '@/lib/DataCacheContext';
import MessageList, { ChatMessage } from './MessageList';
import ChatInput from './ChatInput';
import { postQuery } from '@/lib/api';

export default function ChatInterface() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { speak, stop, pause, resume, isPlaying, isPaused } = useTextToSpeech();
  const { chatMessages, addChatMessage } = useDataCache();
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ latitude: 26.4499, longitude: 80.3319 });
        }
      );
    } else {
      setUserLocation({ latitude: 26.4499, longitude: 80.3319 });
    }
  }, []);

  const handleSend = useCallback(async ({ text, imageUrl }: { text: string; imageUrl?: string | null }) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: text, 
      imageUrl: imageUrl || null
    };
    addChatMessage(userMessage);
    setIsLoading(true);

    try {
      const queryData = {
        query: text,
        imageUrl: imageUrl || undefined,
        language: language,
        latitude: userLocation?.latitude || 26.4499,
        longitude: userLocation?.longitude || 80.3319,
        state_id: user?.state_id || 8,
        district_id: user?.district_id ? [user.district_id] : [104]
      };

      const data = await postQuery(queryData);
      const backendResponse = data.response;

      const aiMessage: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: backendResponse || 'No response received'
      };
      addChatMessage(aiMessage);

      if (backendResponse && backendResponse.trim()) {
        speak(backendResponse, language);
      }

    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMsg = t('sorryError');
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMsg
      };
      addChatMessage(aiMessage);
    } finally {
      setIsLoading(false);
    }
  }, [language, speak, t, userLocation, user, addChatMessage]);

  return (
    <div className="flex h-full flex-col main-component border border-white/10 shadow-xl">
      <div className="border-b p-4 flex-shrink-0 card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">{t('assistantTitle')}</h2>
            <p className="text-xs text-gray-600">{t('assistantDescription')}</p>
          </div>
          
          {(isPlaying || isPaused) && (
            <div className="flex items-center space-x-2 bg-white p-2 rounded-md">
              <span className="text-xs text-gray-600">TTS:</span>
              
              {isPlaying && !isPaused && (
                <button
                  aria-label="Pause speech"
                  className="text-gray-600 hover:text-black p-1 rounded"
                  onClick={pause}
                  title="Pause speech"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M6 4v16h4V4H6zm8 0v16h4V4h-4z" />
                  </svg>
                </button>
              )}
              
              {isPaused && (
                <button
                  aria-label="Resume speech"
                  className="text-gray-600 hover:text-black p-1 rounded"
                  onClick={resume}
                  title="Resume speech"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              
              <button
                aria-label="Stop speech"
                className="text-gray-600 hover:text-red-600 p-1 rounded"
                onClick={stop}
                title="Stop speech"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center fade-in">
            <div className="text-center">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg" />
              <p className="text-lg text-gray-600">{t('welcomeMessage')}</p>
            </div>
          </div>
        ) : (
          <MessageList messages={chatMessages} />
        )}
      </div>

      {isLoading && (
        <div className="px-4 pb-2 text-xs text-gray-600 flex-shrink-0">{t('generatingResponse')}</div>
      )}
      <ChatInput onSend={handleSend} />
    </div>
  );
}