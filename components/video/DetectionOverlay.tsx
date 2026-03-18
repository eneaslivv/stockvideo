'use client';

import { motion } from 'framer-motion';
import type { BoundingBox } from '@/types';
import { cn } from '@/lib/utils/cn';

interface DetectionOverlayProps {
  boxes: BoundingBox[];
  imageWidth: number;
  imageHeight: number;
}

export default function DetectionOverlay({ boxes, imageWidth, imageHeight }: DetectionOverlayProps) {
  if (!boxes || boxes.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
      preserveAspectRatio="none"
    >
      {boxes.map((box, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.15, duration: 0.3 }}
        >
          <rect
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            fill="none"
            stroke="#C8FF00"
            strokeWidth={2}
            rx={4}
          />
          <rect
            x={box.x}
            y={box.y - 20}
            width={box.label.length * 8 + 12}
            height={20}
            fill="#C8FF00"
            rx={4}
          />
          <text
            x={box.x + 6}
            y={box.y - 6}
            fill="#0A0A0A"
            fontSize={11}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {box.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
