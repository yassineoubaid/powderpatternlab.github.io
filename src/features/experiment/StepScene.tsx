import { useEffect, useState } from 'react';

import type { LanguageCode } from './copy';

export type SceneVariant = 'synthesis' | 'thinking' | 'beam';

const SCENE_IMAGES = {
  synthesis: new URL('../../../images/synthesis.png', import.meta.url).href,
  thinking: new URL('../../../images/symmetry.png', import.meta.url).href,
  beam: new URL('../../../images/experiment.png', import.meta.url).href,
} as const;

const SCENE_COPY: Record<
  LanguageCode,
  Record<
    SceneVariant,
    { label: string; title: string; text: string; bubble: string; alt: string }
  >
> = {
  en: {
    synthesis: {
      label: 'Lab scene',
      title: 'Level 1: Build the recipe',
      text: 'The scientist is actively doing the synthesis while you place atoms into the recipe.',
      bubble: 'Starting the synthesis.',
      alt: 'Teen scientist performing a crystal synthesis in the lab',
    },
    thinking: {
      label: 'Lab scene',
      title: 'Level 2: Solve the symmetry puzzle',
      text: 'The scientist pauses to think about crystal symmetry, lattices, and equivalent positions.',
      bubble: 'Checking the symmetry.',
      alt: 'Teen scientist thinking about crystal symmetry and lattice geometry',
    },
    beam: {
      label: 'Lab scene',
      title: 'Level 3: Fire the beam',
      text: 'The scientist is now at the diffraction beamline, watching the beam hit the sample and reveal the pattern.',
      bubble: 'Beamline ready.',
      alt: 'Teen scientist at a synchrotron diffraction beamline running an experiment',
    },
  },
  fr: {
    synthesis: {
      label: 'Scène de labo',
      title: 'Niveau 1 : Construire la recette',
      text: 'Le scientifique réalise la synthèse pendant que vous placez les atomes dans la recette.',
      bubble: 'La synthèse commence.',
      alt: 'Jeune scientifique réalisant une synthèse cristalline au laboratoire',
    },
    thinking: {
      label: 'Scène de labo',
      title: 'Niveau 2 : Résoudre le puzzle de symétrie',
      text: 'Le scientifique réfléchit à la symétrie cristalline, aux réseaux et aux positions équivalentes.',
      bubble: 'Vérification de la symétrie.',
      alt: 'Jeune scientifique réfléchissant à la symétrie cristalline et à la géométrie du réseau',
    },
    beam: {
      label: 'Scène de labo',
      title: 'Niveau 3 : Lancer le faisceau',
      text: 'Le scientifique est maintenant à la ligne de diffraction et observe le faisceau traverser l’échantillon.',
      bubble: 'Ligne de lumière prête.',
      alt: 'Jeune scientifique sur une ligne de diffraction synchrotron en train de faire une expérience',
    },
  },
  ar: {
    synthesis: {
      label: 'مشهد مخبري',
      title: 'المستوى 1: بناء الوصفة',
      text: 'العالِم يقوم بالتحضير بينما تضع الذرات داخل الوصفة.',
      bubble: 'بدأت عملية التحضير.',
      alt: 'عالِم شاب يجري تحضيراً بلورياً في المختبر',
    },
    thinking: {
      label: 'مشهد مخبري',
      title: 'المستوى 2: حل لغز التناظر',
      text: 'العالِم يفكر في التناظر البلوري والشبكات والمواقع المكافئة.',
      bubble: 'يتم فحص التناظر.',
      alt: 'عالِم شاب يفكر في التناظر البلوري وهندسة الشبكة',
    },
    beam: {
      label: 'مشهد مخبري',
      title: 'المستوى 3: إطلاق الحزمة',
      text: 'العالِم الآن في خط حيود ويشاهد الحزمة وهي تمر عبر العينة لتكشف النمط.',
      bubble: 'خط الشعاع جاهز.',
      alt: 'عالِم شاب في خط حيود سنكروتروني يجري تجربة',
    },
  },
};

export function StepScene({
  variant,
  language,
  bubbleText,
  reactionTick = 0,
}: {
  variant: SceneVariant;
  language: LanguageCode;
  bubbleText?: string;
  reactionTick?: number;
}) {
  const content = SCENE_COPY[language][variant];
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
            src={SCENE_IMAGES[variant]}
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
