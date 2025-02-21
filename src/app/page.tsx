"use client";

import { useState, useCallback } from "react";
import styles from "./Chatbox.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import Link from "next/link";
import { useSummarizer } from "@/context/SummerizerContext";
import Image from "next/image";
import { languages } from "@/utils/languageMap"; 
import { formatConfidence } from "@/utils/formatConfidence"; 
import { useLanguageDetection } from "@/context/LanguageDetectionContext";

interface Message {
  text: string;
  detectedLanguage: string;
  confidence?: number;
  translation?: string;
  summary?: string;
}

export default function ChatPage() {

  const { detectLanguage, translateText } = useLanguageDetection(); 
  const [isDetectorInitialized, setIsDetectorInitialized] = useState(false); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const { summarizeText } = useSummarizer() as {
    summarizeText: (text: string) => Promise<string>;
  };
  const [summarizationStatus, setSummarizationStatus] = useState<'idle' | 'summarizing' | 'success' | 'error'>('idle');
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Check if the detector is ready

    const newMessage: Message = {
      text: inputValue,
      detectedLanguage: "Detecting...",
      confidence: undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    const languageMap: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      fr: "French",
      pt: "Portuguese",
      ru: "Russian",
      tr: "Turkish",
    };
  
    const sendMessage = async (text: string) => {
      try {
        const detectionResult = await detectLanguage(text);
        const detectedLanguageCode = detectionResult[0]?.detectedLanguage || "en";

        newMessage.detectedLanguage = detectedLanguageCode;
        newMessage.confidence = detectionResult[0]?.confidence;

        setMessages((prev) => [...prev.slice(0, -1), newMessage]);
      } catch (error) {
        console.error('Language detection failed:', error);
        newMessage.detectedLanguage = "Unknown";
        setMessages((prev) => [...prev.slice(0, -1), newMessage]);
      }
    };

    await sendMessage(inputValue);
  };

  

  const handleSummarize = async (index: number) => {
    const message = messages[index];
    if (message.detectedLanguage == "en" || message.text.length >= 150) return;

    try {
      setSummarizationStatus('summarizing');

      const summary = await summarizeText(message.text);

      const updatedMessages = [...messages];
      updatedMessages[index].summary = summary;
      setMessages(updatedMessages);

      setSummarizationStatus('success');
      console.log('Summarization successful');
    } catch (error) {
      console.error('Summarization failed:', error);

      setSummarizationStatus('error');

      const updatedMessages = [...messages];
      updatedMessages[index].summary = 'Summary unavailable';
      setMessages(updatedMessages);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSummarizationStatus('idle');
  };

  const handleTranslate = async (index: number) => {
    const message = messages[index];
    if (!message) return;

    try {
      setTranslationStatus('translating');

      const translation = await translateText(message.text, targetLanguage);

      const updatedMessages = [...messages];
      updatedMessages[index].translation = translation;
      setMessages(updatedMessages);

      setTranslationStatus('success');
      console.log('Translation successful');
    } catch (error) {
      console.error('Translation failed:', error);

      setTranslationStatus('error');

      const updatedMessages = [...messages];
      updatedMessages[index].translation = 'Translation unavailable';
      setMessages(updatedMessages);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image
            className={styles.icon}
            src="/robot.png"
            alt="chatbot-icon"
            width={65}
            height={65}
          />
          <div>
            <h1 className={styles.title}>AI-Powered Text Processor</h1>
            <p className={styles.caveat}>Instant Summarization, Translation and Language detection</p>
          </div>
        </div>
        <Button onClick={handleClearChat} className={styles.clearButton}>
          Clear Chat
        </Button>
      </header>

      <main className={styles.main}>
      {!isDetectorInitialized && (
          <div className={styles.statusMessage}>
          </div>
        )}

        {summarizationStatus === 'summarizing' && (
          <div className={styles.statusMessage}>
            <p>Summarizing... Please wait.</p>
          </div>
        )}
        {summarizationStatus === 'error' && (
          <div className={styles.statusError}>
            <p>Summarization failed. Please try again.</p>
          </div>
        )}
        <div className={styles.messageList}>
          {messages.map((message, index) => (
            <div key={index} className={styles.messageContainer}>
              <div className={styles.message}>
                <p>{message.text}</p>
                <p className={styles.detectedLanguage}>
                  {message.confidence !== undefined
                    ? `I'm ${formatConfidence(message.confidence)} sure this is ${
                        languages.find(lang => lang.code === message.detectedLanguage)?.name || message.detectedLanguage
                      }`
            : `Detected language: ${message.detectedLanguage}`}</p>
              </div>
              {message.text.length > 150 && message.detectedLanguage === "English" && (
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.summarizeButton}
                  onClick={() => handleSummarize(index)}
                >
                  Summarize
                </Button>
              )}
              {message.summary && (
                <div className={styles.translation}>
                  <p className={styles.summaryLabel}>Summary:</p>
                  <p>{message.summary}</p>
                </div>
              )}
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className={styles.languageSelect}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent> 
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="tr">Turkish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                className={styles.translateButton}
                onClick={() => {handleTranslate} }
              >
                Translate
              </Button>
              {message.translation && (
                <div className={styles.translation}>
                  <p className={styles.translationLabel}>Translation:</p>
                  <p>{message.translation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputGroup}>
              <Input
                className={styles.input}
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={!summarizeText}
                
              />
              <Button onClick={handleSend} className={styles.sendButton}>
                <Send className={styles.sendIcon} />
              </Button>
            </div>
          </div>
          <div className={styles.footer}>
            built by{" "}
            <Link target="_blank" href="https://www.github.com/estheticallybawo">
              Esther Bawo Tsotso
            </Link>{" "}
            for{" "}
            <Link target="_blank" href="https://www.hng.tech">
              HNG Tech Internship
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
