
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  existingKeys?: string[];
  onAdd: (key: string, value: string) => void;
};

export function AddVarForm({ existingKeys = [], onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const keyError =
    key && existingKeys.includes(key.trim().toUpperCase())
      ? "Key already exists"
      : null;

  function handleAdd() {
    const trimmedKey = key.trim().toUpperCase().replace(/\s+/g, "_");
    if (!trimmedKey || keyError) return;
    onAdd(trimmedKey, value);
    setKey("");
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 mt-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add variable
      </Button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2 p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="VARIABLE_NAME"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setOpen(false);
            }}
            className="font-mono text-sm h-8"
            autoFocus
          />
          {keyError && (
            <p className="text-destructive text-xs mt-1">{keyError}</p>
          )}
        </div>
        <Input
          placeholder="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setOpen(false);
          }}
          className="font-mono text-sm h-8 flex-1"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd} disabled={!key || !!keyError}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
