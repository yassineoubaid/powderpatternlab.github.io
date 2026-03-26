export type LanguageCode = 'en' | 'fr' | 'ar';

export const COPY_BY_LANGUAGE = {
  en: {
    intro: {
      eyebrow: 'Diffraction Experiment Explorer',
      title: "Let's start our diffraction experiment",
      subtitle:
        'Build a crystal, choose its symmetry, and watch the powder pattern appear like a live beamline story.',
      cta: 'Launch the experiment',
      badges: ['Science communication', 'Powder diffraction', 'Teen-friendly guide'],
      demos: {
        nacl: 'Try NaCl demo',
        silicon: 'Try Si demo',
      },
      mission: {
        label: "Today's mission",
        text: 'Can your crystal survive symmetry and leave a fingerprint on the detector?',
      },
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
  },
  fr: {
    intro: {
      eyebrow: 'Explorateur d’expérience de diffraction',
      title: 'Commençons notre expérience de diffraction',
      subtitle:
        'Construisez un cristal, choisissez sa symétrie et regardez le diagramme de poudre apparaître comme sur une vraie ligne de lumière.',
      cta: "Lancer l'expérience",
      badges: ['Communication scientifique', 'Diffraction sur poudre', 'Guide pour adolescents'],
      demos: {
        nacl: 'Essayer la démo NaCl',
        silicon: 'Essayer la démo Si',
      },
      mission: {
        label: "Mission du jour",
        text: 'Votre cristal peut-il survivre à la symétrie et laisser une empreinte sur le détecteur ?',
      },
    },
    steps: [
      {
        number: 1,
        kicker: 'Étape 1',
        title: 'Créons notre formule chimique',
        helper:
          "Saisissez les coordonnées fractionnaires dans une maille. L’application traite ces atomes comme l’unité asymétrique avant que la symétrie ne les développe.",
      },
      {
        number: 2,
        kicker: 'Étape 2',
        title: 'Choisissons une symétrie',
        helper:
          "Choisissez d’abord un réseau de Bravais puis un groupe d’espace compatible. Nous développerons la structure et repérerons les sites cristallographiques qui se chevauchent.",
      },
      {
        number: 3,
        kicker: 'Étape 3',
        title: "Voyons ce que cela donne expérimentalement",
        helper:
          'Passez des rayons X aux neutrons, ajustez la longueur d’onde et les termes U/V/W, puis comparez le profil élargi avec les raies de Bragg idéales.',
      },
    ],
    callouts: {
      formula:
        'Les coordonnées fractionnaires vont de 0 à 1 car elles décrivent des positions dans la maille, et non des distances absolues en angströms.',
      symmetry:
        'Un groupe d’espace peut dupliquer un atome en plusieurs positions équivalentes. Si deux atomes différents se retrouvent sur le même site, la structure est incohérente.',
      experiment:
        "Modifier la longueur d’onde déplace les pics via la loi de Bragg, tandis que U, V et W changent l’élargissement instrumental apparent.",
    },
    lessons: {
      formula: {
        title: 'Note du professeur',
        text:
          "Nous partons de l’unité asymétrique : la plus petite recette atomique que la symétrie recopiera dans tout le cristal.",
        tip:
          "Choisissez l’élément puis placez-le avec des coordonnées fractionnaires x, y, z comprises entre 0 et 1 dans une maille.",
      },
      symmetry: [
        {
          label: '1. Réseau de Bravais',
          title: 'Choisir le squelette translationnel',
          text:
            'Le réseau de Bravais indique comment les points se répètent dans l’espace avant même d’ajouter miroirs, rotations ou glissements.',
          tip:
            'Choisissez d’abord la famille de réseau adaptée à votre système cristallin. Ce choix filtre les groupes d’espace physiquement permis.',
        },
        {
          label: "2. Maille et groupe d'espace",
          title: 'Régler la maille et vérifier la symétrie complète',
          text:
            "Nous ajoutons maintenant la symétrie détaillée et la géométrie de la maille. Les paramètres définissent la boîte, et le groupe d’espace définit comment les atomes y sont copiés.",
          tip:
            'Réglez les paramètres de maille, choisissez un groupe d’espace compatible, puis vérifiez si la symétrie crée des recouvrements atomiques.',
        },
      ],
      pattern: [
        {
          label: '1. Source',
          title: 'Choisir la sonde',
          text:
            'Les rayons X et les neutrons diffractent tous deux, mais ils interagissent différemment avec la matière, donc les intensités relatives peuvent changer.',
          tip:
            'Choisissez la source qui correspond au message scientifique que vous voulez raconter avant de régler la longueur d’onde.',
        },
        {
          label: "2. Longueur d'onde",
          title: 'Régler la couleur du faisceau',
          text:
            'La longueur d’onde contrôle la position des réflexions en 2theta via la loi de Bragg. Des longueurs d’onde plus courtes déplacent généralement les pics.',
          tip:
            'Utilisez la longueur d’onde par défaut pour un essai rapide, ou modifiez-la pour voir comment les pics se déplacent.',
        },
        {
          label: '3. Résolution',
          title: "Façonner la réponse instrumentale",
          text:
            'U, V et W contrôlent la largeur des pics à travers la relation de Caglioti. Ils ne déplacent pas les pics, mais peuvent les élargir ou les affiner.',
          tip:
            'Ajustez U, V et W avec soin. Si la largeur devient non physique, l’application bloquera la page du diagramme.',
        },
        {
          label: '4. Diagramme',
          title: 'Lire la signature du détecteur',
          text:
            'Voici le diagramme final : raies idéales plus profil élargi, comme dans une vraie comparaison avec une expérience.',
          tip:
            'Zoomez sur un groupe de pics, comparez leurs intensités et reliez-les à la symétrie cristalline choisie.',
        },
      ],
    },
  },
  ar: {
    intro: {
      eyebrow: 'مستكشف تجربة الحيود',
      title: 'لنبدأ تجربة الحيود الخاصة بنا',
      subtitle:
        'ابنِ بلورة، اختر تناظرها، وشاهد نمط المسحوق يظهر كما لو كنت في خط شعاع حقيقي.',
      cta: 'ابدأ التجربة',
      badges: ['تواصل علمي', 'حيود المسحوق', 'دليل مناسب للمراهقين'],
      demos: {
        nacl: 'جرّب مثال NaCl',
        silicon: 'جرّب مثال Si',
      },
      mission: {
        label: 'مهمة اليوم',
        text: 'هل تستطيع بلورتك اجتياز اختبار التناظر وترك بصمتها على الكاشف؟',
      },
    },
    steps: [
      {
        number: 1,
        kicker: 'الخطوة 1',
        title: 'لننشئ الصيغة الكيميائية',
        helper:
          'أدخل الإحداثيات الكسرية داخل خلية واحدة. يعامل التطبيق هذه الذرات كوحدة لا متماثلة قبل أن يوسّعها التناظر.',
      },
      {
        number: 2,
        kicker: 'الخطوة 2',
        title: 'لنختر التناظر',
        helper:
          'اختر أولاً شبكة برافاي ثم مجموعة فراغ متوافقة. سنوسّع البنية ونكشف أي تراكب في المواقع البلورية.',
      },
      {
        number: 3,
        kicker: 'الخطوة 3',
        title: 'لنرَ ما يعطيه ذلك تجريبياً',
        helper:
          'بدّل بين الأشعة السينية والنيوترونات، واضبط الطول الموجي ومعاملات U/V/W، ثم قارن المنحنى المتسع مع خطوط براج المثالية.',
      },
    ],
    callouts: {
      formula:
        'الإحداثيات الكسرية تمتد من 0 إلى 1 لأنها تصف مواقع داخل الخلية وليس مسافات مطلقة بالأنغستروم.',
      symmetry:
        'يمكن لمجموعة الفراغ أن تكرر الذرة الواحدة إلى مواقع مكافئة عديدة. إذا انهارت ذرتان مختلفتان إلى الموقع نفسه فالبنية غير متسقة.',
      experiment:
        'تغيير الطول الموجي يحرّك مواقع القمم وفق قانون براج، بينما تغيّر U وV وW الاتساع الأداتي الظاهري.',
    },
    lessons: {
      formula: {
        title: 'ملاحظة تعليمية',
        text:
          'نبدأ من الوحدة غير المتماثلة: أصغر وصفة ذرية ستنسخها عناصر التناظر في كامل البلورة.',
        tip:
          'اختر العنصر ثم ضعه بإحداثيات كسرية x وy وz بين 0 و1 داخل خلية واحدة.',
      },
      symmetry: [
        {
          label: '1. شبكة برافاي',
          title: 'اختر الهيكل الانتقالي',
          text:
            'شبكة برافاي تشرح كيف تتكرر النقاط في الفضاء قبل إضافة المرايا أو الدورانات أو الانزلاقات.',
          tip:
            'اختر أولاً عائلة الشبكة الموافقة لنظامك البلوري. هذا الاختيار يرشح مجموعات الفراغ المسموح بها.',
        },
        {
          label: '2. الخلية ومجموعة الفراغ',
          title: 'اضبط الخلية وافحص التناظر الكامل',
          text:
            'الآن نضيف التناظر التفصيلي وهندسة خلية الوحدة. أطوال الخلية وزواياها تحدد الصندوق، ومجموعة الفراغ تحدد كيف تُنسخ الذرات داخله.',
          tip:
            'اضبط معاملات الخلية، اختر مجموعة فراغ متوافقة، ثم تحقق مما إذا كان التناظر يسبب تراكباً في المواقع الذرية.',
        },
      ],
      pattern: [
        {
          label: '1. المصدر',
          title: 'اختر المسبار',
          text:
            'كل من الأشعة السينية والنيوترونات يحدث حيوداً، لكن تفاعلهما مع المادة مختلف، لذلك قد تتغير الشدات النسبية.',
          tip:
            'اختر المصدر الذي يناسب القصة العلمية التي تريد عرضها قبل ضبط الطول الموجي.',
        },
        {
          label: '2. الطول الموجي',
          title: 'اضبط لون الحزمة',
          text:
            'الطول الموجي يحدد مواضع الانعكاسات في 2theta عبر قانون براج. الأطوال الموجية الأقصر تغيّر مواقع القمم عادة.',
          tip:
            'استخدم القيمة الافتراضية لتجربة سريعة، أو عدّلها لترى كيف تتحرك مواقع القمم.',
        },
        {
          label: '3. الاستبانة',
          title: 'شكّل استجابة الجهاز',
          text:
            'تتحكم U وV وW في عرض القمة عبر علاقة كالييوتي. هي لا تحرك القمم، لكنها تجعلها أعرض أو أضيق.',
          tip:
            'اضبط U وV وW بحذر. إذا أصبح العرض غير فيزيائي فسيمنع التطبيق صفحة النمط.',
        },
        {
          label: '4. النمط',
          title: 'اقرأ بصمة الكاشف',
          text:
            'هذا هو نمط المسحوق النهائي: خطوط الانعكاس المثالية مع المنحنى المتسع الذي تقارنه بالتجربة.',
          tip:
            'كبّر مجموعة من القمم، قارن شداتها، واربطها بالتناظر البلوري الذي اخترته.',
        },
      ],
    },
  },
} as const;

export const COPY = COPY_BY_LANGUAGE.en;
