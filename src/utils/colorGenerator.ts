/**
 * Generates a distinct color for each property using HSL color space
 * This ensures colors are visually distinct and vibrant
 */

export interface PropertyColor {
    propertyId: string;
    propertyName: string;
    backgroundColor: string;
    textColor: string;
}

/**
 * Generate distinct colors for a list of properties
 * Uses custom colors if provided, otherwise auto-generates using HSL color space
 */
export function generatePropertyColors(properties: Array<{ id: string; name: string; color?: string }>): Map<string, PropertyColor> {
    const colorMap = new Map<string, PropertyColor>();

    if (properties.length === 0) {
        return colorMap;
    }

    // Define color palette with good contrast
    const hues = [
        0,    // Red
        30,   // Orange
        60,   // Yellow
        120,  // Green
        180,  // Cyan
        210,  // Light Blue
        240,  // Blue
        270,  // Purple
        300,  // Magenta
        330,  // Pink
    ];

    properties.forEach((property, index) => {
        let backgroundColor: string;
        let textColor: string;

        // Use custom color if provided, otherwise auto-generate
        if (property.color && property.color.trim() !== '') {
            backgroundColor = property.color;
            // Calculate appropriate text color based on background brightness
            textColor = getContrastTextColor(property.color);
        } else {
            // Auto-generate using HSL
            const hue = hues[index % hues.length];
            const variation = Math.floor(index / hues.length);
            const saturation = 70 - (variation * 10); // 70%, 60%, 50%...
            const lightness = 50 + (variation * 5);   // 50%, 55%, 60%...
            backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            textColor = lightness < 60 ? '#ffffff' : '#000000';
        }

        colorMap.set(property.id, {
            propertyId: property.id,
            propertyName: property.name,
            backgroundColor,
            textColor,
        });
    });

    return colorMap;
}

/**
 * Calculate contrast text color (black or white) for a given background color
 */
function getContrastTextColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance using sRGB formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black text for light backgrounds, white for dark
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Get a default color for when property is not found
 */
export function getDefaultPropertyColor(): PropertyColor {
    return {
        propertyId: '',
        propertyName: 'Unknown',
        backgroundColor: '#6b7280', // gray-500
        textColor: '#ffffff',
    };
}
