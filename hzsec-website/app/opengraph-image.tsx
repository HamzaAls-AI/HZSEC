import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HZSec — Local-first security for developers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'rgb(11, 12, 15)',
          position: 'relative',
        }}
      >
        {/* Subtle purple glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgb(124, 58, 237)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: 'white',
            }}
          >
            H
          </div>
          <span style={{ color: 'rgb(232, 234, 237)', fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            HZSec
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'rgb(232, 234, 237)',
            lineHeight: 1.1,
            letterSpacing: -1.5,
            marginBottom: 24,
          }}
        >
          Security that runs
          <br />
          <span style={{ color: 'rgb(124, 58, 237)' }}>on your machine.</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 24,
            color: 'rgb(140, 148, 160)',
            lineHeight: 1.4,
            maxWidth: 700,
          }}
        >
          Scan for secrets, monitor dependencies, and fix vulnerabilities — no cloud, no data leaving your device.
        </div>

        {/* Bottom tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 80,
            display: 'flex',
            gap: 12,
          }}
        >
          {['Local-first', 'AI-powered', 'Developer-friendly'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '6px 14px',
                borderRadius: 100,
                border: '1px solid rgba(124,58,237,0.4)',
                color: 'rgb(124, 58, 237)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
