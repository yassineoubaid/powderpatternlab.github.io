import { useEffect, useState } from 'react';

export type SceneVariant = 'synthesis' | 'thinking' | 'beam';

const SCENE_COPY: Record<
  SceneVariant,
  { label: string; title: string; text: string; bubble: string; alt: string; image: string }
> = {
  synthesis: {
    label: 'Lab scene',
    title: 'Level 1: Build the recipe',
    text: 'The scientist is actively doing the synthesis while you place atoms into the recipe.',
    bubble: 'Starting the synthesis.',
    alt: 'Teen scientist performing a crystal synthesis in the lab',
    image: new URL('../../../images/synthesis.png', import.meta.url).href,
  },
  thinking: {
    label: 'Lab scene',
    title: 'Level 2: Solve the symmetry puzzle',
    text: 'The scientist pauses to think about crystal symmetry, lattices, and equivalent positions.',
    bubble: 'Checking the symmetry.',
    alt: 'Teen scientist thinking about crystal symmetry and lattice geometry',
    image: new URL('../../../images/symmetry.png', import.meta.url).href,
  },
  beam: {
    label: 'Lab scene',
    title: 'Level 3: Fire the beam',
    text: 'The scientist is now at the diffraction beamline, watching the beam hit the sample and reveal the pattern.',
    bubble: 'Beamline ready.',
    alt: 'Teen scientist at a synchrotron diffraction beamline running an experiment',
    image: new URL('../../../images/experiment.png', import.meta.url).href,
  },
};

export function StepScene({
  variant,
  bubbleText,
  reactionTick = 0,
}: {
  variant: SceneVariant;
  bubbleText?: string;
  reactionTick?: number;
}) {
  const content = SCENE_COPY[variant];
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    if (reactionTick === 0) {
      return;
    }

    setReacting(true);
    const timeoutId = window.setTimeout(() => setReacting(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, [reactionTick]);

  return (
    <section className={`scene-card variant-${variant}${reacting ? ' is-reacting' : ''}`}>
      <div className="scene-copy">
        <p className="scene-label">{content.label}</p>
        <h3>{content.title}</h3>
        <p>{content.text}</p>
      </div>

      <div className={`scene-illustration scene-illustration-${variant}`}>
        <div className="scene-shot">
          <img
            alt={content.alt}
            className="scene-shot-image"
            src={content.image}
          />
          <div className="scene-shot-overlay" />
          <div className="scene-shot-glow" />
          <div className="scene-speech">
            <p>{bubbleText ?? content.bubble}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
