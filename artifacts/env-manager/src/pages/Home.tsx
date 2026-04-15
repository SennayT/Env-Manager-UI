
import { useState } from "react";
import { Plus, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { CreateEnvDialog } from "@/components/CreateEnvDialog";
import {
  useEnvironments,
  useCreateEnvironment,
  useUpdateEnvironment,
  useDeleteEnvironment,
} from "@/hooks/useEnvironments";
import { type EnvVar } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: envs = [], isLoading } = useEnvironments();
  const createEnv = useCreateEnvironment();
  const updateEnv = useUpdateEnvironment();
  const deleteEnv = useDeleteEnvironment();
  const { toast } = useToast();

  const [createBaseOpen, setCreateBaseOpen] = useState(false);
  const [createChildConfig, setCreateChildConfig] = useState<{
    open: boolean;
    parentId: string;
    parentName: string;
  }>({ open: false, parentId: "", parentName: "" });

  const baseEnvs = envs.filter((e) => e.isBase);
  const childEnvs = envs.filter((e) => !e.isBase);

  function handleCreateBase(name: string) {
    createEnv.mutate(
      { name, isBase: true, parentId: null, variables: [] },
      {
        onSuccess: () => toast({ title: "Base environment created", description: name }),
      }
    );
  }

  function handleCreateChild(name: string) {
    createEnv.mutate(
      {
        name,
        isBase: false,
        parentId: createChildConfig.parentId,
        variables: [],
      },
      {
        onSuccess: () => toast({ title: "Child environment created", description: name }),
      }
    );
  }

  function handleUpdate(id: string, patch: Partial<{ name: string; variables: EnvVar[] }>) {
    updateEnv.mutate({ id, patch });
  }

  function handleDelete(id: string) {
    const env = envs.find((e) => e.id === id);
    deleteEnv.mutate(id, {
      onSuccess: () =>
        toast({
          title: "Environment deleted",
          description: env?.name,
          variant: "destructive",
        }),
    });
  }

  function handleRequestChild(parentId: string) {
    const parent = envs.find((e) => e.id === parentId);
    setCreateChildConfig({ open: true, parentId, parentName: parent?.name ?? "Base" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const hasNoBase = baseEnvs.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Env Manager</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage environment variables across base and child environments.
              Child envs inherit from their parent and can override individual keys.
            </p>
          </div>
          <Button
            onClick={() => setCreateBaseOpen(true)}
            className="gap-1.5 shrink-0"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New base env
          </Button>
        </div>

        {hasNoBase ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="rounded-full bg-muted p-4">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold">No environments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by creating a base environment, then add child environments that
                inherit its variables.
              </p>
            </div>
            <Button
              onClick={() => setCreateBaseOpen(true)}
              className="gap-1.5 mt-2"
            >
              <Plus className="h-4 w-4" />
              Create base environment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {baseEnvs.map((base) => {
              const children = childEnvs.filter((c) => c.parentId === base.id);
              return (
                <div key={base.id} className="space-y-2">
                  <EnvironmentCard
                    env={base}
                    allEnvs={envs}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onCreateChild={handleRequestChild}
                    defaultOpen={true}
                  />
                  {children.length > 0 && (
                    <div className="ml-6 pl-4 border-l-2 border-border/60 space-y-2">
                      {children.map((child) => (
                        <EnvironmentCard
                          key={child.id}
                          env={child}
                          allEnvs={envs}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onCreateChild={handleRequestChild}
                          defaultOpen={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateEnvDialog
        open={createBaseOpen}
        onClose={() => setCreateBaseOpen(false)}
        onCreate={handleCreateBase}
        mode="base"
      />

      <CreateEnvDialog
        open={createChildConfig.open}
        onClose={() =>
          setCreateChildConfig((c) => ({ ...c, open: false }))
        }
        onCreate={handleCreateChild}
        mode="child"
        parentName={createChildConfig.parentName}
      />
    </div>
  );
}
