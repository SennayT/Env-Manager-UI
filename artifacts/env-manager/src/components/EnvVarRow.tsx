
import { useState } from "react";
import { Pencil, Trash2, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
  varKey: string;
  value: string;
  inherited?: boolean;
  overridden?: boolean;
  readOnly?: boolean;
  onSave?: (key: string, value: string) => void;
  onDelete?: (key: string) => void;
};

export function EnvVarRow({
  varKey,
  value,
  inherited = false,
  overridden = false,
  readOnly = false,
  onSave,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [revealed, setRevealed] = useState(false);

  function handleSave() {
    onSave?.(varKey, editValue);
    setEditing(false);
  }

  function handleCancel() {
    setEditValue(value);
    setEditing(false);
  }

  const isSecret =
    varKey.toLowerCase().includes("secret") ||
    varKey.toLowerCase().includes("password") ||
    varKey.toLowerCase().includes("token") ||
    varKey.toLowerCase().includes("key");

  const displayValue = isSecret && !revealed ? "••••••••••••" : value;

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
        inherited
          ? "bg-muted/40 border-border/40"
          : overridden
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40"
          : "bg-card border-border hover:border-border/80"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="font-mono text-sm font-semibold text-foreground truncate shrink-0 max-w-[200px]">
          {varKey}
        </span>
        <span className="text-muted-foreground/50">=</span>
        {editing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="h-7 text-sm font-mono flex-1"
            autoFocus
          />
        ) : (
          <span className="font-mono text-sm text-muted-foreground truncate flex-1">
            {displayValue}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {inherited && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            inherited
          </Badge>
        )}
        {overridden && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600 dark:text-amber-400"
          >
            overridden
          </Badge>
        )}

        {!readOnly && (
          <>
            {isSecret && !editing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setRevealed((r) => !r)}
              >
                {revealed ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            )}

            {!inherited && !editing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setEditValue(value);
                    setEditing(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => onDelete?.(varKey)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {editing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600 hover:text-green-700"
                  onClick={handleSave}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCancel}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
