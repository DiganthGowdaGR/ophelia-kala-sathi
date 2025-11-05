/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are present
 * at application startup. This prevents runtime errors later.
 */

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
  stripePublicKey: string;
  googleMapsApiKey: string;
}

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 * @returns Object containing all validated environment variables
 */
export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  };

  const missingVars: string[] = [];

  // Check each required variable
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  // If any vars are missing, throw error with helpful message
  if (missingVars.length > 0) {
    const missingList = missingVars
      .map((v) => `VITE_${v.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
      .join(', ');

    throw new Error(
      `Missing required environment variables: ${missingList}\n\n` +
      'Please check your .env file and ensure all required variables are set. ' +
      'You can use .env.example as a template.'
    );
  }

  return requiredVars as EnvironmentConfig;
}

/**
 * Get a specific environment variable with type safety
 * @param key The environment variable key
 * @returns The environment variable value
 * @throws Error if the variable is not set
 */
export function getEnvVar(key: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (!value) {
    throw new Error(`Environment variable ${String(key)} is not set`);
  }
  return value;
}

/**
 * Safely get an environment variable with a default fallback
 * @param key The environment variable key
 * @param defaultValue The default value if not set
 * @returns The environment variable value or the default
 */
export function getEnvVarOptional(
  key: string,
  defaultValue: string = ''
): string {
  return (import.meta.env[key as keyof ImportMetaEnv] as string) || defaultValue;
}