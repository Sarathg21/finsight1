import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

const ChartPanel = ({ title, children, height = 220, compact = true, titleClassName = "" }) => {
    const [isReady, setIsReady] = useState(false);
    const wrapperRef = useRef(null);
    const resolvedHeight = typeof height === 'number' ? height : Number(height) || 220;

    useEffect(() => {
        const node = wrapperRef.current;
        if (!node) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height: containerHeight } = entry.contentRect;
            setIsReady(width > 0 && containerHeight > 0);
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div className={`bg-white rounded-3xl shadow-lg border border-slate-200/50 mesh-gradient relative overflow-hidden card-gloss ${compact ? 'p-4' : 'p-6'}`}>
            {/* Top glass accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-40" />

            <h3 className={`font-bold tracking-tight text-slate-800 capitalize ${titleClassName || (compact ? 'text-xs mb-3' : 'text-sm mb-6')}`}>
                {title}
            </h3>
            <div ref={wrapperRef} className="relative z-10 w-full" style={{ minHeight: resolvedHeight, width: '100%' }}>
                {isReady ? (
                    <ResponsiveContainer width="100%" height={resolvedHeight} minWidth={1} minHeight={resolvedHeight}>
                        {children}
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
};

export default ChartPanel;
