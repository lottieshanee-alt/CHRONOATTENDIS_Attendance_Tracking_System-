import React from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANDING_IMAGES, ImageSlot } from './images';

interface PhotoFrameProps {
  slot: ImageSlot;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  priority?: boolean;
  caption?: string;
  children?: React.ReactNode;
}

export function PhotoFrame({
  slot,
  className,
  aspectClassName = 'aspect-[4/5] md:aspect-[5/4]',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  caption,
  children,
}: PhotoFrameProps) {
  const config = LANDING_IMAGES[slot];
  const displayCaption = caption || (config.src ? config.alt : `Placeholder: ${config.label}`);

  return (
    <div
      className={cn(
        'relative rounded-[20px] border border-slate-200 overflow-hidden bg-[#e3ecf7]/30 shadow-raised flex flex-col',
        aspectClassName,
        className
      )}
    >
      <div className="relative flex-1 w-full overflow-hidden">
        {config.src ? (
          <Image
            src={config.src}
            alt={config.alt}
            fill
            priority={priority || config.priority}
            sizes={sizes}
            className="object-cover"
            style={{ objectPosition: config.objectPosition ?? 'center' }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none"
            role="img"
            aria-label={config.alt || config.label}
          >
            <div className="w-12 h-12 rounded-[12px] bg-white border border-slate-200 shadow-raised flex items-center justify-center text-[#1b4780] mb-2.5">
              <Camera className="w-5 h-5 text-[#1b4780]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-[#0a1c33]">
              {config.label}
            </span>
          </div>
        )}

        {/* Foreground overlays such as sample scan result card */}
        {children}
      </div>

      {/* Institutional Caption Bar inside frame */}
      {displayCaption && (
        <div className="w-full px-4 py-2 bg-white/95 border-t border-slate-200 text-center select-none">
          <p className="text-xs font-medium text-slate-500 truncate">
            {displayCaption}
          </p>
        </div>
      )}
    </div>
  );
}
