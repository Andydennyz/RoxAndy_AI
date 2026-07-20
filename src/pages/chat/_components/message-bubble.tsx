import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Pencil, User, BrainCircuit, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { Doc } from "../../../../convex/_generated/dataModel";
import MarkdownRenderer from "./markdown-renderer.tsx";
import { toast } from "sonner";

interface Props {
  message: Doc<"messages">;
  isLast?: boolean;
  onRegenerate?: () => void;
  onEditResend?: (newContent: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as date for older messages
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function MessageBubble({ message, isLast, onRegenerate, onEditResend }: Props) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";
  const isDone = message.status === "done";

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const handleCopy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback((prev) => (prev === type ? null : type));
    toast.success(type === "up" ? "Thanks for the feedback!" : "Got it, we'll do better.");
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      return;
    }
    onEditResend?.(trimmed);
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditValue(message.content);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className={cn(
          "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser
            ? "bg-primary/20 text-primary"
            : isError
            ? "bg-destructive/20 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? (
          <User className="size-4" />
        ) : isError ? (
          <AlertCircle className="size-4" />
        ) : (
          <BrainCircuit className="size-4" />
        )}
      </motion.div>

      {/* Content + Actions */}
      <div className={cn("flex flex-col gap-1.5 max-w-[80%]", isUser && "items-end")}>
        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground px-1",
            isUser && "flex-row-reverse"
          )}
          title={new Date(message._creationTime).toLocaleString()}
        >
          <Clock className="size-3" />
          <span>{formatTimestamp(message._creationTime)}</span>
        </motion.div>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : isError
              ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm"
              : "bg-card border border-border text-card-foreground rounded-tl-sm"
          )}
        >
          {isStreaming && !message.content ? (
            /* Animated typing dots */
            <div className="flex gap-1.5 py-1 px-1 items-center">
              {[0, 150, 300].map((delay) => (
                <motion.span
                  key={delay}
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
                  className="size-1.5 rounded-full bg-current"
                />
              ))}
            </div>
          ) : editing ? (
            <div className="flex flex-col gap-2 min-w-[240px]">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={3}
                className="bg-transparent resize-none outline-none w-full text-sm leading-relaxed"
              />
              <div className="flex gap-2 justify-end text-xs">
                <button
                  onClick={() => { setEditing(false); setEditValue(message.content); }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-medium transition-colors cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div>
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
                />
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <AnimatePresence>
          {isDone && !editing && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: isLast ? 1 : undefined, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex items-center gap-0.5 transition-opacity",
                isUser ? "flex-row-reverse" : "flex-row",
                isLast ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <ActionButton onClick={handleCopy} title="Copy">
                {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
              </ActionButton>

              {isUser && onEditResend && (
                <ActionButton onClick={() => setEditing(true)} title="Edit & resend">
                  <Pencil className="size-3.5" />
                </ActionButton>
              )}

              {!isUser && (
                <>
                  <ActionButton
                    onClick={() => handleFeedback("up")}
                    title="Good response"
                    active={feedback === "up"}
                    activeClass="text-green-400"
                  >
                    <ThumbsUp className="size-3.5" />
                  </ActionButton>

                  <ActionButton
                    onClick={() => handleFeedback("down")}
                    title="Bad response"
                    active={feedback === "down"}
                    activeClass="text-destructive"
                  >
                    <ThumbsDown className="size-3.5" />
                  </ActionButton>

                  {isLast && onRegenerate && (
                    <ActionButton onClick={onRegenerate} title="Regenerate response">
                      <RotateCcw className="size-3.5" />
                    </ActionButton>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ActionButton({
  onClick,
  title,
  children,
  active,
  activeClass,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors cursor-pointer",
        active
          ? cn("bg-muted", activeClass)
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </motion.button>
  );
}
