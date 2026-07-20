"use client";

import { useState, useEffect, type ElementType } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { motion } from "motion/react";
import { api } from "../../../convex/_generated/api.js";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Settings,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import { MODELS, GATEWAYS, getModel } from "../../lib/models";
import type { Gateway, AIModel } from "../../lib/models";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils.ts";

const SYSTEM_PROMPT_PRESETS = [
  { label: "Default assistant", value: "" },
  {
    label: "Concise answers",
    value: "Be concise. Answer in as few words as possible without sacrificing accuracy.",
  },
  {
    label: "Expert developer",
    value:
      "You are an expert software engineer. Prefer code examples over explanations. Use modern best practices.",
  },
  {
    label: "Friendly tutor",
    value:
      "You are a friendly, patient tutor. Explain concepts step by step with analogies and examples. Encourage questions.",
  },
  {
    label: "Creative writer",
    value:
      "You are a creative writing assistant. Be imaginative, vivid, and engaging. Suggest unexpected angles and ideas.",
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = useQuery(api.users.getCurrentUser, {});
  const saveSettings = useMutation(api.users.updateSettings);
  const checkApiKeys = useAction(api.users.checkApiKeyStatus);

  const [displayName, setDisplayName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [defaultModel, setDefaultModel] = useState("openrouter-gpt4o");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ openrouter: boolean; nvidia: boolean } | null>(null);
  const [checkingKeys, setCheckingKeys] = useState(false);
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [nvidiaApiKey, setNvidiaApiKey] = useState("");

  // Hydrate form from DB (deferred to avoid sync setState in effect)
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      setDisplayName(user.displayName ?? user.name ?? "");
      setSystemPrompt(user.systemPrompt ?? "");
      setDefaultModel(user.defaultModel ?? "openrouter-gpt4o");
      setOpenrouterApiKey("");
      setNvidiaApiKey("");
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  const handleCheckKeys = async () => {
    setCheckingKeys(true);
    try {
      const status = await checkApiKeys({});
      setKeyStatus(status);
    } catch {
      // silently fail
    } finally {
      setCheckingKeys(false);
    }
  };

  // Check API key status on mount (defer to avoid sync setState)
  useEffect(() => {
    const t = setTimeout(() => void handleCheckKeys(), 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const model = getModel(defaultModel);
      await saveSettings({
        displayName: displayName.trim() || undefined,
        systemPrompt: systemPrompt.trim() || undefined,
        defaultModel,
        defaultGateway: model.gateway,
        openrouterApiKey: openrouterApiKey.trim() || undefined,
        nvidiaApiKey: nvidiaApiKey.trim() || undefined,
      });
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const modelsByGateway: { gateway: Gateway; models: AIModel[] }[] = GATEWAYS.map((gw: Gateway) => ({
    gateway: gw,
    models: MODELS.filter((m: AIModel) => m.gateway === gw.id),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
            <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center">
            <Settings className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Personalise your RoxAndyAI experience</p>
          </div>
        </motion.div>

        {/* Profile section */}
        <Section icon={User} title="Profile" delay={0.1}>
          <Field label="Display name" description="How you appear in conversations">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.name ?? "Enter your display name"}
              className="w-full px-3 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
            />
          </Field>
          {user?.email && (
            <Field label="Email" description="Your account email (read-only)">
              <input
                type="text"
                value={user.email}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground cursor-not-allowed"
              />
            </Field>
          )}
        </Section>

        {/* Default model section */}
        <Section icon={BrainCircuit} title="Default Model" delay={0.2}>
          <p className="text-sm text-muted-foreground mb-4">
            New conversations will start with this model. You can always change it per conversation.
          </p>
          <div className="space-y-4">
            {modelsByGateway.map(({ gateway, models }) => (
              <div key={gateway.id}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {gateway.name}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setDefaultModel(model.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        defaultModel === model.id
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-card/80"
                      )}
                    >
                      <div className={cn(
                        "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        defaultModel === model.id ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}>
                        {defaultModel === model.id && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{model.description}</span>
                      </div>
                      {model.contextLength && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          {model.contextLength >= 1000000
                            ? `${model.contextLength / 1000000}M ctx`
                            : `${model.contextLength / 1000}K ctx`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* System prompt section */}
        <Section icon={Sparkles} title="System Prompt" delay={0.3}>
          <p className="text-sm text-muted-foreground mb-4">
            A system prompt is a hidden instruction that shapes how the AI behaves in every conversation.
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {SYSTEM_PROMPT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSystemPrompt(preset.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                  systemPrompt === preset.value
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. You are a helpful coding assistant. Always provide code examples..."
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground resize-none leading-relaxed"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {systemPrompt.length} characters
          </p>
        </Section>

        {/* API Keys section */}
        <Section icon={KeyRound} title="API Keys" delay={0.35}>
          <p className="text-sm text-muted-foreground">
            RoxAndyAI routes requests through OpenRouter and NVIDIA NIM. API keys are stored securely
            as backend secrets — they are never exposed to the browser.
          </p>

          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <KeyStatusBadge label="OpenRouter" active={keyStatus?.openrouter ?? null} />
            <KeyStatusBadge label="NVIDIA NIM" active={keyStatus?.nvidia ?? null} />
            <button
              onClick={handleCheckKeys}
              disabled={checkingKeys}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn("size-3", checkingKeys && "animate-spin")} />
              {checkingKeys ? "Checking…" : "Refresh status"}
            </button>
          </div>

          {/* API key inputs */}
          <div className="grid gap-4 mt-4">
            <Field label="OpenRouter API Key" description="Paste your OpenRouter key here. Leave blank to keep existing key.">
              <input
                type="password"
                value={openrouterApiKey}
                onChange={(e) => setOpenrouterApiKey(e.target.value)}
                placeholder={keyStatus?.openrouter ? "Configured — paste to replace" : "Paste your OpenRouter key here"}
                className="w-full px-3 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              />
            </Field>
            <Field label="NVIDIA NIM API Key" description="Paste your NVIDIA API key here. Leave blank to keep existing key.">
              <input
                type="password"
                value={nvidiaApiKey}
                onChange={(e) => setNvidiaApiKey(e.target.value)}
                placeholder={keyStatus?.nvidia ? "Configured — paste to replace" : "Paste your NVIDIA API key here"}
                className="w-full px-3 py-2.5 rounded-xl bg-input border border-border text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              />
            </Field>
          </div>

          {/* Guide cards */}
          <div className="space-y-4 pt-1">
            <ProviderGuide
              name="OpenRouter"
              color="from-violet-500/10 to-blue-500/10"
              accent="border-violet-500/20"
              steps={[
                { n: 1, text: "Go to openrouter.ai and create a free account." },
                { n: 2, text: 'Click your avatar → "Keys" → "Create key". Give it any name.' },
                { n: 3, text: "Copy the key (starts with sk-or-…)." },
                {
                  n: 4,
                  text: 'In the Hercules App Builder, open Advanced → Secrets. Add key: OPENROUTER_API_KEY, value: your key.',
                },
              ]}
              link="https://openrouter.ai/keys"
              envKey="OPENROUTER_API_KEY"
            />

            <ProviderGuide
              name="NVIDIA NIM"
              color="from-green-500/10 to-teal-500/10"
              accent="border-green-500/20"
              steps={[
                { n: 1, text: "Go to build.nvidia.com and sign in or create an account." },
                { n: 2, text: 'Navigate to "API Keys" in the top navigation and click "Generate Key".' },
                { n: 3, text: "Copy the key (starts with nvapi-…)." },
                {
                  n: 4,
                  text: 'In the Hercules App Builder, open Advanced → Secrets. Add key: NVIDIA_API_KEY, value: your key.',
                },
              ]}
              link="https://build.nvidia.com/settings/api-key"
              envKey="NVIDIA_API_KEY"
            />
          </div>
        </Section>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex justify-end pb-8"
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 min-w-[120px]"
          >
            {saved ? (
              <>
                <Check className="size-4" />
                Saved!
              </>
            ) : saving ? (
              "Saving…"
            ) : (
              "Save settings"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  delay,
  children,
}: {
  icon: ElementType;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl bg-card border border-border p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function KeyStatusBadge({ label, active }: { label: string; active: boolean | null }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all",
      active === null
        ? "bg-muted/40 border-border text-muted-foreground"
        : active
        ? "bg-green-500/10 border-green-500/25 text-green-400"
        : "bg-red-500/10 border-red-500/25 text-red-400"
    )}>
      {active === null ? (
        <div className="size-2.5 rounded-full bg-muted-foreground/40 animate-pulse" />
      ) : active ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <XCircle className="size-3" />
      )}
      {label}
      <span className="opacity-70">
        {active === null ? "checking…" : active ? "configured" : "missing"}
      </span>
    </div>
  );
}

type Step = { n: number; text: string };

function ProviderGuide({
  name,
  color,
  accent,
  steps,
  link,
  envKey,
}: {
  name: string;
  color: string;
  accent: string;
  steps: Step[];
  link: string;
  envKey: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border bg-gradient-to-br p-4 space-y-3", accent, color)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex items-center gap-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-3" />
            Dashboard
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs px-2.5 py-1 rounded-full border border-current/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {open ? "Hide guide" : "Show guide"}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-2.5 overflow-hidden"
        >
          <ol className="space-y-2">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-3 text-sm">
                <span className="size-5 rounded-full bg-background/60 border border-border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {step.n}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-2 px-3 py-2 rounded-lg bg-background/50 border border-border/60">
            <p className="text-[11px] text-muted-foreground font-mono">
              Secret key: <span className="text-foreground font-semibold">{envKey}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
