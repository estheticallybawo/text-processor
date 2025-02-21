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
import { useLanguageDetection } from "@/context/LanguageDetectionContext";
import { useTranslation } from "@/context/TranslationContext";

interface Message {
  text: string;
  detectedLanguage: string;
  confidence?: number;
  translation?: string;
  summary?: string;
  translatedText?: string;
}
const languageMap: { [key: string]: string } = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  ru: "Russian",
  tr: "Turkish",
  fr: "French",
};


export default function ChatPage() {
  const { translateText } = useTranslation();
  const [isDetectorInitialized, setIsDetectorInitialized] = useState(false); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const { summarizeText } = useSummarizer() as {
    summarizeText: (text: string) => Promise<string>;
  };
  const [summarizationStatus, setSummarizationStatus] = useState<'idle' | 'summarizing' | 'success' | 'error'>('idle');
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'success' | 'error'>('idle');

  const { detectLanguage, formatConfidence } = useLanguageDetection();

  const handleSend = async () => {
    if (!inputValue.trim()) return;
  
    // Check if the detector is ready
    if (!isDetectorInitialized) {
      setIsDetectorInitialized(true);
    }
  
    // Detect the language of the input text
    const detectedLanguages = await detectLanguage(inputValue);
    const detectedLanguage = detectedLanguages.length > 0 ? detectedLanguages[0].detectedLanguage : "Unknown";
  
    const newMessage: Message = {
      text: inputValue,
      detectedLanguage,
      confidence: detectedLanguages.length > 0 ? detectedLanguages[0].confidence : 0,
    };
  
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  
  };

  

  const handleSummarize = async (index: number) => {
    if (messages[index].text.length < 150) return;
    const supportedLanguagesForSummarization = ["en"]; 
  if (!supportedLanguagesForSummarization.includes(messages[index].detectedLanguage)) return;

    try {
      setSummarizationStatus('summarizing');

      const summary = await summarizeText(messages[index].text);
      

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

  const handleTranslate = async (index: number, sourceLanguage: string, targetLanguage: string) => {
    const message = messages[index];
  
    try {
      setTranslationStatus("translating");
      console.log("Translating text:", message.text); // Debug log
      // Use the translateText function from the TranslationContext
      const translatedText = await translateText(message.text, sourceLanguage, targetLanguage);
      
      console.log("Translated text:", translatedText); // Debug log

  
      // Update the message with the translated text
      const updatedMessages = [...messages];
      updatedMessages[index].translation = translatedText
      setMessages(updatedMessages);
  
      setTranslationStatus("success");
    } catch (error) {
      console.error("Translation failed:", error);
  
      // Update the message with an error message
      const updatedMessages = [...messages];
      updatedMessages[index].translation = "Translation unavailable";
      setMessages(updatedMessages);
  
      setTranslationStatus("error");
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
            <h1 className={styles.title}> AI-Powered Text Processor</h1>
            <p className={styles.caveat}>Instant Summarization, Translation and Language detection</p>
          </div>
        </div>
        <Button onClick={handleClearChat} className={styles.clearButton}>
          Clear Chat
        </Button>
      </header>

      <main className={styles.main}>
      <div className={styles.messageList}>
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
       
          {messages.map((message, index) => (
            <div key={index} className={styles.messageContainer}>
              <div className={styles.message}>
                <p>{message.text}</p>
                <p className={styles.detectedLanguage}>
                I am ({message.confidence ? formatConfidence(message.confidence) : "N/A"}) sure that this is {languageMap[message.detectedLanguage] || "Unknown"}</p>
              </div>
              {message.text.length > 150 && (
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
                      {Object.entries(languageMap).map(([code, name]) => (
            <SelectItem key={code} value={code}> {name}
            </SelectItem>
          ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                className={styles.translateButton}
                onClick={() => handleTranslate(index, message.detectedLanguage, targetLanguage)}
              >
                Translate
              </Button>
              {message.translatedText && (
                <div className={styles.translation}>
                  <p className={styles.translationLabel}>Translation:</p>
                  <p>{translationStatus === 'translating' && (
                      <div className={styles.statusMessage}>
                        <p>Translating... Please wait.</p>
                      </div>
                    )}
                    {translationStatus === 'error' && (
                      <div className={styles.statusError}>
                        <p>Translation failed. Please try again.</p>
                      </div>
                    )}
                    <p className={styles.targetLanguage}>
                    {languageMap[targetLanguage]}: {message.translatedText}
                    </p>
                  </p>
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
