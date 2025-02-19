"use client";

import { useState } from "react";
import styles from "./Chatbox.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import Link from "next/link";

interface Message {
  text: string
  detectedLanguage: string
  translation?: string
  summary?: string
}

export default function TranslatorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("en")

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      text: inputValue,
      detectedLanguage: "Detecting...",
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Detect Language
    const detectedLanguage = await detectLanguage(inputValue)
    newMessage.detectedLanguage = detectedLanguage
    setMessages((prev) => [...prev.slice(0, -1), newMessage])
  }

  const handleTranslate = async (index: number) => {
    const message = messages[index]
    const translatedText = await translateText(message.text, targetLanguage)
    
    const updatedMessages = [...messages]
    updatedMessages[index].translation = translatedText
    setMessages(updatedMessages)
  }

  const handleSummarize = async (index: number) => {
    const message = messages[index]
    if (message.detectedLanguage !== "English" || message.text.length <= 150) return

    const summaryText = await summarizeText(message.text)
    
    const updatedMessages = [...messages]
    updatedMessages[index].summary = summaryText
    setMessages(updatedMessages)
  }

  const handleClearChat = () => {
    setMessages([]);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
        <h1 className={styles.title}>AI-Powered Text Processor</h1>
        <p className={styles.caveat}>Instant Summarization, Translation and Language detection </p>
        </div>
        <Button  onClick={() => handleClearChat()} className={styles.clearButton}> Clear Chat </Button>
      </header>

      <main className={styles.main}>
        <div className={styles.messageList}>
          {messages.map((message, index) => (
            <div key={index} className={styles.messageContainer}>
              <div className={styles.message}>
                <p>{message.text}</p>
                <p className={styles.detectedLanguage}>Detected language: {message.detectedLanguage}</p>
              </div>
              {message.text.length > 150 && message.detectedLanguage === "English" && (
                <Button variant="secondary" size="sm" className={styles.summarizeButton} onClick={() => handleSummarize(index)}>
                  Summarize
                </Button>
              )}
              {message.summary && (
                <div className={styles.summary}>
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
              <Button variant="secondary" size="sm" className={styles.translateButton} onClick={() => handleTranslate(index)}>
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
              />
              <Button onClick={handleSend} className={styles.sendButton}>
                <Send className={styles.sendIcon} />
              </Button>
    
            </div>
          </div>
          <div className={styles.footer}> built by <Link href="www.github.com/estheticallybawo">Esther Bawo Tsotso </Link> for <Link href="www.hng.tech">HNG Tech Internship</Link></div>
        </div>
      </main>
      
    </div>
  )
}

// Dummy API functions (Replace with real API calls)
async function detectLanguage(text: string): Promise<string> {
  return "English" // Mock detection (Replace with real API call)
}

async function translateText(text: string, targetLang: string): Promise<string> {
  return `Translated to ${targetLang}: ${text}` // Mock translation (Replace with real API call)
}

async function summarizeText(text: string): Promise<string> {
  return `Summary: ${text.substring(0, 100)}...` // Mock summary (Replace with real API call)
}


