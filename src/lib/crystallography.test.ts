import { getSpaceGroupByNumber, SPACE_GROUPS_BY_BRAVAIS } from '../data/spaceGroups';
import {
  DEFAULT_SIMULATION_SETTINGS,
  applyBravaisConstraints,
  createDemoStructure,
  simulatePowderPattern,
  validateStructure,
} from './crystallography';

describe('crystallography helpers', () => {
  it('filters space groups by Bravais lattice', () => {
    const cubicFaceCentered = SPACE_GROUPS_BY_BRAVAIS.cF.map((group) => group.number);
    expect(cubicFaceCentered).toContain(225);
    expect(cubicFaceCentered).toContain(227);
    expect(cubicFaceCentered).not.toContain(221);
  });

  it('locks cubic lattice parameters together', () => {
    const constrained = applyBravaisConstraints('cF', {
      a: 5.64,
      b: 6.1,
      c: 7.2,
      alpha: 88,
      beta: 92,
      gamma: 94,
    });

    expect(constrained.a).toBe(5.64);
    expect(constrained.b).toBe(5.64);
    expect(constrained.c).toBe(5.64);
    expect(constrained.alpha).toBe(90);
    expect(constrained.beta).toBe(90);
    expect(constrained.gamma).toBe(90);
  });

  it('allows valid special positions but rejects exact overlaps', () => {
    const spaceGroup = getSpaceGroupByNumber(221);
    if (!spaceGroup) {
      throw new Error('Expected P m -3 m to exist');
    }

    const valid = validateStructure(
      {
        atoms: [{ id: 'cs', element: 'Cs', x: 0, y: 0, z: 0 }],
        bravais: 'cP',
        spaceGroupNumber: 221,
        cell: { a: 4.12, b: 4.12, c: 4.12, alpha: 90, beta: 90, gamma: 90 },
      },
      spaceGroup,
    );
    expect(valid.valid).toBe(true);

    const invalid = validateStructure(
      {
        atoms: [
          { id: 'cs-1', element: 'Cs', x: 0, y: 0, z: 0 },
          { id: 'cs-2', element: 'Cs', x: 0, y: 0, z: 0 },
        ],
        bravais: 'cP',
        spaceGroupNumber: 221,
        cell: { a: 4.12, b: 4.12, c: 4.12, alpha: 90, beta: 90, gamma: 90 },
      },
      spaceGroup,
    );

    expect(invalid.valid).toBe(false);
    expect(invalid.collisions).toHaveLength(1);
  });

  it('produces different X-ray and neutron intensities for the same structure', () => {
    const structure = createDemoStructure('nacl');
    const spaceGroup = getSpaceGroupByNumber(structure.spaceGroupNumber);
    if (!spaceGroup) {
      throw new Error('Expected F m -3 m to exist');
    }

    const validation = validateStructure(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
    );

    const xray = simulatePowderPattern(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
      validation,
      DEFAULT_SIMULATION_SETTINGS,
    );
    const neutron = simulatePowderPattern(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
      validation,
      {
        ...DEFAULT_SIMULATION_SETTINGS,
        radiation: 'neutron',
        wavelength: 1.8,
      },
    );

    expect(xray.reflections.length).toBeGreaterThan(0);
    expect(neutron.reflections.length).toBeGreaterThan(0);
    expect(xray.reflections[0].relativeIntensity).not.toBeCloseTo(
      neutron.reflections[0].relativeIntensity,
      3,
    );
  });

  it('broadens peaks when W increases without moving reflection centers', () => {
    const structure = createDemoStructure('silicon');
    const spaceGroup = getSpaceGroupByNumber(structure.spaceGroupNumber);
    if (!spaceGroup) {
      throw new Error('Expected F d -3 m to exist');
    }

    const validation = validateStructure(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
    );

    const narrow = simulatePowderPattern(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
      validation,
      {
        ...DEFAULT_SIMULATION_SETTINGS,
        W: 0.003,
      },
    );

    const broad = simulatePowderPattern(
      {
        atoms: structure.atoms,
        bravais: structure.bravais,
        spaceGroupNumber: structure.spaceGroupNumber,
        cell: structure.cell,
      },
      spaceGroup,
      validation,
      {
        ...DEFAULT_SIMULATION_SETTINGS,
        W: 0.03,
      },
    );

    expect(narrow.reflections[0].twoTheta).toBeCloseTo(broad.reflections[0].twoTheta, 8);

    const peakIndex = broad.curve.findIndex(
      (point) => point.twoTheta >= broad.reflections[0].twoTheta,
    );

    expect(peakIndex).toBeGreaterThan(0);
    expect(broad.curve[peakIndex + 2].intensity).toBeGreaterThan(
      narrow.curve[peakIndex + 2].intensity,
    );
  });

  it('fails gracefully when a huge cell would create too many reflections', () => {
    const structure = createDemoStructure('nacl');
    const spaceGroup = getSpaceGroupByNumber(structure.spaceGroupNumber);
    if (!spaceGroup) {
      throw new Error('Expected F m -3 m to exist');
    }

    const oversizedStructure = {
      atoms: structure.atoms,
      bravais: structure.bravais,
      spaceGroupNumber: structure.spaceGroupNumber,
      cell: { a: 70, b: 70, c: 70, alpha: 90, beta: 90, gamma: 90 },
    };

    const validation = validateStructure(oversizedStructure, spaceGroup);
    const pattern = simulatePowderPattern(
      oversizedStructure,
      spaceGroup,
      validation,
      DEFAULT_SIMULATION_SETTINGS,
    );

    expect(pattern.reflections).toHaveLength(0);
    expect(pattern.curve).toHaveLength(0);
    expect(pattern.messages[0]?.text).toMatch(/too many reflections/i);
  });
});
