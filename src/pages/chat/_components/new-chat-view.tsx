"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useAction } from "convex/react";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api.js";
import { Sparkles, Code, Globe, Zap, BrainCircuit } from "lucide-react";
import ModelSelector from "./model-selector.tsx";
import ChatInput from "./chat-input.tsx";
import { DEFAULT_MODEL, getModel } from "@/lib/models";
import { toast } from "sonner";

const SUGGESTIONS = [
  { icon: Sparkles, label: "Explain quantum computing in simple terms" },
  { icon: Code, label: "Write a Python script to sort a list" },
  { icon: Globe, label: "What are the latest trends in AI?" },
  { icon: Zap, label: "Give me 5 productivity tips for developers" },
];

export default function NewChatView() {
  const navigate = useNavigate();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL.id);
  const [isSending, setIsSending] = useState(false);
  const createConversation = useMutation(api.conversations.create);
  const addMessage = useMutation(api.messages.add);
  const updateContent = useMutation(api.messages.updateContent);
  const chatAction = useAction(api.ai.chat);
  const currentUser = useQuery(api.users.getCurrentUser, {});

  // Apply user's default model preference once loaded
  useEffect(() => {
    if (!currentUser?.defaultModel) return;
    const id = currentUser.defaultModel;
    const t = setTimeout(() => setSelectedModelId(id), 0);
    return () => clearTimeout(t);
  }, [currentUser?.defaultModel]);

  const handleSend = async (content: string) => {
    if (isSending) return;
    setIsSending(true);
    const model = getModel(selectedModelId);
    
    try {
      // 1. Create conversation
      const convId = await createConversation({
        title: content.slice(0, 60) + (content.length > 60 ? "..." : ""),
        model: model.id,
        gateway: model.gateway,
      });

      // 2. Add user message
      await addMessage({ 
        conversationId: convId, 
        role: "user", 
        content, 
        status: "done" 
      });

      // 3. Navigate immediately so the user sees the chat screen
      navigate(`/c/${convId}`);

      // 4. Create assistant placeholder and trigger AI (this happens in background after navigation)
      const assistantMsgId = await addMessage({
        conversationId: convId,
        role: "assistant",
        content: "",
        status: "streaming",
      });

      try {
        const systemPrompt = currentUser?.systemPrompt;
        const messages = systemPrompt 
          ? [{ role: "system" as const, content: systemPrompt }, { role: "user" as const, content }]
          : [{ role: "user" as const, content }];

        const result = await chatAction({
          conversationId: convId,
          messages,
          modelId: selectedModelId,
          assistantMessageId: assistantMsgId,
        });

        await updateContent({ id: assistantMsgId, content: result, status: "done" });
      } catch (err) {
        console.error("AI Error:", err);
        await updateContent({
          id: assistantMsgId,
          content: "Sorry, I encountered an error. Please try again.",
          status: "error",
        });
        toast.error("AI response failed");
      }
    } catch (err) {
      console.error("Conversation Error:", err);
      toast.error("Failed to start conversation");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 relative">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 mb-10 text-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] as const }}
            className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10"
          >
            <BrainCircuit className="size-7 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-2xl font-bold tracking-tight"
          >
            What can I help you with?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground text-sm"
          >
            Choose a model and start a conversation
          </motion.p>
        </motion.div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xl mb-8">
          {SUGGESTIONS.map(({ icon: Icon, label }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSend(label)}
              disabled={isSending}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border text-left text-sm text-muted-foreground hover:text-foreground hover:bg-card/80 hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="size-4 mt-0.5 text-primary shrink-0" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-6 px-4"
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
          />
          <ChatInput onSend={handleSend} disabled={isSending} />
        </div>
      </motion.div>
    </div>
  );
}
