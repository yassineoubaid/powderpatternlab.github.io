import { startTransition, useEffect, useRef, useState } from 'react';

import { ELEMENTS } from '../../data/generated/scatteringData';
import {
  BRAVAIS_OPTIONS,
  SPACE_GROUPS_BY_BRAVAIS,
  getSpaceGroupByNumber,
} from '../../data/spaceGroups';
import {
  DEFAULT_CELL,
  DEFAULT_SIMULATION_SETTINGS,
  applyBravaisConstraints,
  buildFormulaFromAtoms,
  createAtomSeed,
  createDemoStructure,
  getElementColor,
  normalizeElementSymbol,
  simulatePowderPattern,
  validateAtomSeeds,
  validateStructure,
} from '../../lib/crystallography';
import type {
  AtomSeed,
  BravaisType,
  PowderPatternResult,
  SimulationSettings,
  UnitCellInput,
  ValidationMessage,
  ValidationResult,
} from '../../types/crystallography';
import { COPY } from './copy';
import { SCIENCE_GLOSSARY, type GlossaryKey } from './scienceGlossary';
import { StepScene, type SceneVariant } from './StepScene';
import './ExperimentExplorer.css';

const EMPTY_VALIDATION: ValidationResult = {
  valid: false,
  expandedSites: [],
  collisions: [],
  messages: [],
  summaryFormula: '',
};

const EMPTY_PATTERN: PowderPatternResult = {
  reflections: [],
  curve: [],
  maxIntensity: 0,
  messages: [],
};

const EDITABLE_FIELDS: Record<BravaisType, (keyof UnitCellInput)[]> = {
  aP: ['a', 'b', 'c', 'alpha', 'beta', 'gamma'],
  mP: ['a', 'b', 'c', 'beta'],
  mC: ['a', 'b', 'c', 'beta'],
  oP: ['a', 'b', 'c'],
  oC: ['a', 'b', 'c'],
  oI: ['a', 'b', 'c'],
  oF: ['a', 'b', 'c'],
  tP: ['a', 'c'],
  tI: ['a', 'c'],
  hP: ['a', 'c'],
  hR: ['a', 'c'],
  cP: ['a'],
  cI: ['a'],
  cF: ['a'],
};

const FIELD_LABELS: Record<keyof UnitCellInput, string> = {
  a: 'a (A)',
  b: 'b (A)',
  c: 'c (A)',
  alpha: 'alpha (deg)',
  beta: 'beta (deg)',
  gamma: 'gamma (deg)',
};

const CELL_INPUT_RULES: Record<
  keyof UnitCellInput,
  {
    min: number;
    max: number;
    step: string;
  }
> = {
  a: { min: 0.5, max: 50, step: '0.01' },
  b: { min: 0.5, max: 50, step: '0.01' },
  c: { min: 0.5, max: 50, step: '0.01' },
  alpha: { min: 1, max: 179, step: '0.1' },
  beta: { min: 1, max: 179, step: '0.1' },
  gamma: { min: 1, max: 179, step: '0.1' },
};

const SIMULATION_INPUT_RULES = {
  wavelength: { min: 0.1, max: 10, step: '0.0001' },
  U: { min: 0, max: 2, step: '0.001' },
  V: { min: -2, max: 2, step: '0.001' },
  W: { min: 0, max: 2, step: '0.001' },
} as const;

type SceneCueState = Record<
  SceneVariant,
  {
    message: string;
    reactionTick: number;
  }
>;

type ExperimentStep = 1 | 2 | 3;
type SymmetryPage = 0 | 1;
type PatternPage = 0 | 1 | 2 | 3;
type HistoryMode = 'push' | 'replace';

const APP_ROUTES = {
  home: '#home',
  formula: '#formula',
  symmetryLattice: '#symmetry-lattice',
  symmetryCell: '#symmetry-cell',
  patternSource: '#pattern-source',
  patternWavelength: '#pattern-wavelength',
  patternResolution: '#pattern-resolution',
  patternResult: '#pattern-result',
} as const;

type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

type RouteState = {
  started: boolean;
  currentStep: ExperimentStep;
  symmetryPage: SymmetryPage;
  patternPage: PatternPage;
};

const INITIAL_SCENE_CUES: SceneCueState = {
  synthesis: {
    message: 'Starting the synthesis.',
    reactionTick: 0,
  },
  thinking: {
    message: 'Checking the symmetry.',
    reactionTick: 0,
  },
  beam: {
    message: 'Beamline ready.',
    reactionTick: 0,
  },
};

const FORMULA_TERMS: GlossaryKey[] = ['asymmetricUnit', 'fractionalCoordinates'];
const SYMMETRY_PAGE_TERMS: Record<SymmetryPage, GlossaryKey[]> = {
  0: ['bravaisLattice'],
  1: ['spaceGroup', 'bravaisLattice'],
};
const PATTERN_PAGE_TERMS: Record<PatternPage, GlossaryKey[]> = {
  0: ['wavelength'],
  1: ['wavelength', 'braggLaw', 'twoTheta'],
  2: ['cagliotiRelation', 'cagliotiGaussianProfile'],
  3: ['twoTheta', 'braggLaw', 'cagliotiGaussianProfile'],
};

function createInitialSceneCues(): SceneCueState {
  return {
    synthesis: { ...INITIAL_SCENE_CUES.synthesis },
    thinking: { ...INITIAL_SCENE_CUES.thinking },
    beam: { ...INITIAL_SCENE_CUES.beam },
  };
}

function createInitialAtoms() {
  return [createAtomSeed(1)];
}

function getRouteFromState({
  started,
  currentStep,
  symmetryPage,
  patternPage,
}: RouteState): AppRoute {
  if (!started) {
    return APP_ROUTES.home;
  }

  if (currentStep === 1) {
    return APP_ROUTES.formula;
  }

  if (currentStep === 2) {
    return symmetryPage === 0 ? APP_ROUTES.symmetryLattice : APP_ROUTES.symmetryCell;
  }

  switch (patternPage) {
    case 0:
      return APP_ROUTES.patternSource;
    case 1:
      return APP_ROUTES.patternWavelength;
    case 2:
      return APP_ROUTES.patternResolution;
    case 3:
    default:
      return APP_ROUTES.patternResult;
  }
}

function getStateFromRoute(route: string | null | undefined): RouteState {
  switch (route) {
    case APP_ROUTES.formula:
      return { started: true, currentStep: 1, symmetryPage: 0, patternPage: 0 };
    case APP_ROUTES.symmetryLattice:
      return { started: true, currentStep: 2, symmetryPage: 0, patternPage: 0 };
    case APP_ROUTES.symmetryCell:
      return { started: true, currentStep: 2, symmetryPage: 1, patternPage: 0 };
    case APP_ROUTES.patternSource:
      return { started: true, currentStep: 3, symmetryPage: 1, patternPage: 0 };
    case APP_ROUTES.patternWavelength:
      return { started: true, currentStep: 3, symmetryPage: 1, patternPage: 1 };
    case APP_ROUTES.patternResolution:
      return { started: true, currentStep: 3, symmetryPage: 1, patternPage: 2 };
    case APP_ROUTES.patternResult:
      return { started: true, currentStep: 3, symmetryPage: 1, patternPage: 3 };
    case APP_ROUTES.home:
    default:
      return { started: false, currentStep: 1, symmetryPage: 0, patternPage: 0 };
  }
}

function updateAtom(atoms: AtomSeed[], atomId: string, patch: Partial<AtomSeed>) {
  return atoms.map((atom) => (atom.id === atomId ? { ...atom, ...patch } : atom));
}

function formatNumber(value: number, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.000';
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildTicks(min: number, max: number, count: number) {
  if (count <= 1 || max <= min) {
    return [min];
  }

  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

function getVisibleCurvePoints(
  points: PowderPatternResult['curve'],
  rangeMin: number,
  rangeMax: number,
) {
  if (points.length === 0) {
    return [];
  }

  let startIndex = 0;
  while (startIndex < points.length && points[startIndex].twoTheta < rangeMin) {
    startIndex += 1;
  }
  startIndex = Math.max(0, startIndex - 1);

  let endIndex = points.length - 1;
  while (endIndex >= 0 && points[endIndex].twoTheta > rangeMax) {
    endIndex -= 1;
  }
  endIndex = Math.min(points.length - 1, endIndex + 1);

  return endIndex >= startIndex ? points.slice(startIndex, endIndex + 1) : [];
}

function createFigurePath(
  points: PowderPatternResult['curve'],
  width: number,
  height: number,
  rangeMin: number,
  rangeMax: number,
  intensityMax: number,
) {
  if (points.length === 0 || rangeMax <= rangeMin || intensityMax <= 0) {
    return '';
  }

  return points
    .map((point, index) => {
      const x = ((point.twoTheta - rangeMin) / (rangeMax - rangeMin)) * width;
      const y = height - (point.intensity / intensityMax) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function MessageStack({ messages }: { messages: ValidationMessage[] }) {
  if (messages.length === 0) return null;

  return (
    <div className="message-stack">
      {messages.map((message, index) => (
        <div className={`message-card tone-${message.tone}`} key={`${message.tone}-${index}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
}

function CrystalPreview({ validation }: { validation: ValidationResult }) {
  const sites = validation.expandedSites.slice(0, 48);
  const width = 280;
  const height = 220;

  return (
    <svg
      className="crystal-preview"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Crystal preview"
    >
      <defs>
        <linearGradient id="cellGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
      <polygon
        points="88,42 188,42 236,86 136,86"
        fill="url(#cellGlow)"
        stroke="rgba(255,255,255,0.65)"
      />
      <polygon
        points="88,42 136,86 136,176 88,132"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.45)"
      />
      <polygon
        points="136,86 236,86 236,176 136,176"
        fill="rgba(17,24,39,0.14)"
        stroke="rgba(255,255,255,0.45)"
      />
      <polygon
        points="88,132 188,132 236,176 136,176"
        fill="rgba(255,255,255,0.14)"
        stroke="rgba(255,255,255,0.45)"
      />
      {sites.map((site) => {
        const x = 88 + site.position[0] * 100 + site.position[1] * 48;
        const y = 132 - site.position[2] * 90 - site.position[1] * 46;
        return (
          <g key={`${site.atomId}-${site.canonicalKey}`}>
            <circle cx={x} cy={y} r="10" fill={getElementColor(site.element)} opacity="0.16" />
            <circle
              cx={x}
              cy={y}
              r="5.5"
              fill={getElementColor(site.element)}
              stroke="#07111f"
              strokeWidth="1.4"
            />
          </g>
        );
      })}
      {sites.length === 0 ? (
        <text
          x="140"
          y="110"
          textAnchor="middle"
          fill="rgba(255,255,255,0.72)"
          fontSize="14"
        >
          Pick a symmetry to see the expanded cell.
        </text>
      ) : null}
    </svg>
  );
}

function PowderPlot({
  pattern,
  onInteract,
}: {
  pattern: PowderPatternResult;
  onInteract?: (message: string) => void;
}) {
  const figureRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<{ pointerId: number | null; startTheta: number | null }>({
    pointerId: null,
    startTheta: null,
  });
  const hasData = pattern.curve.length > 0;
  const defaultRange = {
    min: hasData ? pattern.curve[0].twoTheta : 0,
    max: hasData ? pattern.curve[pattern.curve.length - 1].twoTheta : 1,
  };
  const [viewRange, setViewRange] = useState(defaultRange);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (!hasData) {
      setSelection(null);
      return;
    }

    setViewRange(defaultRange);
    setSelection(null);
  }, [defaultRange.max, defaultRange.min, hasData, pattern.curve.length]);

  const figureWidth = 860;
  const figureHeight = 360;
  const margin = { top: 18, right: 24, bottom: 46, left: 54 };
  const plotWidth = figureWidth - margin.left - margin.right;
  const plotHeight = figureHeight - margin.top - margin.bottom;
  const totalSpan = defaultRange.max - defaultRange.min;
  const currentSpan = Math.max(viewRange.max - viewRange.min, 0.5);

  const clampRange = (nextMin: number, nextMax: number) => {
    let safeMin = nextMin;
    let safeMax = nextMax;
    const span = safeMax - safeMin;

    if (span >= totalSpan) {
      return defaultRange;
    }

    if (safeMin < defaultRange.min) {
      safeMax += defaultRange.min - safeMin;
      safeMin = defaultRange.min;
    }

    if (safeMax > defaultRange.max) {
      safeMin -= safeMax - defaultRange.max;
      safeMax = defaultRange.max;
    }

    return {
      min: clampNumber(safeMin, defaultRange.min, defaultRange.max - span),
      max: clampNumber(safeMax, defaultRange.min + span, defaultRange.max),
    };
  };

  const zoomAt = (anchor: number, factor: number) => {
    const nextSpan = clampNumber(currentSpan * factor, 1, totalSpan);
    const ratio = (anchor - viewRange.min) / currentSpan;
    const nextMin = anchor - ratio * nextSpan;
    const nextMax = nextMin + nextSpan;
    setViewRange(clampRange(nextMin, nextMax));
  };

  const getClientRect = () => {
    const rect = figureRef.current?.getBoundingClientRect();
    return {
      left: rect?.left ?? 0,
      width: rect?.width && rect.width > 0 ? rect.width : figureWidth,
    };
  };

  const clientXToTwoTheta = (clientX: number) => {
    const rect = getClientRect();
    const innerWidth = rect.width - margin.left - margin.right;
    const ratio = clampNumber((clientX - rect.left - margin.left) / Math.max(innerWidth, 1), 0, 1);
    return viewRange.min + ratio * currentSpan;
  };

  useEffect(() => {
    if (!hasData) {
      return;
    }

    const figure = figureRef.current;
    if (!figure) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) {
        return;
      }

      event.preventDefault();
      const anchor = clientXToTwoTheta(event.clientX);
      zoomAt(anchor, event.deltaY < 0 ? 0.82 : 1.22);
      onInteract?.(event.deltaY < 0 ? 'Zooming into the selected peaks.' : 'Zooming back out.');
    };

    figure.addEventListener('wheel', handleWheel, { passive: false });
    return () => figure.removeEventListener('wheel', handleWheel);
  }, [currentSpan, hasData, onInteract, viewRange.max, viewRange.min]);

  const visibleCurve = hasData
    ? getVisibleCurvePoints(pattern.curve, viewRange.min, viewRange.max)
    : [];
  const visibleReflections = hasData
    ? pattern.reflections.filter(
        (reflection) =>
          reflection.twoTheta >= viewRange.min && reflection.twoTheta <= viewRange.max,
      )
    : [];
  const visibleMax = Math.max(
    1,
    ...visibleCurve.map((point) => point.intensity),
    ...visibleReflections.map((reflection) => reflection.relativeIntensity),
  );
  const intensityMax = Math.max(5, Math.min(100, Math.ceil((visibleMax * 1.08) / 5) * 5));
  const path = createFigurePath(
    visibleCurve,
    plotWidth,
    plotHeight,
    viewRange.min,
    viewRange.max,
    intensityMax,
  );
  const xTicks = buildTicks(viewRange.min, viewRange.max, 5);
  const yTicks = buildTicks(0, intensityMax, 5);
  const zoomPercent = (totalSpan / currentSpan) * 100;

  const selectionStart = selection ? Math.min(selection.start, selection.end) : null;
  const selectionEnd = selection ? Math.max(selection.start, selection.end) : null;
  const selectionX =
    selectionStart === null
      ? 0
      : margin.left + ((selectionStart - viewRange.min) / currentSpan) * plotWidth;
  const selectionWidth =
    selectionStart === null || selectionEnd === null
      ? 0
      : ((selectionEnd - selectionStart) / currentSpan) * plotWidth;

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const startTheta = clientXToTwoTheta(event.clientX);
    interactionRef.current = { pointerId: event.pointerId, startTheta };
    setSelection({ start: startTheta, end: startTheta });
    event.currentTarget.setPointerCapture(event.pointerId);
    onInteract?.('Drag a region to zoom onto those peaks.');
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (interactionRef.current.pointerId !== event.pointerId || interactionRef.current.startTheta === null) {
      return;
    }

    const currentTheta = clientXToTwoTheta(event.clientX);
    setSelection({ start: interactionRef.current.startTheta, end: currentTheta });
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (interactionRef.current.pointerId !== event.pointerId || interactionRef.current.startTheta === null) {
      setSelection(null);
      interactionRef.current = { pointerId: null, startTheta: null };
      return;
    }

    const endTheta = clientXToTwoTheta(event.clientX);
    const minTheta = Math.min(interactionRef.current.startTheta, endTheta);
    const maxTheta = Math.max(interactionRef.current.startTheta, endTheta);

    interactionRef.current = { pointerId: null, startTheta: null };
    setSelection(null);

    if (maxTheta - minTheta < Math.max(1, totalSpan * 0.015)) {
      onInteract?.('Use a wider drag to isolate a peak region.');
      return;
    }

    setViewRange(clampRange(minTheta, maxTheta));
    onInteract?.('Zooming to the selected peak window.');
  };

  const handleDoubleClick = () => {
    setViewRange(defaultRange);
    setSelection(null);
    onInteract?.('Resetting the full diffraction figure.');
  };

  const handleZoomOut = () => {
    zoomAt((viewRange.min + viewRange.max) / 2, 1.25);
    onInteract?.('Zooming back out.');
  };

  const handleZoomIn = () => {
    zoomAt((viewRange.min + viewRange.max) / 2, 0.8);
    onInteract?.('Zooming into the selected peaks.');
  };

  const handleReset = () => {
    setViewRange(defaultRange);
    setSelection(null);
    onInteract?.('Resetting the full diffraction figure.');
  };

  if (!hasData) {
    return (
      <div className="plot-empty">
        Set a valid structure and simulation to light up the diffractogram.
      </div>
    );
  }

  return (
    <div className="plot-shell">
      <div className="plot-toolbar">
        <div className="plot-zoom-controls">
          <button
            className="ghost-button"
            onClick={handleZoomOut}
            onFocus={() => onInteract?.('Zooming back out.')}
            type="button"
          >
            Zoom out
          </button>
          <button
            className="ghost-button"
            onClick={handleZoomIn}
            onFocus={() => onInteract?.('Zooming into the selected peaks.')}
            type="button"
          >
            Zoom in
          </button>
          <button
            className="ghost-button"
            onClick={handleReset}
            onFocus={() => onInteract?.('Resetting the full diffraction figure.')}
            type="button"
          >
            Reset view
          </button>
        </div>
        <p className="range-note">
          View: {viewRange.min.toFixed(1)}-{viewRange.max.toFixed(1)} deg. Zoom:{' '}
          {Math.round(zoomPercent)}%. Wheel to zoom, drag a region to isolate peaks, double-click
          to reset.
        </p>
      </div>

      <div
        aria-label="Interactive powder plot viewport"
        className="plot-figure"
        ref={figureRef}
        tabIndex={0}
      >
        <svg
          className="powder-plot"
          viewBox={`0 0 ${figureWidth} ${figureHeight}`}
          width={figureWidth}
          height={figureHeight}
          onDoubleClick={handleDoubleClick}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label="Powder diffraction pattern"
        >
          {yTicks.map((tick) => {
            const y = margin.top + plotHeight - (tick / intensityMax) * plotHeight;
            return (
              <g key={`y-${tick.toFixed(3)}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={figureWidth - margin.right}
                  y2={y}
                  className="plot-grid"
                />
                <text x="10" y={Math.max(18, y - 6)} className="plot-label">
                  {tick.toFixed(tick >= 10 ? 0 : 1)}
                </text>
              </g>
            );
          })}

          {xTicks.map((tick) => {
            const x = margin.left + ((tick - viewRange.min) / currentSpan) * plotWidth;
            return (
              <g key={`x-${tick.toFixed(3)}`}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={margin.top + plotHeight}
                  className="plot-grid plot-grid-vertical"
                />
                <text
                  x={x}
                  y={figureHeight - 14}
                  textAnchor="middle"
                  className="plot-label"
                >
                  {tick.toFixed(1)} deg
                </text>
              </g>
            );
          })}

          {visibleReflections.map((reflection) => {
            const x =
              margin.left + ((reflection.twoTheta - viewRange.min) / currentSpan) * plotWidth;
            const y = margin.top + plotHeight - (reflection.relativeIntensity / intensityMax) * plotHeight;
            return (
              <g
                key={`${reflection.h}-${reflection.k}-${reflection.l}-${reflection.twoTheta.toFixed(3)}`}
              >
                <line
                  x1={x}
                  y1={margin.top + plotHeight}
                  x2={x}
                  y2={y}
                  className="stick-line"
                />
                <title>
                  ({reflection.h} {reflection.k} {reflection.l}) at{' '}
                  {reflection.twoTheta.toFixed(2)} deg
                </title>
              </g>
            );
          })}

          <path
            d={path}
            className="curve-line"
            transform={`translate(${margin.left} ${margin.top})`}
          />

          {selection && selectionStart !== null && selectionEnd !== null ? (
            <rect
              className="plot-selection"
              x={selectionX}
              y={margin.top}
              width={Math.max(1, selectionWidth)}
              height={plotHeight}
              rx="10"
            />
          ) : null}
        </svg>
      </div>

      <div className="plot-legend">
        <span>
          <i className="legend-stick" /> Ideal Bragg sticks
        </span>
        <span>
          <i className="legend-curve" /> Broadened powder profile
        </span>
      </div>
    </div>
  );
}

function StepBadge({
  active,
  unlocked,
  label,
  onClick,
}: {
  active: boolean;
  unlocked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`step-badge${active ? ' is-active' : ''}`}
      onClick={onClick}
      disabled={!unlocked}
      type="button"
    >
      {label}
    </button>
  );
}

function LessonBadge({
  active,
  unlocked,
  label,
  onClick,
}: {
  active: boolean;
  unlocked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`lesson-badge${active ? ' is-active' : ''}`}
      disabled={!unlocked}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function GlossaryChip({
  term,
  onOpen,
}: {
  term: GlossaryKey;
  onOpen: (term: GlossaryKey) => void;
}) {
  return (
    <button className="glossary-chip" onClick={() => onOpen(term)} type="button">
      {SCIENCE_GLOSSARY[term].label}
    </button>
  );
}

function GlossaryDialog({
  activeTerm,
  onClose,
}: {
  activeTerm: GlossaryKey | null;
  onClose: () => void;
}) {
  if (!activeTerm) {
    return null;
  }

  const definition = SCIENCE_GLOSSARY[activeTerm];

  return (
    <div
      aria-modal="true"
      className="glossary-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div className="glossary-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="glossary-header">
          <div>
            <p className="teaching-label">Scientific detail</p>
            <h3>{definition.label}</h3>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <p className="glossary-summary">{definition.summary}</p>
        {definition.equations?.length ? (
          <div className="glossary-equations">
            {definition.equations.map((equation) => (
              <pre key={equation}>
                <code>{equation}</code>
              </pre>
            ))}
          </div>
        ) : null}
        <div className="glossary-details">
          {definition.details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeachingCard({
  label,
  title,
  text,
  tip,
  terms,
  onOpenTerm,
}: {
  label: string;
  title: string;
  text: string;
  tip: string;
  terms?: GlossaryKey[];
  onOpenTerm?: (term: GlossaryKey) => void;
}) {
  return (
    <div className="teaching-card">
      <p className="teaching-label">{label}</p>
      <h3>{title}</h3>
      <p>{text}</p>
      <strong>{tip}</strong>
      {terms?.length && onOpenTerm ? (
        <div className="glossary-chip-row">
          <span>Click a scientific term for a rigorous definition:</span>
          {terms.map((term) => (
            <GlossaryChip key={term} onOpen={onOpenTerm} term={term} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ExperimentExplorer() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<ExperimentStep>(1);
  const [symmetryPage, setSymmetryPage] = useState<SymmetryPage>(0);
  const [patternPage, setPatternPage] = useState<PatternPage>(0);
  const [atoms, setAtoms] = useState<AtomSeed[]>(createInitialAtoms);
  const [bravais, setBravais] = useState<BravaisType | null>(null);
  const [spaceGroupNumber, setSpaceGroupNumber] = useState<number | null>(null);
  const [cell, setCell] = useState<UnitCellInput>(DEFAULT_CELL);
  const [simulation, setSimulation] = useState<SimulationSettings>(
    DEFAULT_SIMULATION_SETTINGS,
  );
  const [validation, setValidation] = useState<ValidationResult>(EMPTY_VALIDATION);
  const [pattern, setPattern] = useState<PowderPatternResult>(EMPTY_PATTERN);
  const [sceneCues, setSceneCues] = useState<SceneCueState>(createInitialSceneCues);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<GlossaryKey | null>(null);
  const [viewJumpTick, setViewJumpTick] = useState(0);
  const [routeSyncReady, setRouteSyncReady] = useState(false);
  const formulaStepRef = useRef<HTMLElement | null>(null);
  const symmetryStepRef = useRef<HTMLElement | null>(null);
  const patternStepRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const historyModeRef = useRef<HistoryMode>('push');

  const formula = buildFormulaFromAtoms(atoms);
  const atomMessages = validateAtomSeeds(atoms);
  const atomStepReady = atomMessages.length === 0;
  const availableSpaceGroups = bravais ? SPACE_GROUPS_BY_BRAVAIS[bravais] : [];
  const selectedSpaceGroup = getSpaceGroupByNumber(spaceGroupNumber);
  const lockedCell = applyBravaisConstraints(bravais, cell);
  const stepThreeReady = atomStepReady && validation.valid;
  const patternHasResult = pattern.curve.length > 0;
  const patternSetupMessages = pattern.messages.filter((message) => message.tone !== 'info');
  const currentRoute = getRouteFromState({
    started,
    currentStep,
    symmetryPage,
    patternPage,
  });

  useEffect(() => {
    if (!bravais) {
      setSpaceGroupNumber(null);
      return;
    }

    if (!availableSpaceGroups.some((candidate) => candidate.number === spaceGroupNumber)) {
      setSpaceGroupNumber(availableSpaceGroups[0]?.number ?? null);
    }
  }, [availableSpaceGroups, bravais, spaceGroupNumber]);

  useEffect(() => {
    if (!bravais || !spaceGroupNumber || !selectedSpaceGroup) {
      startTransition(() => {
        setValidation(EMPTY_VALIDATION);
        setPattern(EMPTY_PATTERN);
      });
      return;
    }

    startTransition(() => {
      const constrainedCell = applyBravaisConstraints(bravais, cell);
      const nextValidation = validateStructure(
        {
          atoms,
          bravais,
          spaceGroupNumber,
          cell: constrainedCell,
        },
        selectedSpaceGroup,
      );
      setValidation(nextValidation);

      if (!atomStepReady || !nextValidation.valid) {
        setPattern(EMPTY_PATTERN);
        return;
      }

      setPattern(
        simulatePowderPattern(
          {
            atoms,
            bravais,
            spaceGroupNumber,
            cell: constrainedCell,
          },
          selectedSpaceGroup,
          nextValidation,
          simulation,
        ),
      );
    });
  }, [atomStepReady, atoms, bravais, cell, selectedSpaceGroup, simulation, spaceGroupNumber]);

  useEffect(() => {
    const routeState = getStateFromRoute(window.location.hash || APP_ROUTES.home);
    setStarted(routeState.started);
    setCurrentStep(routeState.currentStep);
    setSymmetryPage(routeState.symmetryPage);
    setPatternPage(routeState.patternPage);
    window.history.replaceState({ route: getRouteFromState(routeState) }, '', getRouteFromState(routeState));
    setRouteSyncReady(true);

    const handlePopState = () => {
      const nextRouteState = getStateFromRoute(window.location.hash || APP_ROUTES.home);
      historyModeRef.current = 'replace';
      setStarted(nextRouteState.started);
      setCurrentStep(nextRouteState.currentStep);
      setSymmetryPage(nextRouteState.symmetryPage);
      setPatternPage(nextRouteState.patternPage);
      setViewJumpTick((current) => current + 1);
      setActiveGlossaryTerm(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!routeSyncReady) {
      return;
    }

    const mode = historyModeRef.current;
    historyModeRef.current = 'push';

    if (window.location.hash === currentRoute) {
      window.history.replaceState({ route: currentRoute }, '', currentRoute);
      return;
    }

    if (mode === 'replace') {
      window.history.replaceState({ route: currentRoute }, '', currentRoute);
      return;
    }

    window.history.pushState({ route: currentRoute }, '', currentRoute);
  }, [currentRoute, routeSyncReady]);

  useEffect(() => {
    if (!started) {
      return;
    }
    const variant: SceneVariant =
      currentStep === 1 ? 'synthesis' : currentStep === 2 ? 'thinking' : 'beam';
    setSceneCues((currentCues) => ({
      ...currentCues,
      [variant]: {
        ...currentCues[variant],
        message: INITIAL_SCENE_CUES[variant].message,
      },
    }));
  }, [currentStep, started]);

  useEffect(() => {
    if (!started) {
      return;
    }

    const activeStepRef =
      currentStep === 1 ? formulaStepRef : currentStep === 2 ? symmetryStepRef : patternStepRef;
    activeStepRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }, [currentStep, patternPage, started, symmetryPage, viewJumpTick]);

  useEffect(() => {
    if (!activeGlossaryTerm) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveGlossaryTerm(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGlossaryTerm]);

  const triggerScene = (variant: SceneVariant, message: string) => {
    setSceneCues((currentCues) => ({
      ...currentCues,
      [variant]: {
        message,
        reactionTick: currentCues[variant].reactionTick + 1,
      },
    }));
  };

  const getSceneHandlers = (variant: SceneVariant, message: string) => ({
    onFocus: () => triggerScene(variant, message),
    onPointerDown: () => triggerScene(variant, message),
  });

  const clearExperimentState = () => {
    setAtoms(createInitialAtoms());
    setBravais(null);
    setSpaceGroupNumber(null);
    setCell({ ...DEFAULT_CELL });
    setSimulation({ ...DEFAULT_SIMULATION_SETTINGS });
    setValidation(EMPTY_VALIDATION);
    setPattern(EMPTY_PATTERN);
    setCurrentStep(1);
    setSymmetryPage(0);
    setPatternPage(0);
    setSceneCues(createInitialSceneCues());
    setActiveGlossaryTerm(null);
  };

  const launchFreshExperiment = () => {
    historyModeRef.current = started ? 'replace' : 'push';
    clearExperimentState();
    setStarted(true);
    setViewJumpTick((current) => current + 1);
  };

  const finishExperiment = () => {
    historyModeRef.current = 'replace';
    clearExperimentState();
    setStarted(false);
    heroRef.current?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const applyDemo = (name: 'nacl' | 'silicon') => {
    const demo = createDemoStructure(name);
    historyModeRef.current = started ? 'replace' : 'push';
    setAtoms(demo.atoms);
    setBravais(demo.bravais);
    setSpaceGroupNumber(demo.spaceGroupNumber);
    setCell(demo.cell);
    setCurrentStep(1);
    setSymmetryPage(0);
    setPatternPage(0);
    setStarted(true);
    setActiveGlossaryTerm(null);
    setViewJumpTick((current) => current + 1);
    setSceneCues((currentCues) => ({
      ...currentCues,
      synthesis: {
        message: 'Demo recipe loaded.',
        reactionTick: currentCues.synthesis.reactionTick + 1,
      },
    }));
  };

  const topReflections = [...pattern.reflections]
    .sort((left, right) => right.relativeIntensity - left.relativeIntensity)
    .slice(0, 8);

  return (
    <main className="experiment-app">
      <section className="hero-shell" ref={heroRef}>
        <div className="hero-copy">
          <p className="eyebrow">{COPY.intro.eyebrow}</p>
          <h1>{COPY.intro.title}</h1>
          <p className="hero-subtitle">{COPY.intro.subtitle}</p>
          <div className="hero-badges">
            {COPY.intro.badges.map((badge) => (
              <span className="hero-badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={launchFreshExperiment} type="button">
              {COPY.intro.cta}
            </button>
            <button
              className="ghost-button hero-demo-button"
              onClick={() => applyDemo('nacl')}
              type="button"
            >
              Try NaCl demo
            </button>
            <button
              className="ghost-button hero-demo-button"
              onClick={() => applyDemo('silicon')}
              type="button"
            >
              Try Si demo
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-beam" />
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="hero-panel">
            <p>Today's mission</p>
            <strong>Can your crystal survive symmetry and leave a fingerprint on the detector?</strong>
          </div>
        </div>
      </section>

      <GlossaryDialog
        activeTerm={activeGlossaryTerm}
        onClose={() => setActiveGlossaryTerm(null)}
      />

      {started ? (
        <>
          <nav className="step-nav" aria-label="Experiment steps">
            <StepBadge
              active={currentStep === 1}
              unlocked
              label="1. Formula"
              onClick={() => {
                setCurrentStep(1);
              }}
            />
            <StepBadge
              active={currentStep === 2}
              unlocked={atomStepReady}
              label="2. Symmetry"
              onClick={() => {
                if (!atomStepReady) {
                  return;
                }
                setSymmetryPage(0);
                setCurrentStep(2);
              }}
            />
            <StepBadge
              active={currentStep === 3}
              unlocked={stepThreeReady}
              label="3. Pattern"
              onClick={() => {
                if (!stepThreeReady) {
                  return;
                }
                setPatternPage(0);
                setCurrentStep(3);
              }}
            />
          </nav>

          <div className="experiment-grid">
            <section
              className={`step-panel${currentStep === 1 ? ' is-visible' : ''}`}
              ref={formulaStepRef}
            >
              <div className="panel-heading">
                <p className="step-kicker">{COPY.steps[0].kicker}</p>
                <h2>{COPY.steps[0].title}</h2>
                <p>{COPY.steps[0].helper}</p>
              </div>

              <div className="step-workspace">
                <aside className="step-stage">
                  <div className="scene-sticky">
                    <StepScene
                      variant="synthesis"
                      bubbleText={sceneCues.synthesis.message}
                      reactionTick={sceneCues.synthesis.reactionTick}
                    />
                  </div>
                </aside>

                <div className="step-page">
                  <div className="formula-strip">
                    <span className="formula-label">Asymmetric-unit formula</span>
                    <strong>{formula || 'Add atoms to reveal the formula.'}</strong>
                  </div>

                  <TeachingCard
                    label={COPY.lessons.formula.title}
                    title="Build the asymmetric-unit recipe"
                    text={COPY.lessons.formula.text}
                    tip={COPY.lessons.formula.tip}
                    terms={FORMULA_TERMS}
                    onOpenTerm={setActiveGlossaryTerm}
                  />

                  <div className="info-banner">{COPY.callouts.formula}</div>

                  <div className="atom-table">
                    <div className="atom-head">
                      <span>Atom</span>
                      <span>Element</span>
                      <span>x</span>
                      <span>y</span>
                      <span>z</span>
                      <span />
                    </div>
                    {atoms.map((atom, index) => (
                      <div className="atom-row" key={atom.id}>
                        <span className="atom-label">{index + 1}</span>
                        <input
                          list="elements-list"
                          value={atom.element}
                          {...getSceneHandlers('synthesis', 'Choosing the atom.')}
                          onChange={(event) =>
                            setAtoms(
                              updateAtom(atoms, atom.id, {
                                element: normalizeElementSymbol(event.target.value),
                              }),
                            )
                          }
                          placeholder="Si"
                        />
                        {(['x', 'y', 'z'] as const).map((axis) => (
                          <input
                            key={axis}
                            aria-label={`Atom ${index + 1} ${axis} coordinate`}
                            type="number"
                            min="0"
                            max="1"
                            step="0.001"
                            value={atom[axis]}
                            {...getSceneHandlers('synthesis', 'Setting coordinates.')}
                            onChange={(event) =>
                              setAtoms(
                                updateAtom(atoms, atom.id, {
                                  [axis]: Number(event.target.value),
                                } as Partial<AtomSeed>),
                              )
                            }
                          />
                        ))}
                        <button
                          className="mini-button"
                          {...getSceneHandlers('synthesis', 'Editing the recipe.')}
                          onClick={() =>
                            setAtoms(atoms.filter((candidate) => candidate.id !== atom.id))
                          }
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <datalist id="elements-list">
                    {ELEMENTS.map((element) => (
                      <option value={element.symbol} key={element.symbol} />
                    ))}
                  </datalist>

                  <div className="panel-actions">
                    <button
                      className="ghost-button"
                      onClick={() => {
                        triggerScene('synthesis', 'New atom added.');
                        setAtoms([...atoms, createAtomSeed(atoms.length + 1)]);
                      }}
                      type="button"
                    >
                      Add atom
                    </button>
                    <button
                      className="primary-button"
                      disabled={!atomStepReady}
                      onClick={() => {
                        triggerScene('synthesis', 'Recipe complete.');
                        setSymmetryPage(0);
                        setCurrentStep(2);
                      }}
                      type="button"
                    >
                      Continue to symmetry
                    </button>
                  </div>

                  <MessageStack messages={atomMessages} />
                </div>
              </div>
            </section>

            <section
              className={`step-panel${currentStep === 2 ? ' is-visible' : ''}`}
              ref={symmetryStepRef}
            >
              <div className="panel-heading">
                <p className="step-kicker">{COPY.steps[1].kicker}</p>
                <h2>{COPY.steps[1].title}</h2>
                <p>{COPY.steps[1].helper}</p>
              </div>

              <div className="step-workspace">
                <aside className="step-stage">
                  <div className="scene-sticky">
                    <StepScene
                      variant="thinking"
                      bubbleText={sceneCues.thinking.message}
                      reactionTick={sceneCues.thinking.reactionTick}
                    />
                  </div>
                </aside>

                <div className="step-page">
                  <div className="lesson-badges" aria-label="Symmetry pages">
                    {COPY.lessons.symmetry.map((lesson, index) => (
                      <LessonBadge
                        active={symmetryPage === index}
                        key={lesson.label}
                        label={lesson.label}
                        onClick={() => setSymmetryPage(index as SymmetryPage)}
                        unlocked={index === 0 || Boolean(bravais)}
                      />
                    ))}
                  </div>

                  {symmetryPage === 0 ? (
                    <>
                      <TeachingCard
                        label={COPY.lessons.symmetry[0].label}
                        title={COPY.lessons.symmetry[0].title}
                        text={COPY.lessons.symmetry[0].text}
                        tip={COPY.lessons.symmetry[0].tip}
                        terms={SYMMETRY_PAGE_TERMS[0]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="bravais-grid">
                        {BRAVAIS_OPTIONS.map((option) => (
                          <button
                            className={`bravais-card${bravais === option.id ? ' is-selected' : ''}`}
                            key={option.id}
                            onClick={() => {
                              triggerScene('thinking', 'Testing the lattice.');
                              setBravais(option.id);
                            }}
                            type="button"
                          >
                            <strong>{option.label}</strong>
                            <span>{option.family}</span>
                            <small>{option.note}</small>
                          </button>
                        ))}
                      </div>

                      <div className="control-card selection-card">
                        <strong>Current lattice choice</strong>
                        <p>
                          {bravais
                            ? `${bravais} selected. Next we can choose the matching space group and the cell geometry.`
                            : 'No Bravais lattice selected yet. Pick one to unlock the next lesson page.'}
                        </p>
                      </div>

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('thinking', 'Back to the recipe.');
                            setCurrentStep(1);
                          }}
                          type="button"
                        >
                          Back to formula
                        </button>
                        <button
                          className="primary-button"
                          disabled={!bravais}
                          onClick={() => {
                            triggerScene('thinking', 'Lattice chosen. Moving to the cell setup.');
                            setSymmetryPage(1);
                          }}
                          type="button"
                        >
                          Continue to cell setup
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <TeachingCard
                        label={COPY.lessons.symmetry[1].label}
                        title={COPY.lessons.symmetry[1].title}
                        text={COPY.lessons.symmetry[1].text}
                        tip={COPY.lessons.symmetry[1].tip}
                        terms={SYMMETRY_PAGE_TERMS[1]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="info-banner">{COPY.callouts.symmetry}</div>

                      <div className="two-column symmetry-layout">
                        <div className="control-card">
                          <label className="field-stack">
                            <span className="field-label-row">
                              <span>Space group</span>
                              <GlossaryChip
                                onOpen={setActiveGlossaryTerm}
                                term="spaceGroup"
                              />
                            </span>
                            <select
                              value={spaceGroupNumber ?? ''}
                              {...getSceneHandlers('thinking', 'Matching the space group.')}
                              onChange={(event) => setSpaceGroupNumber(Number(event.target.value))}
                              disabled={!bravais}
                            >
                              <option value="">Choose a space group</option>
                              {availableSpaceGroups.map((spaceGroup) => (
                                <option value={spaceGroup.number} key={spaceGroup.number}>
                                  #{spaceGroup.number} {spaceGroup.hmSymbol}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="cell-grid">
                            {(Object.keys(FIELD_LABELS) as (keyof UnitCellInput)[]).map((field) => {
                              const editable = bravais
                                ? EDITABLE_FIELDS[bravais].includes(field)
                                : true;
                              return (
                                <label className="field-stack" key={field}>
                                  <span>{FIELD_LABELS[field]}</span>
                                  <input
                                    type="number"
                                    min={CELL_INPUT_RULES[field].min}
                                    max={CELL_INPUT_RULES[field].max}
                                    step={CELL_INPUT_RULES[field].step}
                                    value={editable ? cell[field] : lockedCell[field]}
                                    disabled={!editable}
                                    {...getSceneHandlers('thinking', 'Tuning the cell.')}
                                    onChange={(event) =>
                                      setCell({
                                        ...cell,
                                        [field]: Number(event.target.value),
                                      })
                                    }
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="control-card preview-card">
                          <CrystalPreview validation={validation} />
                          <div className="preview-copy">
                            <strong>Expanded-cell formula</strong>
                            <p>
                              {validation.summaryFormula ||
                                'Choose a lattice and a space group to expand the structure.'}
                            </p>
                            <p>
                              Active positions: <strong>{validation.expandedSites.length}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {validation.collisions.length > 0 ? (
                        <div className="collision-card">
                          {validation.collisions.map((collision) => (
                            <p key={collision.canonicalKey}>
                              {collision.atomIds.join(' + ')} collapse near (
                              {collision.position.map((value) => formatNumber(value, 3)).join(', ')}
                              ).
                            </p>
                          ))}
                        </div>
                      ) : null}

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('thinking', 'Returning to the lattice choice.');
                            setSymmetryPage(0);
                          }}
                          type="button"
                        >
                          Back to lattice
                        </button>
                        <button
                          className="primary-button"
                          disabled={!stepThreeReady}
                          onClick={() => {
                            triggerScene('thinking', 'Symmetry solved.');
                            setPatternPage(0);
                            setCurrentStep(3);
                          }}
                          type="button"
                        >
                          Continue to experiment
                        </button>
                      </div>

                      <MessageStack messages={validation.messages} />
                    </>
                  )}
                </div>
              </div>
            </section>

            <section
              className={`step-panel${currentStep === 3 ? ' is-visible' : ''}`}
              ref={patternStepRef}
            >
              <div className="panel-heading">
                <p className="step-kicker">{COPY.steps[2].kicker}</p>
                <h2>{COPY.steps[2].title}</h2>
                <p>{COPY.steps[2].helper}</p>
              </div>

              <div className="step-workspace">
                <aside className="step-stage">
                  <div className="scene-sticky">
                    <StepScene
                      variant="beam"
                      bubbleText={sceneCues.beam.message}
                      reactionTick={sceneCues.beam.reactionTick}
                    />
                  </div>
                </aside>

                <div className="step-page">
                  <div className="lesson-badges" aria-label="Pattern pages">
                    {COPY.lessons.pattern.map((lesson, index) => (
                      <LessonBadge
                        active={patternPage === index}
                        key={lesson.label}
                        label={lesson.label}
                        onClick={() => setPatternPage(index as PatternPage)}
                        unlocked={index <= patternPage}
                      />
                    ))}
                  </div>

                  {patternPage === 0 ? (
                    <>
                      <TeachingCard
                        label={COPY.lessons.pattern[0].label}
                        title={COPY.lessons.pattern[0].title}
                        text={COPY.lessons.pattern[0].text}
                        tip={COPY.lessons.pattern[0].tip}
                        terms={PATTERN_PAGE_TERMS[0]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="radiation-grid">
                        {([
                          {
                            mode: 'xray',
                            label: 'X-ray',
                            helper: 'Cu Ka default',
                            wavelength: 1.5406,
                          },
                          {
                            mode: 'neutron',
                            label: 'Neutron',
                            helper: 'Thermal CW default',
                            wavelength: 1.8,
                          },
                        ] as const).map((option) => (
                          <button
                            className={`radiation-card${
                              simulation.radiation === option.mode ? ' is-selected' : ''
                            }`}
                            key={option.mode}
                            onClick={() => {
                              triggerScene('beam', 'Selecting the source.');
                              setSimulation({
                                ...simulation,
                                radiation: option.mode,
                                wavelength: option.wavelength,
                              });
                            }}
                            type="button"
                          >
                            <strong>{option.label}</strong>
                            <span>{option.helper}</span>
                            <small>lambda = {option.wavelength.toFixed(4)} A</small>
                          </button>
                        ))}
                      </div>

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('beam', 'Back to symmetry.');
                            setCurrentStep(2);
                            setSymmetryPage(1);
                          }}
                          type="button"
                        >
                          Back to symmetry
                        </button>
                        <button
                          className="primary-button"
                          onClick={() => {
                            triggerScene('beam', 'Source locked. Next: wavelength.');
                            setPatternPage(1);
                          }}
                          type="button"
                        >
                          Continue to wavelength
                        </button>
                      </div>
                    </>
                  ) : null}

                  {patternPage === 1 ? (
                    <>
                      <TeachingCard
                        label={COPY.lessons.pattern[1].label}
                        title={COPY.lessons.pattern[1].title}
                        text={COPY.lessons.pattern[1].text}
                        tip={COPY.lessons.pattern[1].tip}
                        terms={PATTERN_PAGE_TERMS[1]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="control-card simulation-card">
                        <div className="field-stack">
                          <span>Selected source</span>
                          <strong>
                            {simulation.radiation === 'xray' ? 'X-ray source' : 'Neutron source'}
                          </strong>
                        </div>
                        <label className="field-stack">
                          <span>Wavelength lambda (A)</span>
                          <input
                            type="number"
                            min={SIMULATION_INPUT_RULES.wavelength.min}
                            max={SIMULATION_INPUT_RULES.wavelength.max}
                            step={SIMULATION_INPUT_RULES.wavelength.step}
                            value={simulation.wavelength}
                            {...getSceneHandlers('beam', 'Tuning the beam wavelength.')}
                            onChange={(event) =>
                              setSimulation({
                                ...simulation,
                                wavelength: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <p className="range-note">
                          Simulation window: {simulation.twoThetaMin} deg to{' '}
                          {simulation.twoThetaMax} deg with a {simulation.step} deg grid.
                        </p>
                      </div>

                      <MessageStack messages={patternSetupMessages} />

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('beam', 'Returning to the source selection.');
                            setPatternPage(0);
                          }}
                          type="button"
                        >
                          Back to source
                        </button>
                        <button
                          className="primary-button"
                          onClick={() => {
                            triggerScene('beam', 'Wavelength ready. Next: resolution.');
                            setPatternPage(2);
                          }}
                          type="button"
                        >
                          Continue to resolution
                        </button>
                      </div>
                    </>
                  ) : null}

                  {patternPage === 2 ? (
                    <>
                      <TeachingCard
                        label={COPY.lessons.pattern[2].label}
                        title={COPY.lessons.pattern[2].title}
                        text={COPY.lessons.pattern[2].text}
                        tip={COPY.lessons.pattern[2].tip}
                        terms={PATTERN_PAGE_TERMS[2]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="info-banner">{COPY.callouts.experiment}</div>

                      <div className="control-card simulation-card">
                        <div className="cell-grid compact-grid">
                          {([
                            ['U', 'U'],
                            ['V', 'V'],
                            ['W', 'W'],
                          ] as const).map(([field, label]) => (
                            <label className="field-stack" key={field}>
                              <span>{label}</span>
                              <input
                                type="number"
                                min={SIMULATION_INPUT_RULES[field].min}
                                max={SIMULATION_INPUT_RULES[field].max}
                                step={SIMULATION_INPUT_RULES[field].step}
                                value={simulation[field]}
                                {...getSceneHandlers('beam', 'Updating the detector resolution.')}
                                onChange={(event) =>
                                  setSimulation({
                                    ...simulation,
                                    [field]: Number(event.target.value),
                                  } as SimulationSettings)
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <p className="range-note">
                          The app checks the peak width across the whole 5 to 160 deg range before
                          unlocking the final figure.
                        </p>
                        <div className="glossary-chip-row compact">
                          <span>Resolution theory:</span>
                          <GlossaryChip
                            onOpen={setActiveGlossaryTerm}
                            term="cagliotiRelation"
                          />
                          <GlossaryChip
                            onOpen={setActiveGlossaryTerm}
                            term="cagliotiGaussianProfile"
                          />
                        </div>
                      </div>

                      <MessageStack messages={patternSetupMessages} />

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('beam', 'Returning to wavelength.');
                            setPatternPage(1);
                          }}
                          type="button"
                        >
                          Back to wavelength
                        </button>
                        <button
                          className="primary-button"
                          onClick={() => {
                            triggerScene('beam', 'Experiment configured. Showing the detector.');
                            setPatternPage(3);
                          }}
                          type="button"
                        >
                          Show the pattern
                        </button>
                      </div>
                    </>
                  ) : null}

                  {patternPage === 3 ? (
                    <>
                      <TeachingCard
                        label={COPY.lessons.pattern[3].label}
                        title={COPY.lessons.pattern[3].title}
                        text={COPY.lessons.pattern[3].text}
                        tip={COPY.lessons.pattern[3].tip}
                        terms={PATTERN_PAGE_TERMS[3]}
                        onOpenTerm={setActiveGlossaryTerm}
                      />

                      <div className="pattern-summary">
                        <span>
                          Source:{' '}
                          <strong>{simulation.radiation === 'xray' ? 'X-ray' : 'Neutron'}</strong>
                        </span>
                        <span>
                          lambda: <strong>{simulation.wavelength.toFixed(4)} A</strong>
                        </span>
                        <span>
                          Resolution:{' '}
                          <strong>
                            U {simulation.U} / V {simulation.V} / W {simulation.W}
                          </strong>
                        </span>
                      </div>

                      <div className="pattern-result-grid">
                        <div className="control-card pattern-plot-card">
                          <PowderPlot
                            pattern={pattern}
                            onInteract={(message) => triggerScene('beam', message)}
                          />
                          {!patternHasResult ? <MessageStack messages={pattern.messages} /> : null}
                        </div>

                        <div className="reflection-card compact-reflection-card">
                          <div className="panel-heading compact">
                            <h3>Most visible reflections</h3>
                            <p>
                              The strongest peaks help connect crystal symmetry to the detector
                              fingerprint.
                            </p>
                          </div>
                          <div className="reflection-table">
                            <div className="reflection-head">
                              <span>hkl</span>
                              <span>2theta</span>
                              <span>d (A)</span>
                              <span>Rel. I</span>
                            </div>
                            {topReflections.map((reflection) => (
                              <div
                                className="reflection-row"
                                key={`${reflection.h}-${reflection.k}-${reflection.l}-${reflection.twoTheta.toFixed(3)}`}
                              >
                                <span>
                                  ({reflection.h} {reflection.k} {reflection.l})
                                </span>
                                <span>{reflection.twoTheta.toFixed(2)} deg</span>
                                <span>{reflection.dSpacing.toFixed(3)}</span>
                                <span>{reflection.relativeIntensity.toFixed(1)}</span>
                              </div>
                            ))}
                            {topReflections.length === 0 ? (
                              <p className="range-note">No peaks yet.</p>
                            ) : null}
                          </div>
                          {patternHasResult ? <MessageStack messages={pattern.messages} /> : null}
                        </div>
                      </div>

                      <div className="panel-actions">
                        <button
                          className="ghost-button"
                          onClick={() => {
                            triggerScene('beam', 'Returning to resolution.');
                            setPatternPage(2);
                          }}
                          type="button"
                        >
                          Back to resolution
                        </button>
                        <button
                          className="primary-button"
                          onClick={finishExperiment}
                          type="button"
                        >
                          Finish experiment
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
