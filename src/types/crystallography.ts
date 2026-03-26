export type RadiationMode = 'xray' | 'neutron';

export type BravaisType =
  | 'aP'
  | 'mP'
  | 'mC'
  | 'oP'
  | 'oC'
  | 'oI'
  | 'oF'
  | 'tP'
  | 'tI'
  | 'hP'
  | 'hR'
  | 'cP'
  | 'cI'
  | 'cF';

export type CrystalSystemName =
  | 'Triclinic'
  | 'Monoclinic'
  | 'Orthorhombic'
  | 'Tetragonal'
  | 'Trigonal'
  | 'Hexagonal'
  | 'Cubic';

export type ValidationTone = 'error' | 'warning' | 'success' | 'info';

export type Vec3 = [number, number, number];

export interface AtomSeed {
  id: string;
  element: string;
  x: number;
  y: number;
  z: number;
}

export interface UnitCellInput {
  a: number;
  b: number;
  c: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface StructureModel {
  atoms: AtomSeed[];
  bravais: BravaisType;
  spaceGroupNumber: number;
  cell: UnitCellInput;
}

export interface SpaceGroupRecord {
  number: number;
  hmSymbol: string;
  hallSymbol: string;
  bravais: BravaisType;
  crystalSystem: CrystalSystemName;
  operations: string[];
}

export interface ValidationMessage {
  tone: ValidationTone;
  text: string;
}

export interface ExpandedSite {
  atomId: string;
  element: string;
  position: Vec3;
  canonicalKey: string;
}

export interface CollisionRecord {
  atomIds: string[];
  elementSymbols: string[];
  canonicalKey: string;
  position: Vec3;
}

export interface ValidationResult {
  valid: boolean;
  expandedSites: ExpandedSite[];
  collisions: CollisionRecord[];
  messages: ValidationMessage[];
  summaryFormula: string;
}

export interface SimulationSettings {
  radiation: RadiationMode;
  wavelength: number;
  U: number;
  V: number;
  W: number;
  twoThetaMin: number;
  twoThetaMax: number;
  step: number;
}

export interface PowderReflection {
  h: number;
  k: number;
  l: number;
  dSpacing: number;
  twoTheta: number;
  multiplicity: number;
  intensity: number;
  relativeIntensity: number;
}

export interface PowderCurvePoint {
  twoTheta: number;
  intensity: number;
  stickIntensity: number;
}

export interface PowderPatternResult {
  reflections: PowderReflection[];
  curve: PowderCurvePoint[];
  maxIntensity: number;
  messages: ValidationMessage[];
}
