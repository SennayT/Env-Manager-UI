
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  GitBranch,
  Database,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EnvVarRow } from "./EnvVarRow";
import { AddVarForm } from "./AddVarForm";
import { mockApi, type Environment, type EnvVar } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

type Props = {
  env: Environment;
  allEnvs: Environment[];
  onUpdate: (id: string, patch: Partial<{ name: string; variables: EnvVar[] }>) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  defaultOpen?: boolean;
};

export function EnvironmentCard({
  env,
  allEnvs,
  onUpdate,
  onDelete,
  onCreateChild,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(env.name);
  const { toast } = useToast();

  const resolved = mockApi.resolveVariables(env, allEnvs);
  const ownKeys = new Set(env.variables.map((v) => v.key));
  const childCount = allEnvs.filter((e) => e.parentId === env.id).length;

  function handleNameSave() {
    if (nameValue.trim()) {
      onUpdate(env.id, { name: nameValue.trim() });
    }
    setEditingName(false);
  }

  function handleAddVar(key: string, value: string) {
    const next = [...env.variables, { key, value }];
    onUpdate(env.id, { variables: next });
    toast({ title: "Variable added", description: key });
  }

  function handleSaveVar(key: string, value: string) {
    const next = env.variables.map((v) => (v.key === key ? { key, value } : v));
    onUpdate(env.id, { variables: next });
    toast({ title: "Variable updated", description: key });
  }

  function handleDeleteVar(key: string) {
    const next = env.variables.filter((v) => v.key !== key);
    onUpdate(env.id, { variables: next });
    toast({ title: "Variable removed", description: key, variant: "destructive" });
  }

  function handleCopyAll() {
    const text = resolved.map((v) => `${v.key}=${v.value}`).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: `${resolved.length} variables` });
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        env.isBase
          ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
          : "border-border bg-card"
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <span
          className={`flex items-center justify-center rounded-md p-1.5 ${
            env.isBase ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {env.isBase ? (
            <Database className="h-3.5 w-3.5" />
          ) : (
            <GitBranch className="h-3.5 w-3.5" />
          )}
        </span>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {editingName ? (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="h-7 text-sm w-48"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-green-600"
                onClick={handleNameSave}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingName(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <span className="font-semibold text-sm truncate">{env.name}</span>
          )}

          {env.isBase && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
              base
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-muted-foreground">
            {resolved.length} vars
            {childCount > 0 && ` · ${childCount} child${childCount !== 1 ? "ren" : ""}`}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Copy all as .env"
            onClick={handleCopyAll}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          {!editingName && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setNameValue(env.name);
                setEditingName(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          {!env.isBase && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(env.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="mt-3 flex flex-col gap-1.5">
            {resolved.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">
                No variables yet.
              </p>
            ) : (
              resolved.map((v) => {
                const isInherited = mockApi.isInherited(v.key, env, allEnvs);
                const isOverridden = mockApi.isOverridden(v.key, env, allEnvs) && ownKeys.has(v.key);
                return (
                  <EnvVarRow
                    key={v.key}
                    varKey={v.key}
                    value={v.value}
                    inherited={isInherited}
                    overridden={isOverridden}
                    readOnly={isInherited}
                    onSave={handleSaveVar}
                    onDelete={handleDeleteVar}
                  />
                );
              })
            )}
          </div>

          <AddVarForm
            existingKeys={env.variables.map((v) => v.key)}
            onAdd={handleAddVar}
          />

          {env.isBase && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onCreateChild(env.id)}
              >
                <GitBranch className="h-3.5 w-3.5" />
                Create child environment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
