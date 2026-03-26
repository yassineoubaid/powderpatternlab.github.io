import type {
  AtomSeed,
  BravaisType,
  PowderCurvePoint,
  PowderPatternResult,
  PowderReflection,
  SimulationSettings,
  SpaceGroupRecord,
  StructureModel,
  UnitCellInput,
  ValidationMessage,
  ValidationResult,
  Vec3,
} from '../types/crystallography';
import {
  ELEMENTS,
  NEUTRON_SCATTERING_LENGTHS,
  XRAY_FORM_FACTORS,
} from '../data/generated/scatteringData';

const TAU = Math.PI * 2;
const CANONICAL_PRECISION = 1e-5;
const EPSILON = 1e-8;

type ParsedOperation = {
  rotation: [Vec3, Vec3, Vec3];
  translation: Vec3;
};

const VALID_ELEMENT_SYMBOLS = new Set(ELEMENTS.map((element) => element.symbol));
const parsedOperationCache = new Map<string, ParsedOperation>();

export const DEFAULT_CELL: UnitCellInput = {
  a: 5.64,
  b: 5.64,
  c: 5.64,
  alpha: 90,
  beta: 90,
  gamma: 90,
};

export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  radiation: 'xray',
  wavelength: 1.5406,
  U: 0.02,
  V: 0,
  W: 0.01,
  twoThetaMin: 5,
  twoThetaMax: 160,
  step: 0.02,
};

export const ATOM_COLOR_MAP: Record<string, string> = {
  H: '#f6f6f6',
  C: '#2b3240',
  N: '#4d8dff',
  O: '#ff6b6b',
  F: '#65d6a6',
  Na: '#f4b744',
  Mg: '#63c0ff',
  Al: '#ffcdb8',
  Si: '#f7b267',
  P: '#ff945a',
  S: '#ffe56c',
  Cl: '#57cf82',
  K: '#9f7aea',
  Ca: '#6dd3ce',
  Fe: '#d96c47',
  Co: '#5d8aa8',
  Ni: '#5cb85c',
  Cu: '#b87333',
  Zn: '#7f93ff',
  Br: '#b85c38',
  Ag: '#cbd5e1',
  I: '#7b61ff',
  Au: '#ffd166',
};

export function createAtomSeed(index: number): AtomSeed {
  return {
    id: `atom-${index}-${Math.random().toString(36).slice(2, 8)}`,
    element: '',
    x: 0,
    y: 0,
    z: 0,
  };
}

export function createDemoStructure(name: 'nacl' | 'silicon') {
  if (name === 'silicon') {
    return {
      atoms: [{ id: 'si-1', element: 'Si', x: 0, y: 0, z: 0 }],
      bravais: 'cF' as const,
      spaceGroupNumber: 227,
      cell: { a: 5.431, b: 5.431, c: 5.431, alpha: 90, beta: 90, gamma: 90 },
    };
  }

  return {
    atoms: [
      { id: 'na-1', element: 'Na', x: 0, y: 0, z: 0 },
      { id: 'cl-1', element: 'Cl', x: 0.5, y: 0.5, z: 0.5 },
    ],
    bravais: 'cF' as const,
    spaceGroupNumber: 225,
    cell: { a: 5.64, b: 5.64, c: 5.64, alpha: 90, beta: 90, gamma: 90 },
  };
}

export function normalizeElementSymbol(symbol: string) {
  const trimmed = symbol.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function isValidElementSymbol(symbol: string) {
  return VALID_ELEMENT_SYMBOLS.has(normalizeElementSymbol(symbol));
}

export function wrapFractional(value: number) {
  const normalized = value - Math.floor(value);
  return normalized < 0 ? normalized + 1 : normalized;
}

export function canonicalizeFractional(value: number) {
  const wrapped = wrapFractional(value);
  const rounded = Math.round(wrapped / CANONICAL_PRECISION) * CANONICAL_PRECISION;
  return rounded >= 1 ? 0 : rounded;
}

export function canonicalKey(position: Vec3) {
  return position.map((coordinate) => canonicalizeFractional(coordinate).toFixed(5)).join('|');
}

function parseFraction(token: string) {
  if (token.includes('/')) {
    const [numerator, denominator] = token.split('/').map(Number);
    return numerator / denominator;
  }

  return Number(token);
}

function parseCoordinateExpression(expression: string) {
  const sanitized = expression.replace(/\s+/g, '');
  const prefixed =
    sanitized.startsWith('+') || sanitized.startsWith('-') ? sanitized : `+${sanitized}`;
  const terms = prefixed.match(/[+-][^+-]+/g) ?? [];
  const coeffs: Vec3 = [0, 0, 0];
  let offset = 0;

  for (const term of terms) {
    const sign = term.startsWith('-') ? -1 : 1;
    const body = term.slice(1);

    if (body === 'x') {
      coeffs[0] += sign;
      continue;
    }
    if (body === 'y') {
      coeffs[1] += sign;
      continue;
    }
    if (body === 'z') {
      coeffs[2] += sign;
      continue;
    }

    offset += sign * parseFraction(body);
  }

  return { coeffs, offset };
}

function parseOperation(operation: string): ParsedOperation {
  const cached = parsedOperationCache.get(operation);
  if (cached) return cached;

  const [xExpr, yExpr, zExpr] = operation.split(',');
  const parsedX = parseCoordinateExpression(xExpr);
  const parsedY = parseCoordinateExpression(yExpr);
  const parsedZ = parseCoordinateExpression(zExpr);

  const parsed: ParsedOperation = {
    rotation: [parsedX.coeffs, parsedY.coeffs, parsedZ.coeffs],
    translation: [parsedX.offset, parsedY.offset, parsedZ.offset],
  };

  parsedOperationCache.set(operation, parsed);
  return parsed;
}

function applyOperation(position: Vec3, operation: ParsedOperation): Vec3 {
  const [x, y, z] = position;
  return [
    wrapFractional(
      operation.rotation[0][0] * x +
        operation.rotation[0][1] * y +
        operation.rotation[0][2] * z +
        operation.translation[0],
    ),
    wrapFractional(
      operation.rotation[1][0] * x +
        operation.rotation[1][1] * y +
        operation.rotation[1][2] * z +
        operation.translation[1],
    ),
    wrapFractional(
      operation.rotation[2][0] * x +
        operation.rotation[2][1] * y +
        operation.rotation[2][2] * z +
        operation.translation[2],
    ),
  ];
}

function transposeRotation(rotation: [Vec3, Vec3, Vec3]): [Vec3, Vec3, Vec3] {
  return [
    [rotation[0][0], rotation[1][0], rotation[2][0]],
    [rotation[0][1], rotation[1][1], rotation[2][1]],
    [rotation[0][2], rotation[1][2], rotation[2][2]],
  ];
}

function applyRotationToHkl(hkl: Vec3, rotation: [Vec3, Vec3, Vec3]): Vec3 {
  const transpose = transposeRotation(rotation);
  return [
    transpose[0][0] * hkl[0] + transpose[0][1] * hkl[1] + transpose[0][2] * hkl[2],
    transpose[1][0] * hkl[0] + transpose[1][1] * hkl[1] + transpose[1][2] * hkl[2],
    transpose[2][0] * hkl[0] + transpose[2][1] * hkl[1] + transpose[2][2] * hkl[2],
  ];
}

function hklKey(hkl: Vec3) {
  return `${hkl[0]},${hkl[1]},${hkl[2]}`;
}

function compareHkl(left: Vec3, right: Vec3) {
  if (left[0] !== right[0]) return left[0] - right[0];
  if (left[1] !== right[1]) return left[1] - right[1];
  return left[2] - right[2];
}

function orbitForReflection(hkl: Vec3, spaceGroup: SpaceGroupRecord) {
  const indices = new Map<string, Vec3>();

  for (const operationText of spaceGroup.operations) {
    const operation = parseOperation(operationText);
    const rotated = applyRotationToHkl(hkl, operation.rotation);
    const inverted: Vec3 = [-rotated[0], -rotated[1], -rotated[2]];
    indices.set(hklKey(rotated), rotated);
    indices.set(hklKey(inverted), inverted);
  }

  const orbit = [...indices.values()].sort(compareHkl);
  return {
    canonical: orbit[0],
    multiplicity: orbit.length,
  };
}

function determinant3x3(matrix: number[][]) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function invert3x3(matrix: number[][]) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const determinant = determinant3x3(matrix);
  if (Math.abs(determinant) < EPSILON) return null;

  return [
    [(e * i - f * h) / determinant, (c * h - b * i) / determinant, (b * f - c * e) / determinant],
    [(f * g - d * i) / determinant, (a * i - c * g) / determinant, (c * d - a * f) / determinant],
    [(d * h - e * g) / determinant, (b * g - a * h) / determinant, (a * e - b * d) / determinant],
  ];
}

export function applyBravaisConstraints(
  bravais: BravaisType | null,
  cell: UnitCellInput,
): UnitCellInput {
  if (!bravais) return { ...cell };

  switch (bravais) {
    case 'aP':
      return { ...cell };
    case 'mP':
    case 'mC':
      return { a: cell.a, b: cell.b, c: cell.c, alpha: 90, beta: cell.beta, gamma: 90 };
    case 'oP':
    case 'oC':
    case 'oI':
    case 'oF':
      return { a: cell.a, b: cell.b, c: cell.c, alpha: 90, beta: 90, gamma: 90 };
    case 'tP':
    case 'tI':
      return { a: cell.a, b: cell.a, c: cell.c, alpha: 90, beta: 90, gamma: 90 };
    case 'hP':
    case 'hR':
      return { a: cell.a, b: cell.a, c: cell.c, alpha: 90, beta: 90, gamma: 120 };
    case 'cP':
    case 'cI':
    case 'cF':
      return { a: cell.a, b: cell.a, c: cell.a, alpha: 90, beta: 90, gamma: 90 };
  }
}

export function validateAtomSeeds(atoms: AtomSeed[]) {
  const messages: ValidationMessage[] = [];

  if (atoms.length === 0) {
    messages.push({ tone: 'error', text: 'Add at least one atom to your asymmetric unit before moving on.' });
  }

  atoms.forEach((atom, index) => {
    const label = `Atom ${index + 1}`;
    const normalizedElement = normalizeElementSymbol(atom.element);

    if (!normalizedElement) {
      messages.push({ tone: 'error', text: `${label} needs an element symbol.` });
      return;
    }

    if (!isValidElementSymbol(normalizedElement)) {
      messages.push({ tone: 'error', text: `${label} uses "${atom.element}", which is not a supported element symbol.` });
    }

    for (const [axis, value] of [['x', atom.x], ['y', atom.y], ['z', atom.z]] as const) {
      if (!Number.isFinite(value)) {
        messages.push({ tone: 'error', text: `${label} needs a valid ${axis} fractional coordinate.` });
        continue;
      }

      if (value < 0 || value > 1) {
        messages.push({ tone: 'error', text: `${label} has ${axis} = ${value.toFixed(3)}. Fractional coordinates must stay between 0 and 1.` });
      }
    }
  });

  return messages;
}

export function buildFormulaFromCounts(counts: Record<string, number>) {
  const symbols = Object.keys(counts).filter((symbol) => counts[symbol] > 0);
  const hasCarbon = symbols.includes('C');
  const orderedSymbols = symbols.sort((left, right) => {
    if (hasCarbon) {
      if (left === 'C') return -1;
      if (right === 'C') return 1;
      if (left === 'H') return right === 'C' ? 1 : -1;
      if (right === 'H') return left === 'C' ? -1 : 1;
    }
    return left.localeCompare(right);
  });

  return orderedSymbols
    .map((symbol) => `${symbol}${counts[symbol] === 1 ? '' : counts[symbol]}`)
    .join('');
}

export function buildFormulaFromAtoms(atoms: AtomSeed[]) {
  const counts: Record<string, number> = {};
  for (const atom of atoms) {
    const symbol = normalizeElementSymbol(atom.element);
    if (!symbol) continue;
    counts[symbol] = (counts[symbol] ?? 0) + 1;
  }
  return buildFormulaFromCounts(counts);
}

export function getElementColor(symbol: string) {
  return ATOM_COLOR_MAP[symbol] ?? '#7dd3fc';
}

function getMetricTensor(cell: UnitCellInput) {
  const alpha = (cell.alpha * Math.PI) / 180;
  const beta = (cell.beta * Math.PI) / 180;
  const gamma = (cell.gamma * Math.PI) / 180;

  return [
    [cell.a * cell.a, cell.a * cell.b * Math.cos(gamma), cell.a * cell.c * Math.cos(beta)],
    [cell.a * cell.b * Math.cos(gamma), cell.b * cell.b, cell.b * cell.c * Math.cos(alpha)],
    [cell.a * cell.c * Math.cos(beta), cell.b * cell.c * Math.cos(alpha), cell.c * cell.c],
  ];
}

function getReciprocalMetricTensor(cell: UnitCellInput) {
  return invert3x3(getMetricTensor(cell));
}

export function validateCell(cell: UnitCellInput) {
  const messages: ValidationMessage[] = [];
  if (cell.a <= 0 || cell.b <= 0 || cell.c <= 0) {
    messages.push({ tone: 'error', text: 'All lattice lengths must be strictly positive.' });
  }
  for (const [label, angle] of [['alpha', cell.alpha], ['beta', cell.beta], ['gamma', cell.gamma]] as const) {
    if (!(angle > 0 && angle < 180)) {
      messages.push({ tone: 'error', text: `Angle ${label} must stay between 0 and 180 degrees.` });
    }
  }
  if (!getReciprocalMetricTensor(cell)) {
    messages.push({ tone: 'error', text: 'These lattice parameters collapse the unit cell, so the experiment cannot continue.' });
  }
  return messages;
}

function sanitizeAtomSeeds(atoms: AtomSeed[]) {
  return atoms.map((atom) => ({
    ...atom,
    element: normalizeElementSymbol(atom.element),
    x: wrapFractional(atom.x),
    y: wrapFractional(atom.y),
    z: wrapFractional(atom.z),
  }));
}

export function validateStructure(structure: StructureModel, spaceGroup: SpaceGroupRecord): ValidationResult {
  const atomMessages = validateAtomSeeds(structure.atoms);
  const cell = applyBravaisConstraints(structure.bravais, structure.cell);
  const cellMessages = validateCell(cell);
  const messages = [...atomMessages, ...cellMessages];

  if (messages.some((message) => message.tone === 'error')) {
    return { valid: false, expandedSites: [], collisions: [], messages, summaryFormula: buildFormulaFromAtoms(structure.atoms) };
  }

  const seeds = sanitizeAtomSeeds(structure.atoms);
  const expandedSites: ValidationResult['expandedSites'] = [];
  const positionOwners = new Map<string, ValidationResult['expandedSites']>();

  for (const atom of seeds) {
    const uniqueBySeed = new Map<string, ValidationResult['expandedSites'][number]>();

    for (const operationText of spaceGroup.operations) {
      const operation = parseOperation(operationText);
      const position = applyOperation([atom.x, atom.y, atom.z], operation);
      const key = canonicalKey(position);
      if (!uniqueBySeed.has(key)) {
        uniqueBySeed.set(key, {
          atomId: atom.id,
          element: atom.element,
          position: [canonicalizeFractional(position[0]), canonicalizeFractional(position[1]), canonicalizeFractional(position[2])],
          canonicalKey: key,
        });
      }
    }

    for (const site of uniqueBySeed.values()) {
      expandedSites.push(site);
      const ownedSites = positionOwners.get(site.canonicalKey) ?? [];
      ownedSites.push(site);
      positionOwners.set(site.canonicalKey, ownedSites);
    }
  }

  const collisions = [...positionOwners.entries()]
    .map(([key, sites]) => {
      const atomIds = [...new Set(sites.map((site) => site.atomId))];
      if (atomIds.length <= 1) return null;
      return {
        canonicalKey: key,
        atomIds,
        elementSymbols: [...new Set(sites.map((site) => site.element))],
        position: sites[0].position,
      };
    })
    .filter((collision): collision is ValidationResult['collisions'][number] => collision !== null);

  if (collisions.length > 0) {
    messages.push({
      tone: 'error',
      text: 'Some user-defined atoms collapse onto the same crystallographic site after symmetry expansion. Change the formula or the coordinates before simulating the pattern.',
    });
  } else {
    messages.push({
      tone: 'success',
      text: `Symmetry check passed. ${expandedSites.length} crystallographic positions are active in the expanded cell.`,
    });
  }

  const expandedCounts: Record<string, number> = {};
  for (const site of expandedSites) {
    expandedCounts[site.element] = (expandedCounts[site.element] ?? 0) + 1;
  }

  return {
    valid: collisions.length === 0,
    expandedSites,
    collisions,
    messages,
    summaryFormula: buildFormulaFromCounts(expandedCounts),
  };
}

function dotMetric(vector: Vec3, metric: number[][]) {
  return (
    vector[0] * (metric[0][0] * vector[0] + metric[0][1] * vector[1] + metric[0][2] * vector[2]) +
    vector[1] * (metric[1][0] * vector[0] + metric[1][1] * vector[1] + metric[1][2] * vector[2]) +
    vector[2] * (metric[2][0] * vector[0] + metric[2][1] * vector[1] + metric[2][2] * vector[2])
  );
}

function computeDSpacing(hkl: Vec3, reciprocalMetric: number[][]) {
  const inverseDSquared = dotMetric(hkl, reciprocalMetric);
  if (inverseDSquared <= EPSILON) return null;
  return 1 / Math.sqrt(inverseDSquared);
}

function getReflectionBounds(cell: UnitCellInput, dMin: number) {
  const reciprocalMetric = getReciprocalMetricTensor(cell)!;
  const aStar = Math.sqrt(reciprocalMetric[0][0]);
  const bStar = Math.sqrt(reciprocalMetric[1][1]);
  const cStar = Math.sqrt(reciprocalMetric[2][2]);

  return {
    h: Math.max(1, Math.ceil(1 / (dMin * aStar)) + 1),
    k: Math.max(1, Math.ceil(1 / (dMin * bStar)) + 1),
    l: Math.max(1, Math.ceil(1 / (dMin * cStar)) + 1),
  };
}

function xrayFormFactor(element: string, s: number) {
  const record = XRAY_FORM_FACTORS[element];
  if (!record) return null;
  return (
    record.a[0] * Math.exp(-record.b[0] * s * s) +
    record.a[1] * Math.exp(-record.b[1] * s * s) +
    record.a[2] * Math.exp(-record.b[2] * s * s) +
    record.a[3] * Math.exp(-record.b[3] * s * s) +
    record.c
  );
}

function neutronScatteringLength(element: string) {
  return NEUTRON_SCATTERING_LENGTHS[element] ?? null;
}

function phaseForReflection(hkl: Vec3, position: Vec3) {
  return TAU * (hkl[0] * position[0] + hkl[1] * position[1] + hkl[2] * position[2]);
}

function lorentzPolarization(twoThetaRadians: number) {
  const theta = twoThetaRadians / 2;
  return (1 + Math.cos(twoThetaRadians) ** 2) / (Math.sin(theta) ** 2 * Math.cos(theta));
}

function lorentzNeutron(twoThetaRadians: number) {
  const theta = twoThetaRadians / 2;
  return 1 / (Math.sin(theta) ** 2 * Math.cos(theta));
}

function getGaussianSigma(fwhm: number) {
  return fwhm / (2 * Math.sqrt(2 * Math.log(2)));
}

export function simulatePowderPattern(
  structure: StructureModel,
  spaceGroup: SpaceGroupRecord,
  validation: ValidationResult,
  settings: SimulationSettings,
): PowderPatternResult {
  const messages: ValidationMessage[] = [];

  if (!validation.valid) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: 'Fix the symmetry conflicts before launching the diffraction simulation.' }] };
  }
  if (!(settings.wavelength > 0)) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: 'The wavelength must be strictly positive.' }] };
  }
  if (!(settings.twoThetaMax > settings.twoThetaMin) || settings.step <= 0) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: 'The 2theta range or grid spacing is invalid.' }] };
  }

  const cell = applyBravaisConstraints(structure.bravais, structure.cell);
  const reciprocalMetric = getReciprocalMetricTensor(cell);
  if (!reciprocalMetric) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: 'The unit cell is not invertible, so no diffraction pattern can be computed.' }] };
  }

  const missingData = new Set<string>();
  for (const site of validation.expandedSites) {
    const hasData = settings.radiation === 'xray'
      ? Boolean(XRAY_FORM_FACTORS[site.element])
      : neutronScatteringLength(site.element) !== null;
    if (!hasData) missingData.add(site.element);
  }
  if (missingData.size > 0) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: `The ${settings.radiation} dataset does not include ${[...missingData].sort().join(', ')}.` }] };
  }

  const thetaMax = (settings.twoThetaMax / 2) * (Math.PI / 180);
  const dMin = settings.wavelength / (2 * Math.sin(thetaMax));
  const bounds = getReflectionBounds(cell, dMin);

  const rawReflections: PowderReflection[] = [];
  const seenOrbitKeys = new Set<string>();

  for (let h = -bounds.h; h <= bounds.h; h += 1) {
    for (let k = -bounds.k; k <= bounds.k; k += 1) {
      for (let l = -bounds.l; l <= bounds.l; l += 1) {
        if (h === 0 && k === 0 && l === 0) continue;

        const orbit = orbitForReflection([h, k, l], spaceGroup);
        const orbitKey = hklKey(orbit.canonical);
        if (seenOrbitKeys.has(orbitKey)) continue;
        seenOrbitKeys.add(orbitKey);

        const dSpacing = computeDSpacing(orbit.canonical, reciprocalMetric);
        if (!dSpacing || dSpacing < dMin) continue;

        const argument = settings.wavelength / (2 * dSpacing);
        if (argument > 1 || argument <= 0) continue;

        const theta = Math.asin(argument);
        const twoThetaRadians = theta * 2;
        const twoTheta = (twoThetaRadians * 180) / Math.PI;
        if (twoTheta < settings.twoThetaMin || twoTheta > settings.twoThetaMax) continue;

        const s = 1 / (2 * dSpacing);
        let real = 0;
        let imaginary = 0;

        for (const site of validation.expandedSites) {
          const scattering = settings.radiation === 'xray'
            ? xrayFormFactor(site.element, s)
            : neutronScatteringLength(site.element);
          if (scattering === null) continue;

          const phase = phaseForReflection(orbit.canonical, site.position);
          real += scattering * Math.cos(phase);
          imaginary += scattering * Math.sin(phase);
        }

        const structureFactorSquared = real * real + imaginary * imaginary;
        if (structureFactorSquared < EPSILON) continue;

        const correction = settings.radiation === 'xray'
          ? lorentzPolarization(twoThetaRadians)
          : lorentzNeutron(twoThetaRadians);
        const intensity = structureFactorSquared * orbit.multiplicity * correction;
        if (intensity <= EPSILON || !Number.isFinite(intensity)) continue;

        rawReflections.push({
          h: orbit.canonical[0],
          k: orbit.canonical[1],
          l: orbit.canonical[2],
          dSpacing,
          twoTheta,
          multiplicity: orbit.multiplicity,
          intensity,
          relativeIntensity: 0,
        });
      }
    }
  }

  rawReflections.sort((left, right) => left.twoTheta - right.twoTheta);
  if (rawReflections.length === 0) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'warning', text: 'No reflections fall inside the current wavelength and 2theta window.' }] };
  }

  const points: PowderCurvePoint[] = [];
  for (let twoTheta = settings.twoThetaMin; twoTheta <= settings.twoThetaMax + settings.step * 0.5; twoTheta += settings.step) {
    points.push({ twoTheta: Number(twoTheta.toFixed(4)), intensity: 0, stickIntensity: 0 });
  }

  let resolutionError = false;
  for (const reflection of rawReflections) {
    const thetaRadians = (reflection.twoTheta / 2) * (Math.PI / 180);
    const hSquared = settings.U * Math.tan(thetaRadians) ** 2 + settings.V * Math.tan(thetaRadians) + settings.W;
    if (!(hSquared > 0)) {
      resolutionError = true;
      break;
    }

    const sigma = getGaussianSigma(Math.sqrt(hSquared));
    const reach = sigma * 4;
    const maxCurveIndex = Math.round((reflection.twoTheta - settings.twoThetaMin) / settings.step);
    if (points[maxCurveIndex]) {
      points[maxCurveIndex].stickIntensity += reflection.intensity;
    }

    const startIndex = Math.max(0, Math.floor((reflection.twoTheta - reach - settings.twoThetaMin) / settings.step));
    const endIndex = Math.min(points.length - 1, Math.ceil((reflection.twoTheta + reach - settings.twoThetaMin) / settings.step));

    for (let index = startIndex; index <= endIndex; index += 1) {
      const delta = points[index].twoTheta - reflection.twoTheta;
      const gaussian = Math.exp(-(delta * delta) / (2 * sigma * sigma));
      points[index].intensity += reflection.intensity * gaussian;
    }
  }

  if (resolutionError) {
    return { reflections: [], curve: [], maxIntensity: 0, messages: [{ tone: 'error', text: 'These U, V, W values create a non-physical peak width in the selected 2theta range. Increase W or reduce the negative terms.' }] };
  }

  const maxIntensity = Math.max(
    ...rawReflections.map((reflection) => reflection.intensity),
    ...points.map((point) => point.intensity),
  );

  const reflections = rawReflections.map((reflection) => ({
    ...reflection,
    relativeIntensity: (reflection.intensity / maxIntensity) * 100,
  }));

  const curve = points.map((point) => ({
    ...point,
    intensity: (point.intensity / maxIntensity) * 100,
    stickIntensity: (point.stickIntensity / maxIntensity) * 100,
  }));

  messages.push({ tone: 'info', text: `Calculated ${reflections.length} reflections and broadened them with a Caglioti-style Gaussian profile.` });
  return { reflections, curve, maxIntensity: 100, messages };
}
