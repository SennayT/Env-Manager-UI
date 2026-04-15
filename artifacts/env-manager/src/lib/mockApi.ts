
export type EnvVar = {
  key: string;
  value: string;
};

export type Environment = {
  id: string;
  name: string;
  isBase: boolean;
  parentId: string | null;
  variables: EnvVar[];
  createdAt: string;
};

const STORAGE_KEY = "env_manager_data";

function loadData(): Environment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Environment[];
  } catch {
    return [];
  }
}

function saveData(envs: Environment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envs));
}

function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `env_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const mockApi = {
  async listEnvironments(): Promise<Environment[]> {
    await delay();
    return loadData();
  },

  async getEnvironment(id: string): Promise<Environment | null> {
    await delay();
    const envs = loadData();
    return envs.find((e) => e.id === id) ?? null;
  },

  async createEnvironment(payload: {
    name: string;
    isBase: boolean;
    parentId: string | null;
    variables: EnvVar[];
  }): Promise<Environment> {
    await delay();
    const envs = loadData();
    const newEnv: Environment = {
      id: generateId(),
      name: payload.name,
      isBase: payload.isBase,
      parentId: payload.parentId,
      variables: payload.variables,
      createdAt: new Date().toISOString(),
    };
    envs.push(newEnv);
    saveData(envs);
    return newEnv;
  },

  async updateEnvironment(
    id: string,
    patch: Partial<Pick<Environment, "name" | "variables">>
  ): Promise<Environment> {
    await delay();
    const envs = loadData();
    const idx = envs.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Environment ${id} not found`);
    envs[idx] = { ...envs[idx], ...patch };
    saveData(envs);
    return envs[idx];
  },

  async deleteEnvironment(id: string): Promise<void> {
    await delay();
    const envs = loadData();
    const filtered = envs.filter((e) => e.id !== id && e.parentId !== id);
    saveData(filtered);
  },

  resolveVariables(env: Environment, allEnvs: Environment[]): EnvVar[] {
    if (env.isBase || env.parentId === null) return env.variables;
    const parent = allEnvs.find((e) => e.id === env.parentId);
    if (!parent) return env.variables;
    const parentVars = this.resolveVariables(parent, allEnvs);
    const overriddenKeys = new Set(env.variables.map((v) => v.key));
    const inherited = parentVars.filter((v) => !overriddenKeys.has(v.key));
    return [...inherited, ...env.variables];
  },

  isOverridden(key: string, env: Environment, allEnvs: Environment[]): boolean {
    if (env.isBase || env.parentId === null) return false;
    const parent = allEnvs.find((e) => e.id === env.parentId);
    if (!parent) return false;
    const parentVars = this.resolveVariables(parent, allEnvs);
    return parentVars.some((v) => v.key === key);
  },

  isInherited(key: string, env: Environment, allEnvs: Environment[]): boolean {
    if (env.isBase || env.parentId === null) return false;
    const ownKeys = new Set(env.variables.map((v) => v.key));
    if (ownKeys.has(key)) return false;
    const parent = allEnvs.find((e) => e.id === env.parentId);
    if (!parent) return false;
    const parentVars = this.resolveVariables(parent, allEnvs);
    return parentVars.some((v) => v.key === key);
  },
};
