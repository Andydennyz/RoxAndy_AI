"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Menu, MessageSquare, Plus, Search, Settings, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";


/** Splits `text` into segments, marking which parts match `query` */
function getHighlightSegments(text: string, query: string): { part: string; match: boolean }[] {
  if (!query.trim()) return [{ part: text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part) => ({ part, match: regex.test(part) }));
}

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const segments = getHighlightSegments(title, query);
  return (
    <span className="flex-1 truncate">
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5 not-italic">
            {seg.part}
          </mark>
        ) : (
          <span key={i}>{seg.part}</span>
        )
      )}
    </span>
  );
}

export default function Sidebar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const conversations = useQuery(api.conversations.list, {}) as Doc<"conversations">[] | undefined;
  const removeConversation = useMutation(api.conversations.remove);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered =
    conversations?.filter((c: Doc<"conversations">) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleDelete = async (convId: Id, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await removeConversation({ id: convId });
      if (id === convId) navigate("/");
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <BrainCircuit className="size-4 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight text-sidebar-foreground">RoxAndyAI</span>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-3 pb-2">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
            className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
            variant="ghost"
            onClick={() => { navigate("/"); setMobileOpen(false); }}
            >
            <Plus className="size-4" />
            New Chat
          </Button>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 focus-within:border-primary/40 focus-within:bg-muted/60 transition-all">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-sidebar-foreground"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSearch("")}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations === undefined ? (
          <div className="space-y-1 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="h-9 rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-8 text-center text-muted-foreground text-sm"
          >
            {search ? (
              <>
                <Search className="size-4 mx-auto mb-2 opacity-40" />
                No results for <span className="text-foreground/60">"{search}"</span>
              </>
            ) : (
              "No conversations yet. Start chatting!"
            )}
          </motion.div>
        ) : (
          <div className="space-y-0.5">
            {search && (
              <p className="px-3 pb-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
            <AnimatePresence initial={false}>
              {filtered.map((conv, i) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, delay: i < 10 ? i * 0.03 : 0 }}
                  onClick={() => { navigate(`/c/${conv._id}`); setMobileOpen(false); }}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                    id === conv._id
                      ? "bg-primary/15 text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                  <HighlightedTitle title={conv.title} query={search} />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDelete(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-sidebar-border">
          <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { navigate("/settings"); setMobileOpen(false); }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
            location.pathname === "/settings"
              ? "bg-primary/15 text-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
          >
          <Settings className="size-4 shrink-0" />
          <span>Settings</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border cursor-pointer"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="size-4" />
            </motion.span>
          ) : (
            <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border"
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
