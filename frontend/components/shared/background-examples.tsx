"use client";

/**
 * BACKGROUND EXAMPLES - Demo tất cả các background effects
 * 
 * File này chứa các ví dụ về cách sử dụng các background components.
 * Bạn có thể copy/paste bất kỳ example nào vào sections của mình.
 */

import { FloatingOrbsBackground } from "./floating-orbs-background";
import { ParticleNetworkBackground } from "./particle-network-background";
import { AnimatedGridBackground } from "./animated-grid-background";
import { GradientMeshBackground } from "./gradient-mesh-background";
import { WaveAnimationBackground } from "./wave-animation-background";
import { HexagonPatternBackground } from "./hexagon-pattern-background";

// EXAMPLE 1: Particle Network với Gradient Mesh (như WhyDolfinSection)
export function Example1ParticlesWithMesh() {
  return (
    <section className="relative py-24 px-6">
      <GradientMeshBackground variant="mesh">
        <ParticleNetworkBackground
          particleCount={60}
          particleColor="rgba(250, 204, 21, 0.8)"
          lineColor="rgba(250, 204, 21, 0.15)"
          maxDistance={120}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">
              Particle Network + Gradient Mesh
            </h2>
            <p className="text-white/70 text-center">
              Kết hợp particles động với gradient mesh background
            </p>
          </div>
        </ParticleNetworkBackground>
      </GradientMeshBackground>
    </section>
  );
}

// EXAMPLE 2: Floating Orbs với Animated Grid (như HowItWorksSection)
export function Example2OrbsWithGrid() {
  return (
    <section className="relative py-24 px-6">
      <FloatingOrbsBackground
        orbCount={6}
        colors={[
          "rgba(250, 204, 21, 0.12)",
          "rgba(251, 191, 36, 0.10)",
          "rgba(245, 158, 11, 0.12)",
        ]}
      >
        <AnimatedGridBackground
          gridColor="rgba(250, 204, 21, 0.08)"
          glowColor="rgba(250, 204, 21, 0.25)"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">
              Floating Orbs + Animated Grid
            </h2>
            <p className="text-white/70 text-center">
              Orbs bay lơ lửng kết hợp với grid có hiệu ứng glow
            </p>
          </div>
        </AnimatedGridBackground>
      </FloatingOrbsBackground>
    </section>
  );
}

// EXAMPLE 3: Wave Animation với Hexagon Pattern
export function Example3WavesWithHexagons() {
  return (
    <section className="relative py-24 px-6">
      <HexagonPatternBackground color="#fbbf24" opacity={0.08}>
        <WaveAnimationBackground color="#fbbf24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">
              Wave Animation + Hexagon Pattern
            </h2>
            <p className="text-white/70 text-center">
              Sóng SVG animated kết hợp với pattern hình lục giác
            </p>
          </div>
        </WaveAnimationBackground>
      </HexagonPatternBackground>
    </section>
  );
}

// EXAMPLE 4: Triple Layer - Gradient + Grid + Particles (Advanced)
export function Example4TripleLayer() {
  return (
    <section className="relative py-24 px-6">
      <GradientMeshBackground variant="radial">
        <AnimatedGridBackground
          gridColor="rgba(250, 204, 21, 0.05)"
          glowColor="rgba(250, 204, 21, 0.2)"
        >
          <ParticleNetworkBackground
            particleCount={40}
            particleColor="rgba(250, 204, 21, 0.6)"
            lineColor="rgba(250, 204, 21, 0.1)"
            maxDistance={100}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">
                Triple Layer Background
              </h2>
              <p className="text-white/70 text-center">
                Ba layers kết hợp: Gradient Mesh + Grid + Particles
              </p>
            </div>
          </ParticleNetworkBackground>
        </AnimatedGridBackground>
      </GradientMeshBackground>
    </section>
  );
}

// EXAMPLE 5: Hexagon + Orbs (Sci-fi look)
export function Example5SciFiStyle() {
  return (
    <section className="relative py-24 px-6">
      <HexagonPatternBackground color="#fbbf24" opacity={0.1}>
        <FloatingOrbsBackground
          orbCount={4}
          colors={[
            "rgba(250, 204, 21, 0.15)",
            "rgba(251, 191, 36, 0.12)",
          ]}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center neon-glow">
              Sci-Fi Style Background
            </h2>
            <p className="text-white/70 text-center">
              Hexagons + Orbs tạo cảm giác công nghệ cao
            </p>
          </div>
        </FloatingOrbsBackground>
      </HexagonPatternBackground>
    </section>
  );
}

// EXAMPLE 6: Minimalist - Gradient Mesh only
export function Example6Minimalist() {
  return (
    <section className="relative py-24 px-6">
      <GradientMeshBackground variant="conic">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-yellow-300 mb-6 text-center">
            Minimalist Gradient
          </h2>
          <p className="text-white/70 text-center">
            Chỉ gradient mesh - đơn giản nhưng elegant
          </p>
        </div>
      </GradientMeshBackground>
    </section>
  );
}

/**
 * CÁCH DÙNG VỚI CARDS
 * 
 * Tất cả backgrounds đều có thể kết hợp với cards:
 */
export function ExampleWithCards() {
  return (
    <section className="relative py-24 px-6">
      <FloatingOrbsBackground orbCount={5}>
        <AnimatedGridBackground>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group relative"
              >
                {/* Card với glassmorphism */}
                <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#0d0d0d]/80 via-[#0a0a0a]/60 to-black/80 p-6 backdrop-blur-xl transition-all duration-500 group-hover:border-yellow-500/60 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] group-hover:scale-[1.02] animate-float"
                  style={{ animationDelay: `${item * 0.5}s` }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-pulse-glow" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      Card {item}
                    </h3>
                    <p className="text-white/70 text-sm">
                      Card với glassmorphism, hover effects, và animations
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedGridBackground>
      </FloatingOrbsBackground>
    </section>
  );
}
