import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoPlaceholderProps {
  videoSrc?: string;
  posterSrc?: string;
  accentColor?: string;
  title?: string;
}

const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  videoSrc,
  posterSrc,
  accentColor = '#3713ec',
  title = 'Demo in arrivo',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const glowStyle = isHovered
    ? { boxShadow: `0 20px 60px ${accentColor}33, 0 8px 32px rgba(0,0,0,0.2)` }
    : { boxShadow: '0 8px 32px rgba(0,0,0,0.12)' };

  return (
    <motion.div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
        transition: 'box-shadow 0.4s ease, transform 0.3s ease',
        ...glowStyle,
      }}
      whileHover={{ scale: 1.015 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <>
          {/* Gradient background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 30% 50%, ${accentColor}22 0%, transparent 60%),
                           radial-gradient(ellipse at 70% 50%, ${accentColor}11 0%, transparent 60%),
                           linear-gradient(135deg, #0a0a0f 0%, #13131a 50%, #0d0d14 100%)`,
            }}
          />

          {/* Grid overlay for depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Poster image if provided */}
          {posterSrc && (
            <img
              src={posterSrc}
              alt={title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.35,
              }}
            />
          )}

          {/* Play button + label */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {/* Animated play ring */}
            <motion.div
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `2px solid ${accentColor}`,
                }}
              />
              {/* Play circle */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `rgba(255,255,255,0.1)`,
                  border: `1.5px solid rgba(255,255,255,0.2)`,
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4.5L15.5 10L6 15.5V4.5Z" fill="white" />
                </svg>
              </div>
            </motion.div>

            {/* Label */}
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {title}
              </p>
              <p
                style={{
                  color: accentColor,
                  fontSize: '11px',
                  fontWeight: 500,
                  fontFamily: '"Inter", sans-serif',
                  marginTop: '4px',
                  opacity: 0.8,
                }}
              >
                Video dimostrativo
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default VideoPlaceholder;
