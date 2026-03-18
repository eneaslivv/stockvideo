'use client';

import { motion } from 'framer-motion';

interface AudioWaveformProps {
  data: number[];
  color?: string;
}

export default function AudioWaveform({ data, color = '#C8FF00' }: AudioWaveformProps) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-16 w-full px-4">
      {data.map((value, i) => (
        <motion.div
          key={i}
          animate={{ height: `${Math.max(4, value * 64)}px` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="w-1 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.4 + value * 0.6,
          }}
        />
      ))}
    </div>
  );
}
