import {
  CrystalSystem,
  SpaceGroup,
  type SpaceGroupInfo,
  UnitCellCentring,
} from '@chemistry/space-groups';

import type {
  BravaisType,
  CrystalSystemName,
  SpaceGroupRecord,
} from '../types/crystallography';

export interface BravaisOption {
  id: BravaisType;
  label: string;
  family: string;
  note: string;
}

function mapBravaisType(
  crystalSystem: CrystalSystemName,
  centring: UnitCellCentring,
): BravaisType {
  switch (crystalSystem) {
    case 'Triclinic':
      return 'aP';
    case 'Monoclinic':
      return centring === UnitCellCentring.P ? 'mP' : 'mC';
    case 'Orthorhombic':
      if (centring === UnitCellCentring.F) return 'oF';
      if (centring === UnitCellCentring.I) return 'oI';
      return centring === UnitCellCentring.P ? 'oP' : 'oC';
    case 'Tetragonal':
      return centring === UnitCellCentring.I ? 'tI' : 'tP';
    case 'Trigonal':
      return centring === UnitCellCentring.R ? 'hR' : 'hP';
    case 'Hexagonal':
      return 'hP';
    case 'Cubic':
      if (centring === UnitCellCentring.F) return 'cF';
      if (centring === UnitCellCentring.I) return 'cI';
      return 'cP';
    default:
      return 'aP';
  }
}

function compactHmSymbol(symbol: string) {
  return symbol.replace(/\s+/g, ' ').trim();
}

function toCrystalSystemName(system: CrystalSystem): CrystalSystemName {
  return system;
}

function toRecord(info: SpaceGroupInfo): SpaceGroupRecord {
  const crystalSystem = toCrystalSystemName(SpaceGroup.getCrystalSystem(info)!);
  const centring = SpaceGroup.getUnitCellCentring(info)!;

  return {
    number: info.id,
    hmSymbol: compactHmSymbol(info.hm),
    hallSymbol: info.hs,
    crystalSystem,
    bravais: mapBravaisType(crystalSystem, centring),
    operations: info.s,
  };
}

export const BRAVAIS_OPTIONS: BravaisOption[] = [
  { id: 'aP', label: 'aP', family: 'Triclinic primitive', note: 'Nothing is locked here, so this is the most free-form cell.' },
  { id: 'mP', label: 'mP', family: 'Monoclinic primitive', note: 'One angle bends, the other two stay at 90 degrees.' },
  { id: 'mC', label: 'mC', family: 'Monoclinic base-centered', note: 'Monoclinic, but with extra centering to create more symmetry mates.' },
  { id: 'oP', label: 'oP', family: 'Orthorhombic primitive', note: 'Three different lengths, all right angles.' },
  { id: 'oC', label: 'oC', family: 'Orthorhombic base-centered', note: 'Orthorhombic with extra centering on one pair of faces.' },
  { id: 'oI', label: 'oI', family: 'Orthorhombic body-centered', note: 'A centered point in the middle adds extra equivalent positions.' },
  { id: 'oF', label: 'oF', family: 'Orthorhombic face-centered', note: 'All faces get centering, which strongly shapes extinction rules.' },
  { id: 'tP', label: 'tP', family: 'Tetragonal primitive', note: 'Two equal in-plane lengths and one unique axis.' },
  { id: 'tI', label: 'tI', family: 'Tetragonal body-centered', note: 'Tetragonal symmetry plus a centered lattice point.' },
  { id: 'hP', label: 'hP', family: 'Hexagonal / trigonal primitive', note: 'This covers both hexagonal P groups and trigonal groups in P setting.' },
  { id: 'hR', label: 'hR', family: 'Rhombohedral', note: 'Handled in the hexagonal setting so the inputs stay beginner-friendly.' },
  { id: 'cP', label: 'cP', family: 'Cubic primitive', note: 'All lengths equal and all angles 90 degrees.' },
  { id: 'cI', label: 'cI', family: 'Cubic body-centered', note: 'A centered atom position changes which reflections survive.' },
  { id: 'cF', label: 'cF', family: 'Cubic face-centered', note: 'Classic for rock-salt and diamond-style extinction patterns.' },
];

export const SPACE_GROUPS: SpaceGroupRecord[] = SpaceGroup.getUniqueSpaceGroupsList()
  .map((entry) => SpaceGroup.getById(entry.id))
  .filter((entry): entry is SpaceGroupInfo => entry !== null)
  .map(toRecord);

export const SPACE_GROUPS_BY_BRAVAIS = SPACE_GROUPS.reduce<Record<BravaisType, SpaceGroupRecord[]>>(
  (groups, spaceGroup) => {
    groups[spaceGroup.bravais].push(spaceGroup);
    return groups;
  },
  { aP: [], mP: [], mC: [], oP: [], oC: [], oI: [], oF: [], tP: [], tI: [], hP: [], hR: [], cP: [], cI: [], cF: [] },
);

export function getSpaceGroupByNumber(number: number | null | undefined) {
  if (!number) return null;
  return SPACE_GROUPS.find((spaceGroup) => spaceGroup.number === number) ?? null;
}
