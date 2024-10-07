const interpolateValue = (value: string): string => {
  return value.replace(/\${(\w+)}/g, (_, key) => process.env[key] || '');
};

export function interpolateEnvVariables(
  env: NodeJS.ProcessEnv,
): Record<string, string> {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      process.env[key] = interpolateValue(value);
    }
  }

  return env;
}
