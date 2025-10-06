import { StartScreenPrompt } from "@openai/chatkit";

export const CHATKIT_API_URL =
  import.meta.env.VITE_CHATKIT_API_URL ?? "/chatkit";

/**
 * ChatKit still expects a domain key at runtime. Use any placeholder locally,
 * but register your production domain at
 * https://platform.openai.com/settings/organization/security/domain-allowlist
 * and deploy the real key.
 */
export const CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_localhost_dev";

export const ASSETS_API_URL =
  import.meta.env.VITE_ASSETS_API_URL ?? "/assets";

export const THEME_STORAGE_KEY = "chatkit-boilerplate-theme";

export const GREETING = "Let's build a standout ad together";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Launch campaign",
    prompt: "I want an ad for a new productivity app",
    icon: "sparkle",
  },
  {
    label: "Refresh brand",
    prompt: "Help me design an ad for our eco-friendly water bottle",
    icon: "cube",
  },
  {
    label: "Seasonal spotlight",
    prompt: "Create a holiday-inspired social ad for our handmade candles",
    icon: "calendar",
  },
];

export const PLACEHOLDER_INPUT = "Tell me what you'd like to advertise";
