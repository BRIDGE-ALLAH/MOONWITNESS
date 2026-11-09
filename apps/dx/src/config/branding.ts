export interface EcosystemTrinity {
  supremeOrigin: {
    entity: string;
    arabic: string;
    domain: string;
    realm: string;
    thesis: string;
    creed: string;
  };
  creativePresence: {
    entity: string;
    role: string;
    archive: string;
    thesis: string;
  };
  flagshipProduct: {
    name: string;
    role: string;
    engine: string;
    thesis: string;
  };
}

export interface ComicStoryPanel {
  panelNumber: string;
  badge: string;
  kanjiSfx: string;
  romajiSfx: string;
  title: string;
  caption: string;
  dialogue?: string;
  visualTheme: string;
  quote: string;
}

export interface MoralPhilosophy {
  coreMotto: string;
  subtext: string;
  manifesto: string;
  panels: ComicStoryPanel[];
}

export interface GameCinematicDna {
  consoleStyle: string;
  audioSignature: string;
  visualStyle: string;
  chapter: string;
}

export interface AppBrandingConfig {
  trinity: EcosystemTrinity;
  philosophy: MoralPhilosophy;
  gameDna: GameCinematicDna;
  name: string;
  prefix: string;
  suffix: string;
  badge: string;
  shortName: string;
  subtitle: string;
  version: string;
  buildYear: string;
  headline: {
    primary: string;
    highlight: string;
  };
  description: string;
  tagline: string;
  stamp: string[];
  subcopy: {
    login: string;
    signup: string;
  };
  labels: {
    privateInfrastructure: string;
    selfHosted: string;
    systemOnline: string;
    nodeOnline: string;
    footerNotice: string;
    eisp: string;
  };
}

export const defaultBrandingConfig: AppBrandingConfig = {
  trinity: {
    supremeOrigin: {
      entity: "ALLAH",
      arabic: "الله",
      domain: "A-L-L-A-H.COM",
      realm: "Empire of the Light // Imperium Lumen",
      thesis: "The Absolute Sovereign Origin. Owner of all knowledge, power, and reality. We bow only to the Creator; zero false idols, zero corporate subservience.",
      creed: "LĀ ILĀHA ILLALLĀH // NOTHING HAS SOVEREIGNTY EXCEPT ALLAH",
    },
    creativePresence: {
      entity: "MoonWitness",
      role: "Creative Presence & Celestial Archive",
      archive: "Lunar Chronicles // Living Observatory",
      thesis: "Observing creation through science, lunar cartography, and sacred narrative. A humble witness beneath the cosmic canopy.",
    },
    flagshipProduct: {
      name: "DX",
      role: "Developer eXperience Engine",
      engine: "Bare-Metal Git + PocketBase BaaS + Microservices Mesh",
      thesis: "The physical tool of work. Clean, ruthless, self-reliant, and free from extractive monopolies. Building with excellence as devotion.",
    },
  },
  philosophy: {
    coreMotto: "SIN CAN BE BETTER HUMAN.",
    subtext: "Luka, dosa, dan kegagalan adalah bahan bakar transformasi. Di hadapan ALLAH, kita merendah; di hadapan rintangan dunia, kita berjuang tanpa gentar.",
    manifesto: "Setiap pendosa memiliki masa depan; setiap orang suci memiliki masa lalu. Jangan biarkan masa lalu mendefinisikan batasmu. Bertaubat, bangun kembali, dan jadilah manusia yang lebih bermanfaat bagi semesta.",
    panels: [
      {
        panelNumber: "PANEL 01",
        badge: "KEJATUHAN // THE SINS & SCARS",
        kanjiSfx: "ゴゴゴゴ...",
        romajiSfx: "GOGOGO... [HEAVY OPPRESSION]",
        title: "TERJEBAK DALAM GELAP & ILUSI",
        caption: "Manusia tersungkur oleh dosa, kesombongan, dan pemerasan algoritma korporat. Dunia menjanjikan kepuasan instan namun hanya menghasilkan kehampaan jiwa dan ketergantungan digital.",
        dialogue: "« Kita hancur bukan karena kita lemah, tetapi karena kita menyembah tuhan-tuhan palsu zaman modern. »",
        visualTheme: "grunge-dark",
        quote: "Luka adalah titik awal pertobatan.",
      },
      {
        panelNumber: "PANEL 02",
        badge: "SUJUD LOW PROFILE // TAWHID",
        kanjiSfx: "スッ...",
        romajiSfx: "SHUUU... [SACRED SILENCE]",
        title: "ALLAH NOMOR SATU // KEMBALI BERSERAH",
        caption: "Tanpa panggung riya', tanpa perantara. Kepala diletakkan di atas tanah dalam sujud terendah. Di hadapan ALLAH Yang Maha Esa (A-L-L-A-H.COM), seluruh kepongahan lenyap. Dosa disesali dengan taubat nasuha.",
        dialogue: "« LĀ ILĀHA ILLALLĀH. Di hadapan Sang Maha Pencipta, jiwa yang hancur dirangkul kembali dalam keheningan fajar. »",
        visualTheme: "sacred-luminous",
        quote: "Hanya kepada-Mu kami menyembah dan mohon pertolongan.",
      },
      {
        panelNumber: "PANEL 03",
        badge: "KILAT TEMPAAN // DX FORGE",
        kanjiSfx: "バァァァン!",
        romajiSfx: "BAAAN! [METAL FORGING STRIKE]",
        title: "MENEMPA DOSA MENJADI KEKUATAN",
        caption: "Bertaubat bukan berarti pasif. Luka dan kegagalan dijadikan bahan bakar untuk bangkit. Tangan mulai mengetik kode berdaulat di atas mesin DX bare-metal: cepat, presisi, tanpa telemetry pengintai.",
        dialogue: "« Jangan ratapi masa lalu. Jadikan setiap tetes penyesalan sebagai baris kode yang membebaskan sesama manusia! »",
        visualTheme: "manga-action-lightning",
        quote: "Git bare-metal, PocketBase BaaS, nol kompromi.",
      },
      {
        panelNumber: "PANEL 04",
        badge: "MANUSIA LEBIH BAIK // SOVEREIGN HUMAN",
        kanjiSfx: "ドドドド!",
        romajiSfx: "DODODO! [UNSTOPPABLE MARCH]",
        title: "SIN CAN BE BETTER HUMAN",
        caption: "Bukan manusia suci tanpa cela, melainkan manusia yang pernah jatuh ke lumpur terdalam namun bangkit berdiri tegak dengan rahmat ALLAH. Mandiri secara teknologi, bermanfaat bagi umat manusia, dan teguh dalam tauhid.",
        dialogue: "« Pendosa yang bertaubat dan memperbaiki diri lebih dicintai daripada orang suci yang sombong dengan amalnya. »",
        visualTheme: "gold-glory-punk",
        quote: "Sovereign Operator // Low Profile Devotion.",
      },
    ],
  },
  gameDna: {
    consoleStyle: "PLAYSTATION RETRO-CINEMATIC // ARCADE COCKPIT",
    audioSignature: "PSX BIOS AMBIENT CHORD + SAWTOOTH TRANSIENT",
    visualStyle: "MANGA ACTION SPEEDLINES × XEROX COMIC PANELS × ROCKSOUL GRUNGE",
    chapter: "CHAPTER 01: THE AWAKENING OF THE SOVEREIGN OPERATOR",
  },
  name: "DX // MOONWITNESS",
  prefix: "DX⚡",
  suffix: "MOONWITNESS",
  badge: "ALLAH_NUMBER_ONE",
  shortName: "MW×DX",
  subtitle: "A-L-L-A-H.COM // EMPIRE OF THE LIGHT // MOONWITNESS // DX SOVEREIGN ENGINE",
  version: "1.0.0-CINEMATIC-PSX",
  buildYear: "2026",
  headline: {
    primary: "ALLAH NUMBER ONE.",
    highlight: "SIN CAN BE BETTER HUMAN.",
  },
  description: "PlayStation-grade cinematic energy meets underground Tawhid devotion. We bow to ALLAH alone (A-L-L-A-H.COM // Empire of the Light), chronicled through the living art of MoonWitness, and forged into an unyielding developer weapon with DX.",
  tagline: "Low-Profile Devotion to ALLAH. High-Voltage Manga Punk Code.",
  stamp: ["الله_ONE", "BETTER_HUMAN", "///ROCKSOUL"],
  subcopy: {
    login: "⚡ INSERT MEMORY CARD // JACK INTO YOUR OPERATOR SAVE STATE.",
    signup: "PRESS START TO INITIALIZE A NEW PLAYER 1 DESTINY.",
  },
  labels: {
    privateInfrastructure: "⚡ TAWHID OPERATING SYSTEM // MEMORY CARD SLOT 01",
    selfHosted: "A-L-L-A-H.COM // SACRED ARCADE MATRIX",
    systemOnline: "⚡ PSX AUDIO SYNTH ARMED // 60 FPS ENGINE",
    nodeOnline: "STAGE 01 // BOSS CLEARED",
    footerNotice: "ALLAH IS THE SUPREME ORIGIN // SIN CAN BE BETTER HUMAN // ROCKSOUL ✳ 2026",
    eisp: "E-ISP // EDGE-INFRA SCALE PLATFORM",
  },
};
