<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UPLIFT · Professional</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #0B0F19;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    }

    .card {
      max-width: 820px;
      width: 100%;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(24px) saturate(1.4);
      -webkit-backdrop-filter: blur(24px) saturate(1.4);
      border-radius: 48px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
      padding: 40px 36px 32px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    /* ——— Glassmorphic glow orbs ——— */
    .card::before {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
      top: -180px;
      right: -120px;
      z-index: 0;
      pointer-events: none;
      filter: blur(60px);
    }

    .card::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
      bottom: -100px;
      left: -80px;
      z-index: 0;
      pointer-events: none;
      filter: blur(70px);
    }

    .content {
      position: relative;
      z-index: 2;
    }

    /* ——— Header / Logo ——— */
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      color: white;
      box-shadow: 0 8px 24px -6px rgba(124, 58, 237, 0.3);
    }

    .logo-text {
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .badge {
      margin-left: 12px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: rgba(139, 92, 246, 0.18);
      border: 1px solid rgba(139, 92, 246, 0.2);
      color: #A78BFA;
      padding: 4px 14px;
      border-radius: 60px;
      backdrop-filter: blur(4px);
      -webkit-text-fill-color: #A78BFA;
    }

    /* ——— Tagline ——— */
    .tagline {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 3px;
      color: rgba(148, 163, 184, 0.7);
      margin-top: 4px;
      margin-bottom: 20px;
      text-transform: uppercase;
    }

    /* ——— Divider ——— */
    .divider {
      width: 48px;
      height: 2px;
      background: linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4);
      border-radius: 4px;
      margin: 16px 0 20px 0;
    }

    /* ——— Description ——— */
    .desc {
      font-size: 17px;
      line-height: 1.7;
      color: #E2E8F0;
      max-width: 460px;
      margin-bottom: 28px;
      font-weight: 350;
      letter-spacing: -0.2px;
    }

    .desc strong {
      background: linear-gradient(135deg, #A78BFA, #60A5FA);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 500;
    }

    /* ——— Flow pills ——— */
    .flow {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 12px;
      margin-bottom: 28px;
    }

    .pill {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 6px 20px;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 450;
      color: #E2E8F0;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .pill:hover {
      background: rgba(51, 65, 85, 0.6);
      border-color: rgba(139, 92, 246, 0.3);
    }

    .arrow {
      color: #475569;
      font-weight: 300;
      font-size: 18px;
      margin: 0 2px;
    }

    /* ——— Feature grid ——— */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px 24px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(4px);
      border-radius: 24px;
      padding: 18px 24px;
      border: 1px solid rgba(255, 255, 255, 0.03);
      margin-bottom: 32px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #CBD5E1;
      font-size: 14px;
      font-weight: 400;
    }

    .feature-item span:first-child {
      color: #8B5CF6;
      font-weight: 500;
      font-size: 16px;
    }

    /* ——— Tech stack ——— */
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 16px;
      padding: 12px 0 6px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      margin-top: 8px;
    }

    .tech-item {
      font-size: 12px;
      font-weight: 450;
      color: #64748B;
      letter-spacing: 0.2px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px 12px;
      border-radius: 40px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .tech-item.highlight {
      color: #94A3B8;
      border-color: rgba(139, 92, 246, 0.15);
      background: rgba(139, 92, 246, 0.05);
    }

    /* ——— CTA ——— */
    .cta {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(59, 130, 246, 0.08));
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 60px;
      padding: 12px 28px;
      margin-top: 6px;
      backdrop-filter: blur(8px);
      transition: all 0.25s;
      cursor: default;
    }

    .cta:hover {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(59, 130, 246, 0.12));
      border-color: rgba(139, 92, 246, 0.35);
      box-shadow: 0 0 30px -10px rgba(139, 92, 246, 0.15);
    }

    .cta-text {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.3px;
      color: #E2E8F0;
    }

    .cta-icon {
      font-size: 18px;
    }

    /* ——— Footer wave (capsule) ——— */
    .footer-wave {
      margin-top: 28px;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4, #3B82F6, #7C3AED);
      background-size: 200% 100%;
      border-radius: 8px;
      opacity: 0.3;
      animation: shimmer 6s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    /* ——— Responsive ——— */
    @media (max-width: 600px) {
      .card { padding: 28px 18px 24px; border-radius: 32px; }
      .logo-text { font-size: 24px; }
      .badge { font-size: 10px; padding: 3px 10px; }
      .desc { font-size: 15px; }
      .features { grid-template-columns: 1fr 1fr; padding: 16px; }
    }
  </style>
</head>
<body>

<div class="card">
  <div class="content">

    <!-- Logo + Badge -->
    <div class="logo">
      <div class="logo-icon">↑</div>
      <span class="logo-text">UPLIFT</span>
      <span class="badge">AI · IELTS</span>
    </div>

    <!-- Tagline -->
    <div class="tagline">Write · Analyze · Improve</div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Description -->
    <div class="desc">
      <strong>AI-powered writing analytics</strong> for IELTS.  
      Get band predictions, sentence-level feedback, and export results — all in one place.
    </div>

    <!-- Flow Pills -->
    <div class="flow">
      <span class="pill">✍️ Write</span>
      <span class="arrow">→</span>
      <span class="pill">🤖 Analyze</span>
      <span class="arrow">→</span>
      <span class="pill">📊 Band Score</span>
      <span class="arrow">→</span>
      <span class="pill">✨ Refine</span>
    </div>

    <!-- Features Grid -->
    <div class="features">
      <div class="feature-item"><span>✓</span> Band prediction</div>
      <div class="feature-item"><span>✓</span> Sentence scoring</div>
      <div class="feature-item"><span>✓</span> Interactive highlights</div>
      <div class="feature-item"><span>✓</span> PDF export</div>
      <div class="feature-item"><span>✓</span> Secure auth</div>
      <div class="feature-item"><span>✓</span> Submission history</div>
    </div>

    <!-- Tech Stack -->
    <div class="tech-stack">
      <span class="tech-item highlight">React</span>
      <span class="tech-item highlight">TypeScript</span>
      <span class="tech-item highlight">Vite</span>
      <span class="tech-item">Tailwind</span>
      <span class="tech-item">shadcn/ui</span>
      <span class="tech-item">Radix</span>
      <span class="tech-item">React Query</span>
      <span class="tech-item">JWT</span>
      <span class="tech-item">Google OAuth</span>
    </div>

    <!-- CTA -->
    <div class="cta">
      <span class="cta-icon">⭐</span>
      <span class="cta-text">Transform Writing Into Results</span>
    </div>

    <!-- Footer wave -->
    <div class="footer-wave"></div>

  </div>
</div>

</body>
</html>
