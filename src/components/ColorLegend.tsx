import React from 'react';
import { Pencil } from 'lucide-react';
import { PropertyColor } from '../utils/colorGenerator';

interface ColorLegendProps {
    propertyColors: Map<string, PropertyColor>;
    className?: string;
    onEditColor?: (propertyId: string) => void;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ propertyColors, className = '', onEditColor }) => {
    const colors = Array.from(propertyColors.values());

    if (colors.length === 0) {
        return null;
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Properties</h3>
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                    <div
                        key={color.propertyId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-transform hover:scale-105 group relative"
                        style={{
                            backgroundColor: color.backgroundColor,
                            color: color.textColor,
                        }}
                        title={color.propertyName}
                    >
                        <span className="truncate max-w-[200px]">{color.propertyName}</span>
                        {onEditColor && (
                            <button
                                onClick={() => onEditColor(color.propertyId)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded cursor-pointer"
                                title="Edit color"
                                style={{ color: color.textColor }}
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
