export interface ServiceColorScheme {
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
  accent: string;
}

type ColorPalette = {
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
  accent: string;
};

// PhoenixAI Studio consistent orange theme
const phoenixAITheme: ColorPalette = {
  primary: '#FF6A00',
  secondary: '#FF9F1A',
  glow: 'rgba(255, 106, 0, 0.3)',
  gradient: 'linear-gradient(135deg, #FF6A00, #FF9F1A)',
  accent: '#FF8A33'
};

const colorPalettes: Record<string, ColorPalette> = {
  // All services use the same PhoenixAI orange theme
  'default': phoenixAITheme,
};

/**
 * Generate color scheme based on service category, name, or description
 * All services now use the consistent PhoenixAI orange theme
 * @param category - The category of the service (unused, kept for API compatibility)
 * @param serviceName - The name of the service (unused, kept for API compatibility)
 * @param description - The description of the service (unused, kept for API compatibility)
 * @returns The PhoenixAI orange color scheme
 */
export function getServiceColorScheme(
  category?: string,
  serviceName?: string,
  description?: string
): ServiceColorScheme {
  // Always return the PhoenixAI orange theme for consistency
  return phoenixAITheme;
}

/**
 * Generate a random color scheme for services without clear categorization
 * Now returns the consistent PhoenixAI orange theme
 * @param seed - Optional seed (unused, kept for API compatibility)
 * @returns The PhoenixAI orange color scheme
 */
export function generateRandomColorScheme(seed?: string): ServiceColorScheme {
  // Always return the PhoenixAI orange theme for consistency
  return phoenixAITheme;
}

/**
 * Get all available color palettes (for admin reference)
 * @returns The color palettes object
 */
export function getColorPalettes(): Record<string, ColorPalette> {
  return colorPalettes;
}
