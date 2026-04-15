
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  mode: "base" | "child";
  parentName?: string;
};

export function CreateEnvDialog({ open, onClose, onCreate, mode, parentName }: Props) {
  const [name, setName] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    onClose();
  }

  const placeholder =
    mode === "base" ? "e.g. Production Base" : `e.g. ${parentName ?? "Base"} – Staging`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "base" ? "Create base environment" : "Create child environment"}
          </DialogTitle>
        </DialogHeader>

        {mode === "child" && parentName && (
          <p className="text-sm text-muted-foreground -mt-2">
            Will inherit all variables from <strong>{parentName}</strong>.
          </p>
        )}

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="env-name">Name</Label>
            <Input
              id="env-name"
              placeholder={placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") onClose();
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
