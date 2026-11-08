import React, { useMemo } from 'react';
import { encodeCode128 } from '../utils/barcode';

interface BarcodeDisplayProps {
  value: string;
  height?: number;
  showText?: boolean;
  className?: string;
  barColor?: string;
  bgColor?: string;
  onClick?: () => void;
  title?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  height = 42,
  showText = true,
  className = '',
  barColor = '#0f172a',
  bgColor = '#ffffff',
  onClick,
  title
}) => {
  const barcodeData = useMemo(() => {
    return encodeCode128(value);
  }, [value]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded px-2 py-1 ${className}`}>
        Sem código
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      title={title || `Código de barras: ${value}`}
      className={`inline-flex flex-col items-center bg-white rounded-lg p-1.5 border border-slate-200/80 shadow-xs select-none transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md hover:scale-[1.02]' : ''
      } ${className}`}
    >
      <svg
        viewBox={`0 0 ${barcodeData.totalWidth} ${height}`}
        className="w-full max-w-[240px] h-auto overflow-hidden"
        style={{ maxHeight: `${height}px` }}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Código de barras ${value}`}
      >
        <rect width="100%" height="100%" fill={bgColor} />
        {barcodeData.bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height - 4}
            fill={barColor}
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono-code font-bold text-[11px] tracking-wider text-slate-800 mt-1 select-all">
          {value}
        </span>
      )}
    </div>
  );
};
