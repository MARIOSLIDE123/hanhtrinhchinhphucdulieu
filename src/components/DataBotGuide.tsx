import { Bot, Sparkles } from 'lucide-react';
import { ASSET_PATHS } from '../data/lessonData';

export type RobotMood = 'happy' | 'cheering' | 'thinking' | 'encourage';

interface DataBotGuideProps {
  message: string;
  mood?: RobotMood;
  compact?: boolean;
}

const MOOD_STYLES: Record<RobotMood, { border: string; bg: string; label: string }> = {
  happy: {
    border: 'border-[#2389D8]/25',
    bg: 'bg-white',
    label: 'DataBot hướng dẫn',
  },
  cheering: {
    border: 'border-[#38C9B1]/45',
    bg: 'bg-[#38C9B1]/10',
    label: 'Chính xác',
  },
  thinking: {
    border: 'border-[#A88BFA]/35',
    bg: 'bg-[#A88BFA]/10',
    label: 'Gợi ý từ DataBot',
  },
  encourage: {
    border: 'border-[#FF9850]/45',
    bg: 'bg-[#FF9850]/10',
    label: 'Thử lại nhé',
  },
};

export function DataBotGuide({ message, mood = 'happy', compact = false }: DataBotGuideProps) {
  const style = MOOD_STYLES[mood];

  return (
    <div
      className={`flex items-center gap-4 rounded-3xl border ${style.border} ${style.bg} ${
        compact ? 'px-4 py-3' : 'px-5 py-4'
      } card-3d transition-all duration-200`}
    >
      <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-[#E8F4FF] ${compact ? 'h-14 w-14' : 'h-16 w-16'}`}>
        <img
          src={ASSET_PATHS.robot}
          alt="Robot DataBot 3D"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-[#2389D8]/15 text-[#2389D8]">
          <Bot className="h-8 w-8" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2389D8]">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>{style.label}</span>
        </div>
        <p className={`${compact ? 'text-sm' : 'text-base'} mt-0.5 font-medium leading-relaxed text-slate-800`}>
          {message}
        </p>
      </div>
    </div>
  );
}
