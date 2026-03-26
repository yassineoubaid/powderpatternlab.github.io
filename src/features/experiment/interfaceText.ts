import type { BravaisType } from '../../types/crystallography';
import type { LanguageCode } from './copy';

type InterfaceText = {
  meta: {
    languageLabel: string;
    scientificDetail: string;
    close: string;
    glossaryPrompt: string;
  };
  nav: {
    formula: string;
    symmetry: string;
    pattern: string;
  };
  formula: {
    stripLabel: string;
    emptyFormula: string;
    teacherTitle: string;
    atom: string;
    element: string;
    addAtom: string;
    remove: string;
    continueToSymmetry: string;
  };
  symmetry: {
    pagesAria: string;
    currentLatticeChoice: string;
    latticeSelected: string;
    latticeEmpty: string;
    spaceGroup: string;
    chooseSpaceGroup: string;
    expandedFormula: string;
    expandedHint: string;
    activePositions: string;
    backToFormula: string;
    continueToCell: string;
    backToLattice: string;
    continueToExperiment: string;
    collisionText: string;
  };
  pattern: {
    pagesAria: string;
    xrayHelper: string;
    neutronHelper: string;
    backToSymmetry: string;
    continueToWavelength: string;
    selectedSource: string;
    xraySource: string;
    neutronSource: string;
    wavelengthLabel: string;
    simulationWindow: string;
    backToSource: string;
    continueToResolution: string;
    resolutionTheory: string;
    backToWavelength: string;
    showPattern: string;
    sourceSummary: string;
    wavelengthSummary: string;
    resolutionSummary: string;
    resolutionCheck: string;
    reflectionsTitle: string;
    reflectionsText: string;
    noPeaks: string;
    backToResolution: string;
    finishExperiment: string;
  };
  plot: {
    empty: string;
    zoomOut: string;
    zoomIn: string;
    resetView: string;
    view: string;
    zoom: string;
    interactionHint: string;
    viewportAria: string;
    patternAria: string;
    crystalPreviewAria: string;
    crystalPreviewHint: string;
    idealBragg: string;
    broadened: string;
    sceneZoomIn: string;
    sceneZoomOut: string;
    sceneDrag: string;
    sceneSelectedWindow: string;
    sceneReset: string;
    sceneWiderDrag: string;
    reflectionTitleAt: string;
  };
  bravais: Record<BravaisType, { family: string; note: string }>;
  sceneMessages: {
    defaults: {
      synthesis: string;
      thinking: string;
      beam: string;
    };
    choosingAtom: string;
    settingCoordinates: string;
    editingRecipe: string;
    newAtomAdded: string;
    recipeComplete: string;
    demoRecipeLoaded: string;
    testingLattice: string;
    backToRecipe: string;
    latticeChosen: string;
    matchingSpaceGroup: string;
    tuningCell: string;
    returningToLattice: string;
    symmetrySolved: string;
    selectingSource: string;
    backToSymmetry: string;
    sourceLocked: string;
    tuningWavelength: string;
    returningToSource: string;
    wavelengthReady: string;
    updatingResolution: string;
    returningToWavelength: string;
    showingDetector: string;
    returningToResolution: string;
  };
};

const EN_BRAVAIS: InterfaceText['bravais'] = {
  aP: { family: 'Triclinic primitive', note: 'Nothing is locked here, so this is the most free-form cell.' },
  mP: { family: 'Monoclinic primitive', note: 'One angle bends, the other two stay at 90 degrees.' },
  mC: { family: 'Monoclinic base-centered', note: 'Monoclinic, but with extra centering to create more symmetry mates.' },
  oP: { family: 'Orthorhombic primitive', note: 'Three different lengths, all right angles.' },
  oC: { family: 'Orthorhombic base-centered', note: 'Orthorhombic with extra centering on one pair of faces.' },
  oI: { family: 'Orthorhombic body-centered', note: 'A centered point in the middle adds extra equivalent positions.' },
  oF: { family: 'Orthorhombic face-centered', note: 'All faces get centering, which strongly shapes extinction rules.' },
  tP: { family: 'Tetragonal primitive', note: 'Two equal in-plane lengths and one unique axis.' },
  tI: { family: 'Tetragonal body-centered', note: 'Tetragonal symmetry plus a centered lattice point.' },
  hP: { family: 'Hexagonal / trigonal primitive', note: 'This covers both hexagonal P groups and trigonal groups in P setting.' },
  hR: { family: 'Rhombohedral', note: 'Handled in the hexagonal setting so the inputs stay beginner-friendly.' },
  cP: { family: 'Cubic primitive', note: 'All lengths equal and all angles 90 degrees.' },
  cI: { family: 'Cubic body-centered', note: 'A centered atom position changes which reflections survive.' },
  cF: { family: 'Cubic face-centered', note: 'Classic for rock-salt and diamond-style extinction patterns.' },
};

const FR_BRAVAIS: InterfaceText['bravais'] = {
  aP: { family: 'Triclinique primitive', note: "Ici rien n'est verrouillé : c’est la maille la plus libre." },
  mP: { family: 'Monoclinique primitive', note: 'Un angle est incliné, les deux autres restent à 90 degrés.' },
  mC: { family: 'Monoclinique base centrée', note: 'Monoclinique avec un centrage supplémentaire qui crée plus de positions équivalentes.' },
  oP: { family: 'Orthorhombique primitive', note: 'Trois longueurs différentes, tous les angles droits.' },
  oC: { family: 'Orthorhombique base centrée', note: 'Orthorhombique avec un centrage supplémentaire sur une paire de faces.' },
  oI: { family: 'Orthorhombique centrée corps', note: 'Un point centré au milieu ajoute des positions équivalentes.' },
  oF: { family: 'Orthorhombique faces centrées', note: 'Toutes les faces sont centrées, ce qui influence fortement les extinctions.' },
  tP: { family: 'Tétragonale primitive', note: 'Deux longueurs égales dans le plan et un axe unique.' },
  tI: { family: 'Tétragonale centrée corps', note: 'Symétrie tétragonale plus un point de réseau centré.' },
  hP: { family: 'Hexagonale / trigonale primitive', note: 'Couvre les groupes hexagonaux P et les groupes trigonaux en réglage P.' },
  hR: { family: 'Rhomboédrique', note: 'Traitée dans le réglage hexagonal pour rester accessible aux débutants.' },
  cP: { family: 'Cubique primitive', note: 'Toutes les longueurs sont égales et tous les angles valent 90 degrés.' },
  cI: { family: 'Cubique centrée corps', note: 'Une position centrée modifie les réflexions autorisées.' },
  cF: { family: 'Cubique faces centrées', note: 'Classique pour les extinctions du type sel gemme et diamant.' },
};

const AR_BRAVAIS: InterfaceText['bravais'] = {
  aP: { family: 'ثلاثي الميل بدائي', note: 'لا يوجد أي قيد هنا، لذلك هذه أكثر خلية حرية.' },
  mP: { family: 'أحادي الميل بدائي', note: 'زاوية واحدة تميل، بينما تبقى الزاويتان الأخريان 90 درجة.' },
  mC: { family: 'أحادي الميل متمركز القاعدة', note: 'أحادي الميل مع تمركز إضافي يخلق مواقع تناظرية أكثر.' },
  oP: { family: 'معيني قائم بدائي', note: 'ثلاثة أطوال مختلفة وجميع الزوايا قائمة.' },
  oC: { family: 'معيني قائم متمركز القاعدة', note: 'معيني قائم مع تمركز إضافي على زوج واحد من الأوجه.' },
  oI: { family: 'معيني قائم متمركز الجسم', note: 'نقطة مركزية في الوسط تضيف مواقع مكافئة إضافية.' },
  oF: { family: 'معيني قائم متمركز الوجوه', note: 'جميع الأوجه متمركزة، وهذا يؤثر بقوة في قواعد الانطفاء.' },
  tP: { family: 'رباعي بدائي', note: 'طولان متساويان في المستوى ومحور فريد واحد.' },
  tI: { family: 'رباعي متمركز الجسم', note: 'تناظر رباعي مع نقطة شبكة متمركزة إضافية.' },
  hP: { family: 'سداسي / ثلاثي بدائي', note: 'يشمل مجموعات P السداسية والمجموعات الثلاثية في ضبط P.' },
  hR: { family: 'رومبوهدري', note: 'يُعالج في الضبط السداسي لتبقى المدخلات سهلة للمبتدئين.' },
  cP: { family: 'مكعبي بدائي', note: 'كل الأطوال متساوية وكل الزوايا 90 درجة.' },
  cI: { family: 'مكعبي متمركز الجسم', note: 'موضع مركزي يغير الانعكاسات التي تبقى مسموحة.' },
  cF: { family: 'مكعبي متمركز الوجوه', note: 'كلاسيكي لأنماط الانطفاء في البنى من نوع الملح الصخري والماس.' },
};

export const INTERFACE_TEXT: Record<LanguageCode, InterfaceText> = {
  en: {
    meta: {
      languageLabel: 'Language',
      scientificDetail: 'Scientific detail',
      close: 'Close',
      glossaryPrompt: 'Click a scientific term for a rigorous definition:',
    },
    nav: { formula: '1. Formula', symmetry: '2. Symmetry', pattern: '3. Pattern' },
    formula: {
      stripLabel: 'Asymmetric-unit formula',
      emptyFormula: 'Add atoms to reveal the formula.',
      teacherTitle: 'Build the asymmetric-unit recipe',
      atom: 'Atom',
      element: 'Element',
      addAtom: 'Add atom',
      remove: 'Remove',
      continueToSymmetry: 'Continue to symmetry',
    },
    symmetry: {
      pagesAria: 'Symmetry pages',
      currentLatticeChoice: 'Current lattice choice',
      latticeSelected: '{bravais} selected. Next we can choose the matching space group and the cell geometry.',
      latticeEmpty: 'No Bravais lattice selected yet. Pick one to unlock the next lesson page.',
      spaceGroup: 'Space group',
      chooseSpaceGroup: 'Choose a space group',
      expandedFormula: 'Expanded-cell formula',
      expandedHint: 'Choose a lattice and a space group to expand the structure.',
      activePositions: 'Active positions',
      backToFormula: 'Back to formula',
      continueToCell: 'Continue to cell setup',
      backToLattice: 'Back to lattice',
      continueToExperiment: 'Continue to experiment',
      collisionText: '{atoms} collapse near ({position}).',
    },
    pattern: {
      pagesAria: 'Pattern pages',
      xrayHelper: 'Cu Ka default',
      neutronHelper: 'Thermal CW default',
      backToSymmetry: 'Back to symmetry',
      continueToWavelength: 'Continue to wavelength',
      selectedSource: 'Selected source',
      xraySource: 'X-ray source',
      neutronSource: 'Neutron source',
      wavelengthLabel: 'Wavelength lambda (A)',
      simulationWindow: 'Simulation window: {min} deg to {max} deg with a {step} deg grid.',
      backToSource: 'Back to source',
      continueToResolution: 'Continue to resolution',
      resolutionTheory: 'Resolution theory:',
      backToWavelength: 'Back to wavelength',
      showPattern: 'Show the pattern',
      sourceSummary: 'Source',
      wavelengthSummary: 'lambda',
      resolutionSummary: 'Resolution',
      resolutionCheck:
        'The app checks the peak width across the whole 5 to 160 deg range before unlocking the final figure.',
      reflectionsTitle: 'Most visible reflections',
      reflectionsText: 'The strongest peaks help connect crystal symmetry to the detector fingerprint.',
      noPeaks: 'No peaks yet.',
      backToResolution: 'Back to resolution',
      finishExperiment: 'Finish experiment',
    },
    plot: {
      empty: 'Set a valid structure and simulation to light up the diffractogram.',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      resetView: 'Reset view',
      view: 'View',
      zoom: 'Zoom',
      interactionHint: 'Wheel to zoom, drag a region to isolate peaks, double-click to reset.',
      viewportAria: 'Interactive powder plot viewport',
      patternAria: 'Powder diffraction pattern',
      crystalPreviewAria: 'Crystal preview',
      crystalPreviewHint: 'Pick a symmetry to see the expanded cell.',
      idealBragg: 'Ideal Bragg sticks',
      broadened: 'Broadened powder profile',
      sceneZoomIn: 'Zooming into the selected peaks.',
      sceneZoomOut: 'Zooming back out.',
      sceneDrag: 'Drag a region to zoom onto those peaks.',
      sceneSelectedWindow: 'Zooming to the selected peak window.',
      sceneReset: 'Resetting the full diffraction figure.',
      sceneWiderDrag: 'Use a wider drag to isolate a peak region.',
      reflectionTitleAt: 'at',
    },
    bravais: EN_BRAVAIS,
    sceneMessages: {
      defaults: { synthesis: 'Starting the synthesis.', thinking: 'Checking the symmetry.', beam: 'Beamline ready.' },
      choosingAtom: 'Choosing the atom.',
      settingCoordinates: 'Setting coordinates.',
      editingRecipe: 'Editing the recipe.',
      newAtomAdded: 'New atom added.',
      recipeComplete: 'Recipe complete.',
      demoRecipeLoaded: 'Demo recipe loaded.',
      testingLattice: 'Testing the lattice.',
      backToRecipe: 'Back to the recipe.',
      latticeChosen: 'Lattice chosen. Moving to the cell setup.',
      matchingSpaceGroup: 'Matching the space group.',
      tuningCell: 'Tuning the cell.',
      returningToLattice: 'Returning to the lattice choice.',
      symmetrySolved: 'Symmetry solved.',
      selectingSource: 'Selecting the source.',
      backToSymmetry: 'Back to symmetry.',
      sourceLocked: 'Source locked. Next: wavelength.',
      tuningWavelength: 'Tuning the beam wavelength.',
      returningToSource: 'Returning to the source selection.',
      wavelengthReady: 'Wavelength ready. Next: resolution.',
      updatingResolution: 'Updating the detector resolution.',
      returningToWavelength: 'Returning to wavelength.',
      showingDetector: 'Experiment configured. Showing the detector.',
      returningToResolution: 'Returning to resolution.',
    },
  },
  fr: {
    meta: { languageLabel: 'Langue', scientificDetail: 'Détail scientifique', close: 'Fermer', glossaryPrompt: 'Cliquez sur un terme scientifique pour obtenir une définition rigoureuse :' },
    nav: { formula: '1. Formule', symmetry: '2. Symétrie', pattern: '3. Diagramme' },
    formula: {
      stripLabel: "Formule de l'unité asymétrique",
      emptyFormula: 'Ajoutez des atomes pour révéler la formule.',
      teacherTitle: "Construire la recette de l'unité asymétrique",
      atom: 'Atome',
      element: 'Élément',
      addAtom: 'Ajouter un atome',
      remove: 'Retirer',
      continueToSymmetry: 'Continuer vers la symétrie',
    },
    symmetry: {
      pagesAria: 'Pages de symétrie',
      currentLatticeChoice: 'Choix actuel du réseau',
      latticeSelected: '{bravais} sélectionné. Nous pouvons maintenant choisir le groupe d’espace correspondant et la géométrie de la maille.',
      latticeEmpty: "Aucun réseau de Bravais n'est encore sélectionné. Choisissez-en un pour débloquer la page suivante.",
      spaceGroup: "Groupe d'espace",
      chooseSpaceGroup: "Choisir un groupe d'espace",
      expandedFormula: 'Formule développée',
      expandedHint: 'Choisissez un réseau et un groupe d’espace pour développer la structure.',
      activePositions: 'Positions actives',
      backToFormula: 'Retour à la formule',
      continueToCell: 'Continuer vers la maille',
      backToLattice: 'Retour au réseau',
      continueToExperiment: "Continuer vers l'expérience",
      collisionText: '{atoms} se superposent près de ({position}).',
    },
    pattern: {
      pagesAria: 'Pages du diagramme',
      xrayHelper: 'Cu Ka par défaut',
      neutronHelper: 'CW thermique par défaut',
      backToSymmetry: 'Retour à la symétrie',
      continueToWavelength: "Continuer vers la longueur d'onde",
      selectedSource: 'Source sélectionnée',
      xraySource: 'Source rayons X',
      neutronSource: 'Source neutronique',
      wavelengthLabel: "Longueur d'onde lambda (A)",
      simulationWindow: 'Fenêtre de simulation : {min} deg à {max} deg avec un pas de {step} deg.',
      backToSource: 'Retour à la source',
      continueToResolution: 'Continuer vers la résolution',
      resolutionTheory: 'Théorie de la résolution :',
      backToWavelength: "Retour à la longueur d'onde",
      showPattern: 'Afficher le diagramme',
      sourceSummary: 'Source',
      wavelengthSummary: 'lambda',
      resolutionSummary: 'Résolution',
      resolutionCheck:
        "L'application vérifie la largeur des pics sur toute la plage de 5 à 160 deg avant de débloquer la figure finale.",
      reflectionsTitle: 'Réflexions les plus visibles',
      reflectionsText: 'Les pics les plus intenses relient la symétrie cristalline à la signature du détecteur.',
      noPeaks: 'Pas encore de pics.',
      backToResolution: 'Retour à la résolution',
      finishExperiment: "Terminer l'expérience",
    },
    plot: {
      empty: 'Définissez une structure et une simulation valides pour allumer le diffractogramme.',
      zoomOut: 'Zoom arrière',
      zoomIn: 'Zoom avant',
      resetView: 'Réinitialiser',
      view: 'Vue',
      zoom: 'Zoom',
      interactionHint: 'Molette pour zoomer, glissez pour isoler des pics, double-cliquez pour réinitialiser.',
      viewportAria: 'Fenêtre interactive du diagramme de poudre',
      patternAria: 'Diagramme de diffraction de poudre',
      crystalPreviewAria: 'Aperçu du cristal',
      crystalPreviewHint: 'Choisissez une symétrie pour voir la maille développée.',
      idealBragg: 'Raies de Bragg idéales',
      broadened: 'Profil de poudre élargi',
      sceneZoomIn: 'Zoom sur les pics sélectionnés.',
      sceneZoomOut: 'Zoom arrière.',
      sceneDrag: 'Faites glisser une région pour zoomer sur ces pics.',
      sceneSelectedWindow: 'Zoom sur la fenêtre de pics sélectionnée.',
      sceneReset: 'Réinitialisation de la figure complète.',
      sceneWiderDrag: 'Utilisez une zone plus large pour isoler une région de pics.',
      reflectionTitleAt: 'à',
    },
    bravais: FR_BRAVAIS,
    sceneMessages: {
      defaults: { synthesis: 'La synthèse commence.', thinking: 'Vérification de la symétrie.', beam: 'Ligne de lumière prête.' },
      choosingAtom: "Choix de l'atome.", settingCoordinates: 'Réglage des coordonnées.', editingRecipe: 'Modification de la recette.', newAtomAdded: 'Nouvel atome ajouté.', recipeComplete: 'Recette complète.', demoRecipeLoaded: 'Recette de démonstration chargée.', testingLattice: 'Test du réseau.', backToRecipe: 'Retour à la recette.', latticeChosen: 'Réseau choisi. Passage au réglage de la maille.', matchingSpaceGroup: "Association du groupe d'espace.", tuningCell: 'Réglage de la maille.', returningToLattice: 'Retour au choix du réseau.', symmetrySolved: 'Symétrie résolue.', selectingSource: 'Sélection de la source.', backToSymmetry: 'Retour à la symétrie.', sourceLocked: "Source verrouillée. Étape suivante : longueur d'onde.", tuningWavelength: "Réglage de la longueur d'onde du faisceau.", returningToSource: 'Retour à la sélection de la source.', wavelengthReady: "Longueur d'onde prête. Étape suivante : résolution.", updatingResolution: 'Mise à jour de la résolution du détecteur.', returningToWavelength: "Retour à la longueur d'onde.", showingDetector: 'Expérience configurée. Affichage du détecteur.', returningToResolution: 'Retour à la résolution.',
    },
  },
  ar: {
    meta: { languageLabel: 'اللغة', scientificDetail: 'تفصيل علمي', close: 'إغلاق', glossaryPrompt: 'انقر على مصطلح علمي للحصول على تعريف دقيق:' },
    nav: { formula: '1. الصيغة', symmetry: '2. التناظر', pattern: '3. النمط' },
    formula: {
      stripLabel: 'صيغة الوحدة غير المتماثلة',
      emptyFormula: 'أضف ذرات لإظهار الصيغة.',
      teacherTitle: 'ابنِ وصفة الوحدة غير المتماثلة',
      atom: 'ذرة',
      element: 'عنصر',
      addAtom: 'أضف ذرة',
      remove: 'إزالة',
      continueToSymmetry: 'المتابعة إلى التناظر',
    },
    symmetry: {
      pagesAria: 'صفحات التناظر',
      currentLatticeChoice: 'اختيار الشبكة الحالي',
      latticeSelected: 'تم اختيار {bravais}. الآن يمكننا اختيار مجموعة الفراغ المطابقة وهندسة الخلية.',
      latticeEmpty: 'لم يتم اختيار شبكة برافاي بعد. اختر واحدة لفتح الصفحة التالية.',
      spaceGroup: 'مجموعة الفراغ',
      chooseSpaceGroup: 'اختر مجموعة فراغ',
      expandedFormula: 'الصيغة بعد التوسيع',
      expandedHint: 'اختر شبكة ومجموعة فراغ لتوسيع البنية.',
      activePositions: 'المواضع الفعالة',
      backToFormula: 'العودة إلى الصيغة',
      continueToCell: 'المتابعة إلى الخلية',
      backToLattice: 'العودة إلى الشبكة',
      continueToExperiment: 'المتابعة إلى التجربة',
      collisionText: '{atoms} تتراكب قرب ({position}).',
    },
    pattern: {
      pagesAria: 'صفحات النمط',
      xrayHelper: 'Cu Ka افتراضي',
      neutronHelper: 'CW حراري افتراضي',
      backToSymmetry: 'العودة إلى التناظر',
      continueToWavelength: 'المتابعة إلى الطول الموجي',
      selectedSource: 'المصدر المختار',
      xraySource: 'مصدر الأشعة السينية',
      neutronSource: 'مصدر النيوترونات',
      wavelengthLabel: 'الطول الموجي lambda (A)',
      simulationWindow: 'نافذة المحاكاة: من {min} deg إلى {max} deg بخطوة {step} deg.',
      backToSource: 'العودة إلى المصدر',
      continueToResolution: 'المتابعة إلى الاستبانة',
      resolutionTheory: 'نظرية الاستبانة:',
      backToWavelength: 'العودة إلى الطول الموجي',
      showPattern: 'إظهار النمط',
      sourceSummary: 'المصدر',
      wavelengthSummary: 'lambda',
      resolutionSummary: 'الاستبانة',
      resolutionCheck:
        'يتحقق التطبيق من عرض القمم عبر المجال الكامل من 5 إلى 160 deg قبل إتاحة الشكل النهائي.',
      reflectionsTitle: 'أكثر الانعكاسات وضوحاً',
      reflectionsText: 'أشد القمم تساعد على ربط التناظر البلوري ببصمة الكاشف.',
      noPeaks: 'لا توجد قمم بعد.',
      backToResolution: 'العودة إلى الاستبانة',
      finishExperiment: 'إنهاء التجربة',
    },
    plot: {
      empty: 'حدّد بنية ومحاكاة صحيحتين لإظهار مخطط الحيود.',
      zoomOut: 'تصغير',
      zoomIn: 'تكبير',
      resetView: 'إعادة الضبط',
      view: 'المجال',
      zoom: 'التكبير',
      interactionHint: 'استخدم عجلة الفأرة للتكبير، واسحب لتحديد القمم، وانقر نقراً مزدوجاً لإعادة الضبط.',
      viewportAria: 'نافذة تفاعلية لمخطط المسحوق',
      patternAria: 'نمط حيود المسحوق',
      crystalPreviewAria: 'معاينة البلورة',
      crystalPreviewHint: 'اختر تناظراً لرؤية الخلية الموسعة.',
      idealBragg: 'خطوط براج المثالية',
      broadened: 'منحنى المسحوق المتسع',
      sceneZoomIn: 'يتم التكبير على القمم المختارة.',
      sceneZoomOut: 'يتم التصغير.',
      sceneDrag: 'اسحب منطقة للتكبير على هذه القمم.',
      sceneSelectedWindow: 'يتم التكبير على نافذة القمم المختارة.',
      sceneReset: 'إعادة ضبط الشكل بالكامل.',
      sceneWiderDrag: 'استخدم سحباً أوسع لعزل منطقة قمم.',
      reflectionTitleAt: 'عند',
    },
    bravais: AR_BRAVAIS,
    sceneMessages: {
      defaults: { synthesis: 'بدأت عملية التحضير.', thinking: 'يتم فحص التناظر.', beam: 'خط الشعاع جاهز.' },
      choosingAtom: 'يتم اختيار الذرة.', settingCoordinates: 'يتم ضبط الإحداثيات.', editingRecipe: 'يتم تعديل الوصفة.', newAtomAdded: 'تمت إضافة ذرة جديدة.', recipeComplete: 'اكتملت الوصفة.', demoRecipeLoaded: 'تم تحميل وصفة تجريبية.', testingLattice: 'يتم اختبار الشبكة.', backToRecipe: 'العودة إلى الوصفة.', latticeChosen: 'تم اختيار الشبكة. الانتقال إلى ضبط الخلية.', matchingSpaceGroup: 'يتم مطابقة مجموعة الفراغ.', tuningCell: 'يتم ضبط الخلية.', returningToLattice: 'العودة إلى اختيار الشبكة.', symmetrySolved: 'تم حل التناظر.', selectingSource: 'يتم اختيار المصدر.', backToSymmetry: 'العودة إلى التناظر.', sourceLocked: 'تم تثبيت المصدر. الخطوة التالية: الطول الموجي.', tuningWavelength: 'يتم ضبط الطول الموجي للحزمة.', returningToSource: 'العودة إلى اختيار المصدر.', wavelengthReady: 'الطول الموجي جاهز. الخطوة التالية: الاستبانة.', updatingResolution: 'يتم تحديث استبانة الكاشف.', returningToWavelength: 'العودة إلى الطول الموجي.', showingDetector: 'تم إعداد التجربة. عرض الكاشف الآن.', returningToResolution: 'العودة إلى الاستبانة.',
    },
  },
};

function replaceTokens(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function formatInterfaceText(template: string, values: Record<string, string | number>) {
  return replaceTokens(template, values);
}
