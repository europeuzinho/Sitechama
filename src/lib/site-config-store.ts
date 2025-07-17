
export interface SiteConfig {
    siteName: string;
    logoUrl: string;
}

const SITE_CONFIG_STORAGE_KEY = 'siteConfig';

const defaultConfig: SiteConfig = {
    siteName: 'Chama',
    logoUrl: 'https://i.postimg.cc/02JrbrvV/Chat-GPT-Image-16-de-jul-de-2025-13-56-36.png',
};

/**
 * Retrieves the site configuration from localStorage.
 */
export function getSiteConfig(): SiteConfig {
    if (typeof window === 'undefined') {
        return defaultConfig;
    }

    try {
        const storedConfigStr = window.localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
        if (storedConfigStr) {
            return JSON.parse(storedConfigStr);
        }
        
        window.localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(defaultConfig));
        return defaultConfig;

    } catch (error) {
        console.error("Failed to parse site config from localStorage", error);
        return defaultConfig;
    }
}

/**
 * Updates the site configuration in localStorage.
 * @param newConfig The new configuration object.
 * @returns `true` if successful, `false` if a quota error occurred.
 */
export function updateSiteConfig(newConfig: Partial<SiteConfig>): boolean {
    if (typeof window === 'undefined') return false;
    
    const currentConfig = getSiteConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    try {
        window.localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
        window.dispatchEvent(new CustomEvent('siteConfigChanged'));
        return true;
    } catch (error) {
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
             return false;
        } else {
            console.error("An unexpected error occurred while saving site config:", error);
            return false;
        }
    }
}
