
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Hash, SkipForward } from "lucide-react";
import { type EnvVar } from "@/lib/mockApi";

type ParsedLine =
  | { kind: "var"; key: string; value: string; duplicate: boolean }
  | { kind: "comment"; raw: string }
  | { kind: "empty" }
  | { kind: "invalid"; raw: string };

type Props = {
  open: boolean;
  onClose: () => void;
  existingKeys: string[];
  onImport: (vars: EnvVar[]) => void;
};

function parseEnvText(text: string): ParsedLine[] {
  const lines = text.split("\n");
  const seen = new Map<string, number>();
  const parsed: ParsedLine[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      parsed.push({ kind: "empty" });
      continue;
    }
    if (trimmed.startsWith("#")) {
      parsed.push({ kind: "comment", raw: trimmed });
      continue;
    }
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      parsed.push({ kind: "invalid", raw: trimmed });
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim().toUpperCase().replace(/\s+/g, "_");
    const value = trimmed.slice(eqIdx + 1);
    if (!key) {
      parsed.push({ kind: "invalid", raw: trimmed });
      continue;
    }
    const prevIdx = seen.get(key);
    if (prevIdx !== undefined) {
      const prev = parsed[prevIdx];
      if (prev.kind === "var") {
        parsed[prevIdx] = { ...prev, duplicate: true };
      }
    }
    seen.set(key, parsed.length);
    parsed.push({ kind: "var", key, value, duplicate: false });
  }

  return parsed;
}

export function BulkImportDialog({ open, onClose, existingKeys, onImport }: Props) {
  const [text, setText] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");

  const parsed = useMemo(() => parseEnvText(text), [text]);

  const finalVars = useMemo(
    () =>
      parsed
        .filter((l): l is Extract<ParsedLine, { kind: "var" }> => l.kind === "var" && !l.duplicate)
        .map((l) => ({ key: l.key, value: l.value })),
    [parsed]
  );

  const commentCount = parsed.filter((l) => l.kind === "comment").length;
  const duplicateCount = parsed.filter((l) => l.kind === "var" && l.duplicate).length;
  const invalidCount = parsed.filter((l) => l.kind === "invalid").length;
  const overwriteCount = finalVars.filter((v) => existingKeys.includes(v.key)).length;

  function handleImport() {
    onImport(finalVars);
    setText("");
    setStep("input");
    onClose();
  }

  function handleClose() {
    setText("");
    setStep("input");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk import variables</DialogTitle>
        </DialogHeader>

        {step === "input" ? (
          <>
            <p className="text-sm text-muted-foreground -mt-2">
              Paste your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> content below.
              Comments are ignored, duplicates use the last value.
            </p>
            <Textarea
              placeholder={`DATABASE_HOST=localhost\nDATABASE_PORT=5432\nDATABASE_NAME=mydb\n# this line is ignored\nDATABASE_USER=admin\nDATABASE_PASSWORD=`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono text-sm min-h-[240px] resize-none flex-1"
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep("preview")}
                disabled={finalVars.length === 0}
              >
                Preview ({finalVars.length} variable{finalVars.length !== 1 ? "s" : ""})
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 -mt-1">
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {finalVars.length} to import
              </Badge>
              {commentCount > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  {commentCount} comment{commentCount !== 1 ? "s" : ""} ignored
                </Badge>
              )}
              {duplicateCount > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <SkipForward className="h-3 w-3 text-amber-500" />
                  {duplicateCount} duplicate{duplicateCount !== 1 ? "s" : ""} skipped
                </Badge>
              )}
              {invalidCount > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  {invalidCount} invalid line{invalidCount !== 1 ? "s" : ""} skipped
                </Badge>
              )}
              {overwriteCount > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1 text-xs border-amber-400 text-amber-600 dark:text-amber-400"
                >
                  <AlertCircle className="h-3 w-3" />
                  {overwriteCount} will overwrite existing
                </Badge>
              )}
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg divide-y divide-border">
              {finalVars.map((v) => {
                const willOverwrite = existingKeys.includes(v.key);
                return (
                  <div
                    key={v.key}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                      willOverwrite ? "bg-amber-50 dark:bg-amber-950/20" : "bg-background"
                    }`}
                  >
                    <span className="font-mono font-semibold text-foreground shrink-0 max-w-[220px] truncate">
                      {v.key}
                    </span>
                    <span className="text-muted-foreground/50">=</span>
                    <span className="font-mono text-muted-foreground truncate flex-1">
                      {v.value === "" ? (
                        <span className="italic text-muted-foreground/50">(empty)</span>
                      ) : (
                        v.value
                      )}
                    </span>
                    {willOverwrite && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 shrink-0 border-amber-400 text-amber-600 dark:text-amber-400"
                      >
                        overwrites
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("input")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {finalVars.length} variable{finalVars.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
