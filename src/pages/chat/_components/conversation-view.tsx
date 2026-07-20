import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import MessageBubble from "./message-bubble.tsx";
import ChatInput from "./chat-input.tsx";
import ModelSelector from "./model-selector.tsx";
import { Skeleton } from "../../../components/ui/skeleton.tsx";
import { getModel } from "@/lib/models";
import { toast } from "sonner";
import type { Doc } from "../../../../convex/_generated/dataModel";

interface Props {
  conversationId: string;
}

type Message = Doc<"messages">;

export default function ConversationView({ conversationId }: Props) {
  const convId = conversationId;
  const conversation = useQuery(api.conversations.get, { id: convId });
  const messages = useQuery(api.messages.listByConversation, {
    conversationId: convId,
  }) as Message[] | undefined;
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const addMessage = useMutation(api.messages.add);
  const updateContent = useMutation(api.messages.updateContent);
  const removeMessage = useMutation(api.messages.remove);
  const updateModel = useMutation(api.conversations.updateModel);
  const chat = useAction(api.ai.chat);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const selectedModelId = conversation?.model ?? getModel("openrouter-gpt4o").id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendAIResponse = async (msgs: Partial<Message>[]) => {
    if (!msgs || !conversation) return;
    setIsStreaming(true);

    const assistantMsgId = await addMessage({
      conversationId: convId,
      role: "assistant",
      content: "",
      status: "streaming",
    });

    try {
      const history = msgs
        .filter((m) => m.status !== "streaming")
        .map((m) => ({ role: m.role, content: m.content }));

      const systemPrompt = currentUser?.systemPrompt;
      const messagesWithSystem = systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }, ...history]
        : history;

      const result = await chat({
        conversationId: convId,
        messages: messagesWithSystem,
        modelId: selectedModelId,
        assistantMessageId: assistantMsgId,
      });

      await updateContent({ id: assistantMsgId, content: result, status: "done" });
    } catch {
      await updateContent({
        id: assistantMsgId,
        content: "Sorry, I encountered an error. Please try again.",
        status: "error",
      });
      toast.error("AI response failed");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async (content: string) => {
    if (!conversation) return;

    await addMessage({
      conversationId: convId,
      role: "user",
      content,
      status: "done",
    });

    if (!messages || isStreaming) return;
    const nextMessages = [...messages, { role: "user" as const, content, status: "done" }];
    void sendAIResponse(nextMessages);
  };

  const handleRegenerate = async () => {
    if (!messages || isStreaming) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;

    await removeMessage({ id: last._id });
  };

  const handleEditResend = async (messageId: string, newContent: string) => {
    if (!messages || isStreaming) return;

    const idx = messages.findIndex((m) => m._id === messageId);
    if (idx === -1) return;

    const toDelete = messages.slice(idx);
    for (const m of toDelete) {
      await removeMessage({ id: m._id });
    }

    await addMessage({
      conversationId: convId,
      role: "user",
      content: newContent,
      status: "done",
    });
  };

  const handleModelChange = async (modelId: string) => {
    const model = getModel(modelId);
    await updateModel({
      id: convId,
      model: modelId,
      gateway: model.gateway,
    });
  };

  if (conversation === undefined || messages === undefined) {
    return (
      <div className="flex flex-col h-full px-4 py-8">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const lastMsgIdx = messages.length - 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-44">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isLast={i === lastMsgIdx}
              onRegenerate={!isStreaming ? handleRegenerate : undefined}
              onEditResend={
                !isStreaming
                  ? (newContent) => void handleEditResend(msg._id, newContent)
                  : undefined
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-6 px-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <ModelSelector selectedModelId={selectedModelId} onModelChange={handleModelChange} />
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
