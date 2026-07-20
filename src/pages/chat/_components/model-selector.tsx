"use client";

import { useState } from "react";
import { Cpu, ChevronDown, Network, Check } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { GATEWAYS, getModel, getModelsByGateway, type Gateway, type AIModel } from "@/lib/models";

interface Props {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ selectedModelId, onModelChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeGateway, setActiveGateway] = useState<string>(
    getModel(selectedModelId).gateway
  );
  const selectedModel = getModel(selectedModelId);

  const gatewayModels = getModelsByGateway(activeGateway);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
      >
        <Cpu className="size-3 text-primary" />
        <span className="font-medium">{selectedModel.name}</span>
        <span className="text-muted-foreground/60">·</span>
        <span className="capitalize">{selectedModel.gateway === "openrouter" ? "OpenRouter" : "NVIDIA"}</span>
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-20 w-80 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Gateway tabs */}
            <div className="flex border-b border-border">
              {GATEWAYS.map((gw: Gateway) => (
                <button
                  key={gw.id}
                  onClick={() => setActiveGateway(gw.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors cursor-pointer",
                    activeGateway === gw.id
                      ? "text-primary bg-primary/10 border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {gw.id === "nvidia" ? (
                    <Cpu className="size-3" />
                  ) : (
                    <Network className="size-3" />
                  )}
                  {gw.name}
                </button>
              ))}
            </div>

            {/* Gateway description */}
            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/50 bg-muted/20">
              {GATEWAYS.find((g: Gateway) => g.id === activeGateway)?.description}
            </div>

            {/* Models */}
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {gatewayModels.map((model: AIModel) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors cursor-pointer",
                    selectedModelId === model.id && "bg-primary/10"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.contextLength && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {model.contextLength >= 1000000
                            ? `${model.contextLength / 1000000}M ctx`
                            : `${model.contextLength / 1000}K ctx`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{model.description}</p>
                  </div>
                  {selectedModelId === model.id && (
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
