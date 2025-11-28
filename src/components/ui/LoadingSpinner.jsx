import React from 'react';

/**
 * Loading Spinner Component
 * 
 * @param {string} size - Spinner size (sm, md, lg, xl)
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - Show as full screen overlay
 */
export function LoadingSpinner({
    size = 'md',
    text = 'Loading...',
    fullScreen = false
}) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`
                    ${sizes[size]} 
                    border-indigo-200 
                    border-t-indigo-600 
                    rounded-full 
                    animate-spin
                `}
            ></div>
            {text && (
                <p className="text-gray-600 font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
}

export default LoadingSpinner;
