import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  label?: string;
}

// Window interface augmentation for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  className = '',
  buttonSize = 'md',
  label,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    setErrorMessage(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type directly.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SCRAPLY Voice] Recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          // Silent or background noise, no need to alarm user
        } else {
          setErrorMessage('Voice recognition encountered an issue. You can speak again or type.');
        }
        setIsListening(false);
        setTimeout(() => setErrorMessage(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[SCRAPLY Voice] Failed to start:', err);
      setErrorMessage('Unable to activate microphone. Please check permissions.');
      setIsListening(false);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-2 relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
        title={
          !isSupported
            ? 'Speech recognition not available'
            : isListening
            ? 'Listening... Click to stop'
            : 'Click to speak'
        }
        className={`relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 cursor-pointer ${
          sizeClasses[buttonSize]
        } ${
          isListening
            ? 'bg-amber-600 text-white shadow-lg listening-pulse ring-2 ring-amber-400'
            : 'bg-[var(--surface)] text-[var(--forest)] hover:bg-[var(--sage-light)] border border-[var(--border-subtle)] hover:border-[var(--leaf)] shadow-sm'
        } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? (
          <Mic className={`${iconSizes[buttonSize]} animate-pulse text-white`} />
        ) : isSupported ? (
          <Mic className={`${iconSizes[buttonSize]} text-[var(--leaf)]`} />
        ) : (
          <MicOff className={`${iconSizes[buttonSize]} text-neutral-400`} />
        )}
        {label && <span className="ml-1.5">{isListening ? 'Listening...' : label}</span>}
      </button>

      {isListening && (
        <span className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping"></span>
          Listening... Speak now
        </span>
      )}

      {errorMessage && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-2 text-xs bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-lg shadow-lg border border-red-200 dark:border-red-900 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
