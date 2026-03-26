export const COPY = {
  intro: {
    eyebrow: 'Diffraction Experiment Explorer',
    title: "Let's start our diffraction experiment",
    subtitle:
      'Build a crystal, choose its symmetry, and watch the powder pattern appear like a live beamline story.',
    cta: 'Launch the experiment',
    badges: ['Science communication', 'Powder diffraction', 'Teen-friendly guide'],
  },
  steps: [
    {
      number: 1,
      kicker: 'Step 1',
      title: "Let's create our chemical formula",
      helper:
        'Type fractional coordinates inside one unit cell. The app treats these atoms as the asymmetric unit before symmetry expands them.',
    },
    {
      number: 2,
      kicker: 'Step 2',
      title: "Let's choose a symmetry",
      helper:
        'Pick a Bravais lattice first, then a compatible space group. We will expand the structure and catch any overlapping crystallographic sites.',
    },
    {
      number: 3,
      kicker: 'Step 3',
      title: "Let's see what it gives experimentally",
      helper:
        'Switch between X-rays and neutrons, tune the wavelength and U/V/W resolution terms, then compare the broadened profile with the ideal Bragg sticks.',
    },
  ],
  callouts: {
    formula:
      'Fractional coordinates go from 0 to 1 because they describe positions inside the unit cell, not absolute distances in angstroms.',
    symmetry:
      'A space group can duplicate one atom into many equivalent positions. If two different user-defined atoms collapse onto the same site, the structure is inconsistent.',
    experiment:
      "Changing the wavelength shifts peak positions through Bragg's law, while U, V, and W change the apparent instrumental broadening.",
  },
  lessons: {
    formula: {
      title: 'Teacher note',
      text:
        'We start from the asymmetric unit: the smallest atom recipe that symmetry will copy through the whole crystal.',
      tip:
        'Choose the element, then place it with fractional coordinates x, y, z between 0 and 1 inside one unit cell.',
    },
    symmetry: [
      {
        label: '1. Bravais lattice',
        title: 'Pick the translational scaffold',
        text:
          'The Bravais lattice tells us how points repeat through space before we even add mirror planes, rotations, or glide operations.',
        tip:
          'Choose the lattice family that matches your crystal system first. That choice will filter the space groups that are physically allowed.',
      },
      {
        label: '2. Cell and space group',
        title: 'Tune the cell and check the full symmetry',
        text:
          'Now we attach the detailed symmetry and the unit-cell geometry. The cell lengths and angles define the box, while the space group defines how atoms are copied inside it.',
        tip:
          'Set the lattice parameters, choose a compatible space group, then check whether symmetry creates overlapping atomic sites.',
      },
    ],
    pattern: [
      {
        label: '1. Source',
        title: 'Choose the probe',
        text:
          'X-rays and neutrons both diffract, but they interact with matter differently, so the relative peak intensities can change.',
        tip:
          'Pick the source that matches the story you want to tell before moving to wavelength tuning.',
      },
      {
        label: '2. Wavelength',
        title: 'Set the beam color',
        text:
          'The wavelength controls where reflections land in 2theta through Bragg law. Shorter wavelengths generally push peaks to lower angles for the same d spacing.',
        tip:
          'Use the default wavelength for a quick experiment, or edit it to explore how the peak positions move.',
      },
      {
        label: '3. Resolution',
        title: 'Shape the instrument response',
        text:
          'U, V, and W control the peak width through the Caglioti relation. They do not move the peaks, but they can make them broader or sharper.',
        tip:
          'Adjust U, V, and W carefully. If the peak width becomes non-physical, the app will block the pattern page.',
      },
      {
        label: '4. Pattern',
        title: 'Read the detector fingerprint',
        text:
          'This is the final powder pattern: ideal reflection sticks plus the broadened profile you would compare with an experiment.',
        tip:
          'Zoom into a group of peaks, compare their intensities, and connect them back to the crystal symmetry you selected.',
      },
    ],
  },
};
