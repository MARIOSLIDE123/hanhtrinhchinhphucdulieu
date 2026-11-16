import React from 'react';
import { Sparkles, HelpCircle, CheckCircle2, AlertCircle, Heart } from 'lucide-react';

export type ScratchCatMood = 'happy' | 'cheering' | 'thinking' | 'encourage';

interface ScratchCatGuideProps {
  message: string;
  mood?: ScratchCatMood;
  compact?: boolean;
  title?: string;
  className?: string;
}

const MOOD_CONFIG: Record<
  ScratchCatMood,
  {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    label: string;
    Icon: React.ElementType;
  }
> = {
  happy: {
    border: 'border-[#FF9850]/40',
    bg: 'bg-white',
    badgeBg: 'bg-[#FF9850]/15',
    badgeText: 'text-[#D96B00]',
    label: 'Mèo Scratch đồng hành',
    Icon: Sparkles,
  },
  cheering: {
    border: 'border-[#38C9B1]/40',
    bg: 'bg-[#38C9B1]/10',
    badgeBg: 'bg-[#38C9B1]/20',
    badgeText: 'text-[#127A69]',
    label: 'Chính xác! Xuất sắc',
    Icon: CheckCircle2,
  },
  thinking: {
    border: 'border-[#A88BFA]/40',
    bg: 'bg-[#A88BFA]/10',
    badgeBg: 'bg-[#A88BFA]/20',
    badgeText: 'text-[#6D3ECF]',
    label: 'Gợi ý từ Mèo Scratch',
    Icon: HelpCircle,
  },
  encourage: {
    border: 'border-[#FFB800]/40',
    bg: 'bg-[#FFB800]/10',
    badgeBg: 'bg-[#FFB800]/20',
    badgeText: 'text-[#A66F00]',
    label: 'Cố lên bạn nhé!',
    Icon: Heart,
  },
};

export function ScratchCatAvatar({
  mood = 'happy',
  size = 64,
  className = '',
}: {
  mood?: ScratchCatMood;
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFF2D6] to-[#FFE0B2] p-1 shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tai trái */}
        <polygon points="18,12 34,36 12,38" fill="#FF8C1A" stroke="#E66B00" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="19,17 30,34 16,35" fill="#FFE5A3" />

        {/* Tai phải */}
        <polygon points="82,12 88,38 66,36" fill="#FF8C1A" stroke="#E66B00" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="81,17 84,35 70,34" fill="#FFE5A3" />

        {/* Đầu mèo */}
        <ellipse cx="50" cy="52" rx="38" ry="32" fill="#FF8C1A" stroke="#E66B00" strokeWidth="2.5" />

        {/* Má trắng hai bên */}
        <ellipse cx="32" cy="62" rx="16" ry="14" fill="#FFFFFF" />
        <ellipse cx="68" cy="62" rx="16" ry="14" fill="#FFFFFF" />
        <ellipse cx="50" cy="60" rx="14" ry="10" fill="#FFFFFF" />

        {/* Mắt trái */}
        <ellipse cx="37" cy="46" rx="7.5" ry="9" fill="#FFFFFF" stroke="#222" strokeWidth="1.5" />
        <ellipse cx="38" cy="46" rx="4.5" ry="6" fill="#2389D8" />
        <circle cx="39.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="36.5" cy="47.5" r="1" fill="#FFFFFF" />

        {/* Mắt phải */}
        <ellipse cx="63" cy="46" rx="7.5" ry="9" fill="#FFFFFF" stroke="#222" strokeWidth="1.5" />
        <ellipse cx="62" cy="46" rx="4.5" ry="6" fill="#2389D8" />
        <circle cx="63.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="60.5" cy="47.5" r="1" fill="#FFFFFF" />

        {/* Mũi hồng */}
        <polygon points="50,56 46,51 54,51" fill="#FF4D6D" stroke="#D61845" strokeWidth="1" strokeLinejoin="round" />

        {/* Miệng mèo */}
        {mood === 'cheering' ? (
          <path
            d="M44 60 C46 67, 54 67, 56 60 Z"
            fill="#FF4D6D"
            stroke="#222"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ) : mood === 'thinking' ? (
          <path
            d="M45 61 Q50 63 55 59"
            stroke="#222"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M43 59 Q47 64 50 60 Q53 64 57 59"
            stroke="#222"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Râu trái */}
        <line x1="8" y1="56" x2="26" y2="59" stroke="#E66B00" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="65" x2="26" y2="64" stroke="#E66B00" strokeWidth="2" strokeLinecap="round" />

        {/* Râu phải */}
        <line x1="92" y1="56" x2="74" y2="59" stroke="#E66B00" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="65" x2="74" y2="64" stroke="#E66B00" strokeWidth="2" strokeLinecap="round" />

        {/* Cặp má hồng */}
        <ellipse cx="23" cy="62" rx="4" ry="2.5" fill="#FF8099" opacity="0.6" />
        <ellipse cx="77" cy="62" rx="4" ry="2.5" fill="#FF8099" opacity="0.6" />
      </svg>

      {/* Huy hiệu nhỏ trang trí theo tâm trạng */}
      {mood === 'cheering' && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD34F] text-xs font-black shadow-xs">
          ⭐
        </span>
      )}
      {mood === 'thinking' && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#A88BFA] text-xs font-black text-white shadow-xs">
          ?
        </span>
      )}
    </div>
  );
}

export function ScratchCatGuide({
  message,
  mood = 'happy',
  compact = false,
  title,
  className = '',
}: ScratchCatGuideProps) {
  const config = MOOD_CONFIG[mood];
  const Icon = config.Icon;

  return (
    <div
      className={`flex items-start gap-3.5 rounded-3xl border ${config.border} ${config.bg} ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      } card-3d shadow-xs transition-all duration-200 ${className}`}
    >
      <ScratchCatAvatar mood={mood} size={compact ? 52 : 64} />

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${config.badgeBg} ${config.badgeText}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{title || config.label}</span>
          </span>
        </div>
        <p
          className={`mt-1.5 font-medium leading-relaxed text-slate-800 ${
            compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
