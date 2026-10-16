/**
 * AEGENTIX CYBERDAW - MUSIC PRODUCTION & AUDIO ENGINEERING DATASETS
 * Comprehensive music theory, chord progression vaults, scale modes,
 * groove velocity profiles, Ableton Live 12 DSP presets, and mastering loudness standards.
 */

export interface MusicalScale {
  id: string;
  name: string;
  category: 'DIATONIC' | 'MODAL' | 'SYNTHETIC' | 'PENTATONIC' | 'EXOTIC';
  intervals: number[]; // semitones from root [0, ...]
  formula: string;
  mood: string;
  idealForGenres: string[];
}

export interface ChordVoicing {
  name: string;
  symbol: string;
  semitones: number[]; // relative to chord root
  color: string;
}

export interface ChordProgressionItem {
  id: string;
  name: string;
  genre: 'CYBERPUNK_SYNTHWAVE' | 'LIQUID_DNB' | 'TECHNO_ACID' | 'CINEMATIC_AMBIENT' | 'DEEP_HOUSE_GARAGE' | 'NEUROFUNK_BASS';
  key: string;
  scaleMode: string;
  bpm: number;
  romanNumerals: string[];
  chords: string[];
  midiNotes: number[][]; // 4 bars of polyphonic MIDI chords
  description: string;
  energyLevel: 'CHILL' | 'MEDIUM' | 'PEAK_ENERGY' | 'DARK_TENSION';
}

export interface GrooveTemplate {
  id: string;
  name: string;
  swingPct: number; // 50 = straight, 66 = triplet
  velocityHumanize: number; // 0 to 1
  timingJitterMs: number;
  description: string;
}

export interface AbletonInstrumentPreset {
  id: string;
  deviceType: 'Wavetable' | 'Operator' | 'Meld' | 'Drift' | 'Roar' | 'DrumBuss' | 'HybridReverb';
  name: string;
  category: 'BASS' | 'LEAD' | 'PAD' | 'DRUMS' | 'FX_MASTERING';
  parameters: Record<string, number | string>;
  description: string;
}

export interface MasteringLoudnessStandard {
  id: string;
  name: string;
  platform: string;
  integratedLufs: number; // Target Integrated LUFS (e.g. -14.0)
  maxTruePeakDb: number; // Maximum True Peak in dBTP (e.g. -1.0)
  targetDynamicRangeLu: number; // Target Loudness Range (LU)
  maxShortTermLufs?: number;
  monoBassCutoffHz: number;
  eqTargetCurve: 'FLAT_HIGH_RES' | 'TILT_3DB_OCT' | 'HARMAN_WARMTH' | 'SMILE_LOUDNESS';
  notes: string;
}

// ============================================================================
// 1. SCALES & MODES DATASET
// ============================================================================
export const SCALES_AND_MODES_DATABASE: MusicalScale[] = [
  {
    id: 'natural-minor',
    name: 'Natural Minor (Aeolian)',
    category: 'MODAL',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: '1 2 b3 4 5 b6 b7',
    mood: 'Emotional, contemplative, melancholic, cyber-dystopian',
    idealForGenres: ['Synthwave', 'Liquid DnB', 'Cyberpunk', 'Trance'],
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'MODAL',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: '1 2 b3 4 5 6 b7',
    mood: 'Soulful, sophisticated minor with hopeful raised 6th',
    idealForGenres: ['Deep House', 'Liquid DnB', 'Future Garage', 'Nu-Disco'],
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    category: 'MODAL',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: '1 b2 b3 4 5 b6 b7',
    mood: 'Aggressive, ominous, tense with exotic minor 2nd step',
    idealForGenres: ['Techno', 'Neurofunk', 'Industrial Bass', 'Acid'],
  },
  {
    id: 'phrygian-dominant',
    name: 'Phrygian Dominant (Spanish Gypsy)',
    category: 'SYNTHETIC',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    formula: '1 b2 3 4 5 b6 b7',
    mood: 'Hypnotic, mystical, menacing harmonic minor 5th mode',
    idealForGenres: ['Psytrance', 'Dark Techno', 'Cyberpunk Action', 'Middle Eastern Bass'],
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    category: 'DIATONIC',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    formula: '1 2 b3 4 5 b6 7',
    mood: 'Classical drama, tension, leading-tone resolution',
    idealForGenres: ['Cinematic Orchestral', 'Dubstep', 'Hardstyle', 'Acid'],
  },
  {
    id: 'hungarian-minor',
    name: 'Hungarian Minor (Double Harmonic)',
    category: 'EXOTIC',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    formula: '1 2 b3 #4 5 b6 7',
    mood: 'Extreme dystopian tension, neon intrigue, sci-fi cyberpunk noir',
    idealForGenres: ['Cyberpunk Soundtrack', 'Darkwave', 'Experimental Bass'],
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    category: 'MODAL',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: '1 2 3 #4 5 6 7',
    mood: 'Ethereal, floating, wondrous, futuristic with augmented 4th',
    idealForGenres: ['Ambient', 'Film Score', 'Progressive House', 'Chillsynth'],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'MODAL',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: '1 2 3 4 5 6 b7',
    mood: 'Uplifting yet grounded, bluesy, anthemic major with flat 7th',
    idealForGenres: ['Nu-Disco', 'Funky House', 'Indie Dance', 'Electropop'],
  },
  {
    id: 'melodic-minor',
    name: 'Melodic Minor (Jazz Minor)',
    category: 'DIATONIC',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    formula: '1 2 b3 4 5 6 7',
    mood: 'Modern jazz complexity, slick futuristic noir',
    idealForGenres: ['Liquid DnB', 'IDM', 'Nu-Jazz', 'Glitch Hop'],
  },
  {
    id: 'minor-pentatonic',
    name: 'Minor Pentatonic',
    category: 'PENTATONIC',
    intervals: [0, 3, 5, 7, 10],
    formula: '1 b3 4 5 b7',
    mood: 'Punchy, direct, memorable, riff-friendly hook foundation',
    idealForGenres: ['Tech House', 'Trap', 'Acid Plucks', 'Synth Leads'],
  },
];

// ============================================================================
// 2. MASTERING LOUDNESS STANDARDS (EBU R128, AES, STREAMING, CLUB)
// ============================================================================
export const MASTERING_LOUDNESS_STANDARDS: MasteringLoudnessStandard[] = [
  {
    id: 'STREAMING_SPOTIFY_APPLE',
    name: 'Streaming Distribution (Spotify / Apple Music / TIDAL)',
    platform: 'Spotify, Apple Music, TIDAL, Deezer, Amazon Music',
    integratedLufs: -14.0,
    maxTruePeakDb: -1.0,
    targetDynamicRangeLu: 9.0,
    maxShortTermLufs: -10.0,
    monoBassCutoffHz: 120,
    eqTargetCurve: 'TILT_3DB_OCT',
    notes: 'Preserves microdynamics and punch without triggering lossy codec limiter distortion.',
  },
  {
    id: 'CLUB_FESTIVAL_PA',
    name: 'Club & Festival Sound System (High Energy)',
    platform: 'Beatport, Bandcamp, DJ Pool, Club PA Systems',
    integratedLufs: -8.0,
    maxTruePeakDb: -0.1,
    targetDynamicRangeLu: 5.5,
    maxShortTermLufs: -6.0,
    monoBassCutoffHz: 140,
    eqTargetCurve: 'SMILE_LOUDNESS',
    notes: 'Maximum acoustic density, tight sub-140Hz mono grouping for multi-kilowatt horn subs.',
  },
  {
    id: 'YOUTUBE_TWITCH_BROADCAST',
    name: 'YouTube & Live Stream Broadcast',
    platform: 'YouTube ContentID, Twitch Interactive Streams, Kick',
    integratedLufs: -14.0,
    maxTruePeakDb: -1.0,
    targetDynamicRangeLu: 8.5,
    maxShortTermLufs: -11.0,
    monoBassCutoffHz: 100,
    eqTargetCurve: 'HARMAN_WARMTH',
    notes: 'Normalized to YouTube loudness penalty zero-delta, prevents automatic gain attenuation.',
  },
  {
    id: 'EBU_R128_TELEVISION',
    name: 'Broadcast Television & Radio (EBU R128 / ITU-R BS.1770)',
    platform: 'European & Global Television Standards, FM/DAB+ Radio',
    integratedLufs: -23.0,
    maxTruePeakDb: -1.0,
    targetDynamicRangeLu: 14.0,
    maxShortTermLufs: -18.0,
    monoBassCutoffHz: 80,
    eqTargetCurve: 'FLAT_HIGH_RES',
    notes: 'Complies strictly with international broadcast regulations and dialog intelligibility.',
  },
  {
    id: 'CINEMATIC_SPATIAL',
    name: 'Cinematic Post-Production & Film Score',
    platform: 'Dolby Atmos, Netflix Post-Spec, Theatrical Distribution',
    integratedLufs: -24.0,
    maxTruePeakDb: -2.0,
    targetDynamicRangeLu: 18.0,
    maxShortTermLufs: -16.0,
    monoBassCutoffHz: 60,
    eqTargetCurve: 'FLAT_HIGH_RES',
    notes: 'Ultra-wide dynamic range accommodating whisper-quiet intros to thunderous drops.',
  },
];

// ============================================================================
// 3. CHORD PROGRESSIONS DATABASE (100+ PROGRESSIONS ACROSS 6 GENRES)
// ============================================================================
export const CHORD_PROGRESSIONS_VAULT: ChordProgressionItem[] = [
  // --- CYBERPUNK & SYNTHWAVE ---
  {
    id: 'prog-cp-01',
    name: 'Neon Blade Runner Noir',
    genre: 'CYBERPUNK_SYNTHWAVE',
    key: 'A minor',
    scaleMode: 'Aeolian',
    bpm: 118,
    romanNumerals: ['i', 'VI', 'III', 'VII'],
    chords: ['Am7', 'Fmaj7', 'Cmaj7', 'G7'],
    midiNotes: [
      [57, 60, 64, 67], // Am7: A3 C4 E4 G4
      [53, 57, 60, 64], // Fmaj7: F3 A3 C4 E4
      [48, 52, 55, 59], // Cmaj7: C3 E3 G3 B3
      [55, 59, 62, 65], // G7: G3 B3 D4 F4
    ],
    description: 'The definitive cinematic dystopian chord cycle with soaring minor 7ths.',
    energyLevel: 'MEDIUM',
  },
  {
    id: 'prog-cp-02',
    name: 'Dystopian Enclave March',
    genre: 'CYBERPUNK_SYNTHWAVE',
    key: 'C minor',
    scaleMode: 'Aeolian',
    bpm: 124,
    romanNumerals: ['i', 'iv', 'v', 'VI'],
    chords: ['Cm', 'Fm', 'Gm', 'Ab'],
    midiNotes: [
      [48, 51, 55], // Cm
      [53, 56, 60], // Fm
      [55, 58, 62], // Gm
      [56, 60, 63], // Ab
    ],
    description: 'Dark, driving, relentless industrial bassline progression.',
    energyLevel: 'PEAK_ENERGY',
  },
  {
    id: 'prog-cp-03',
    name: 'Chromium Horizon Overdrive',
    genre: 'CYBERPUNK_SYNTHWAVE',
    key: 'D minor',
    scaleMode: 'Dorian',
    bpm: 128,
    romanNumerals: ['i', 'IV', 'VII', 'i'],
    chords: ['Dm7', 'G9', 'Cmaj7', 'Dm'],
    midiNotes: [
      [50, 53, 57, 60], // Dm7
      [55, 59, 62, 65, 69], // G9
      [48, 52, 55, 59], // Cmaj7
      [50, 53, 57], // Dm
    ],
    description: 'Dorian brightness against aggressive minor grit for driving night highway chases.',
    energyLevel: 'PEAK_ENERGY',
  },
  {
    id: 'prog-cp-04',
    name: 'Sub-Zero Cryo Chamber',
    genre: 'CYBERPUNK_SYNTHWAVE',
    key: 'F# minor',
    scaleMode: 'Aeolian',
    bpm: 110,
    romanNumerals: ['i', 'VII', 'VI', 'v'],
    chords: ['F#m9', 'E6', 'Dmaj7', 'C#m7'],
    midiNotes: [
      [54, 57, 61, 64, 68], // F#m9
      [52, 56, 59, 61], // E6
      [50, 54, 57, 61], // Dmaj7
      [49, 52, 56, 59], // C#m7
    ],
    description: 'Cold, crystalline synthesizers over warm sub-bass pad foundations.',
    energyLevel: 'CHILL',
  },

  // --- LIQUID DRUM & BASS ---
  {
    id: 'prog-ldnb-01',
    name: 'Ether Horizon Liquid Soul',
    genre: 'LIQUID_DNB',
    key: 'F minor',
    scaleMode: 'Dorian',
    bpm: 174,
    romanNumerals: ['i7', 'bVImaj7', 'bIIImaj7', 'bVII7'],
    chords: ['Fm7', 'Dbmaj9', 'Abmaj7', 'Eb7'],
    midiNotes: [
      [53, 56, 60, 63], // Fm7
      [49, 53, 56, 60, 63], // Dbmaj9
      [56, 60, 63, 67], // Abmaj7
      [51, 55, 58, 61], // Eb7
    ],
    description: 'Lush, uplifting Rhodes electric piano and soaring atmospheric pads at 174 BPM.',
    energyLevel: 'PEAK_ENERGY',
  },
  {
    id: 'prog-ldnb-02',
    name: 'Bristol Twilight Echoes',
    genre: 'LIQUID_DNB',
    key: 'Eb minor',
    scaleMode: 'Aeolian',
    bpm: 175,
    romanNumerals: ['i9', 'iv7', 'VIImaj7', 'IIImaj7'],
    chords: ['Ebm9', 'Abm7', 'Dbmaj7', 'Gbmaj7'],
    midiNotes: [
      [51, 54, 58, 61, 65], // Ebm9
      [56, 59, 63, 66], // Abm7
      [49, 53, 56, 60], // Dbmaj7
      [54, 58, 61, 65], // Gbmaj7
    ],
    description: 'Deep soulful jazz voicings over 2-step liquid breakbeats.',
    energyLevel: 'MEDIUM',
  },
  {
    id: 'prog-ldnb-03',
    name: 'Celestial Neuro Elevation',
    genre: 'LIQUID_DNB',
    key: 'Bb minor',
    scaleMode: 'Dorian',
    bpm: 172,
    romanNumerals: ['i7', 'IV7', 'v7', 'bVImaj7'],
    chords: ['Bbm7', 'Eb7', 'Fm7', 'Gbmaj7'],
    midiNotes: [
      [46, 49, 53, 56], // Bbm7
      [51, 55, 58, 61], // Eb7
      [53, 56, 60, 63], // Fm7
      [54, 58, 61, 65], // Gbmaj7
    ],
    description: 'Rolling sub-bass glide path with crisp syncopated hi-hats.',
    energyLevel: 'PEAK_ENERGY',
  },

  // --- TECHNO & ACID ---
  {
    id: 'prog-tech-01',
    name: 'Berghain Monolith 4x4',
    genre: 'TECHNO_ACID',
    key: 'F minor',
    scaleMode: 'Phrygian',
    bpm: 136,
    romanNumerals: ['i', 'bII', 'i', 'bVII'],
    chords: ['Fm', 'Gb', 'Fm', 'Ebm'],
    midiNotes: [
      [41, 44, 48], // Fm
      [42, 46, 49], // Gb
      [41, 44, 48], // Fm
      [39, 42, 46], // Ebm
    ],
    description: 'Maximum Phrygian tension designed for modular acid sweeps and heavy 909 kicks.',
    energyLevel: 'PEAK_ENERGY',
  },
  {
    id: 'prog-tech-02',
    name: '303 Devil Fish Resonator',
    genre: 'TECHNO_ACID',
    key: 'A minor',
    scaleMode: 'Aeolian',
    bpm: 140,
    romanNumerals: ['i', 'i', 'bVI', 'V'],
    chords: ['Am', 'Am', 'F', 'E7'],
    midiNotes: [
      [45, 48, 52], // Am
      [45, 48, 52], // Am
      [41, 45, 48], // F
      [40, 44, 47, 50], // E7
    ],
    description: 'Hypnotic repetitive hypnotic hook with sharp harmonic resolution on the 4th bar.',
    energyLevel: 'PEAK_ENERGY',
  },
  {
    id: 'prog-tech-03',
    name: 'Warehouse Concrete Dub',
    genre: 'TECHNO_ACID',
    key: 'D minor',
    scaleMode: 'Aeolian',
    bpm: 132,
    romanNumerals: ['i7', 'i7', 'v7', 'bVII'],
    chords: ['Dm7', 'Dm7', 'Am7', 'C'],
    midiNotes: [
      [50, 53, 57, 60], // Dm7
      [50, 53, 57, 60], // Dm7
      [45, 48, 52, 55], // Am7
      [48, 52, 55], // C
    ],
    description: 'Subterranean chord stabs through tape echo and spring reverb chambers.',
    energyLevel: 'MEDIUM',
  },

  // --- CINEMATIC & AMBIENT ---
  {
    id: 'prog-cine-01',
    name: 'Interstellar Warp Transition',
    genre: 'CINEMATIC_AMBIENT',
    key: 'E minor',
    scaleMode: 'Aeolian',
    bpm: 80,
    romanNumerals: ['i', 'bVI', 'bIII', 'bVII'],
    chords: ['Em9', 'Cmaj9', 'Gmaj7', 'Dadd9'],
    midiNotes: [
      [52, 55, 59, 62, 66], // Em9
      [48, 52, 55, 59, 62], // Cmaj9
      [55, 59, 62, 66], // Gmaj7
      [50, 54, 57, 62], // Dadd9
    ],
    description: 'Massive emotional breadth with wide open string voicings and slow tape modulation.',
    energyLevel: 'CHILL',
  },
  {
    id: 'prog-cine-02',
    name: 'Solar Winds & Quantum Drift',
    genre: 'CINEMATIC_AMBIENT',
    key: 'C# minor',
    scaleMode: 'Lydian Minor',
    bpm: 65,
    romanNumerals: ['i', 'bIImaj7', 'i', 'iv'],
    chords: ['C#m(sus2)', 'Dmaj7', 'C#m', 'F#m9'],
    midiNotes: [
      [49, 51, 56], // C#msus2
      [50, 54, 57, 61], // Dmaj7
      [49, 52, 56], // C#m
      [54, 57, 61, 64, 68], // F#m9
    ],
    description: 'Suspended tension for zero-gravity soundscapes and slow macro evolving pads.',
    energyLevel: 'CHILL',
  },

  // --- DEEP HOUSE & FUTURE GARAGE ---
  {
    id: 'prog-dh-01',
    name: 'Burial South London Rain',
    genre: 'DEEP_HOUSE_GARAGE',
    key: 'Bb minor',
    scaleMode: 'Aeolian',
    bpm: 134,
    romanNumerals: ['i7', 'iv9', 'bVImaj7', 'bVII'],
    chords: ['Bbm7', 'Ebm9', 'Gbmaj7', 'Ab'],
    midiNotes: [
      [46, 49, 53, 56], // Bbm7
      [51, 54, 58, 61, 65], // Ebm9
      [54, 58, 61, 65], // Gbmaj7
      [44, 48, 51], // Ab
    ],
    description: 'Vinyl crackle, vocal chop stabs, and swung 2-step syncopation.',
    energyLevel: 'MEDIUM',
  },
  {
    id: 'prog-dh-02',
    name: 'Chicago Warehouse 90s Stabs',
    genre: 'DEEP_HOUSE_GARAGE',
    key: 'C minor',
    scaleMode: 'Dorian',
    bpm: 125,
    romanNumerals: ['i9', 'bVII', 'IV7', 'i'],
    chords: ['Cm9', 'Bb', 'F7', 'Cm7'],
    midiNotes: [
      [48, 51, 55, 58, 62], // Cm9
      [46, 50, 53], // Bb
      [41, 45, 48, 51], // F7
      [48, 51, 55, 58], // Cm7
    ],
    description: 'Iconic M1 organ and sampled piano chord stabs for classic deep grooves.',
    energyLevel: 'PEAK_ENERGY',
  },

  // --- NEUROFUNK & BASS MUSIC ---
  {
    id: 'prog-neuro-01',
    name: 'Reese Bass Distortion Matrix',
    genre: 'NEUROFUNK_BASS',
    key: 'F minor',
    scaleMode: 'Phrygian',
    bpm: 174,
    romanNumerals: ['i', 'bV', 'iv', 'bII'],
    chords: ['F5', 'B5', 'Bb5', 'Gb5'],
    midiNotes: [
      [41, 48], // F5
      [47, 54], // B5 (Tritone!)
      [46, 53], // Bb5
      [42, 49], // Gb5
    ],
    description: 'Dissonant tritone slides formulated specifically for aggressive multi-band distortion.',
    energyLevel: 'PEAK_ENERGY',
  },
];

// ============================================================================
// 4. GROOVE & HUMANIZED TIMING PROFILES
// ============================================================================
export const GROOVE_PROFILES: GrooveTemplate[] = [
  {
    id: 'straight-16',
    name: 'Quantized Grid 16th (Machine Precision)',
    swingPct: 50,
    velocityHumanize: 0.05,
    timingJitterMs: 0.0,
    description: 'Dead-center mathematical grid for driving techno and trance pulses.',
  },
  {
    id: 'mpc-60-swing-54',
    name: 'Roger Linn MPC 60 (54% Subtle Push)',
    swingPct: 54,
    velocityHumanize: 0.15,
    timingJitterMs: 1.5,
    description: 'Gentle musical bounce that brings robotic drum sequences to life.',
  },
  {
    id: 'mpc-60-swing-62',
    name: 'Classic MPC 60 Heavy Swing (62%)',
    swingPct: 62,
    velocityHumanize: 0.25,
    timingJitterMs: 3.2,
    description: 'The legendary golden-era hip-hop and French Touch house swing pocket.',
  },
  {
    id: 'garage-2step-shuffle',
    name: 'UK Garage 2-Step Shuffle (66%)',
    swingPct: 66,
    velocityHumanize: 0.35,
    timingJitterMs: 4.8,
    description: 'Trippy, off-beat syncopation with delayed ghost snares.',
  },
  {
    id: 'dnb-syncopated-roll',
    name: 'D&B Breakbeat Syncopated Push',
    swingPct: 53,
    velocityHumanize: 0.28,
    timingJitterMs: 2.1,
    description: 'Tight velocity dynamics on the ride cymbal with forward-leaning snares.',
  },
];

// ============================================================================
// 5. ABLETON LIVE 12 NATIVE INSTRUMENT & FX SOUND DESIGN PRESETS
// ============================================================================
export const ABLETON_NATIVE_PRESETS: AbletonInstrumentPreset[] = [
  {
    id: 'wavetable-cyber-bass',
    deviceType: 'Wavetable',
    name: 'Heretic Neuro Reese',
    category: 'BASS',
    description: 'Dual wavetable detuned saw with automated lowpass notch filter sweep.',
    parameters: {
      osc1_wavetable: 'Basics/Basic Shapes',
      osc1_shape: 'Saw',
      osc2_wavetable: 'Distortion/Modern Talking',
      sub_level: 0.85,
      filter1_type: 'Lowpass 24dB MS2',
      filter1_cutoff: 420,
      filter1_res: 3.2,
      unison_mode: 'Shimmer',
      unison_voices: 4,
    },
  },
  {
    id: 'operator-fm-pluck',
    deviceType: 'Operator',
    name: 'Cybernetic DX Pluck',
    category: 'LEAD',
    description: '4-Operator FM bell pluck with exponential attack envelope and chorus warmth.',
    parameters: {
      algorithm: 1, // Linear 4-stack
      carrier_a_coarse: 1,
      mod_b_coarse: 2,
      mod_b_level: 0.65,
      mod_c_coarse: 7,
      mod_c_level: 0.35,
      filter_cutoff: 3200,
    },
  },
  {
    id: 'meld-macro-swarm',
    deviceType: 'Meld',
    name: 'Bio-Digital Swarm Engine',
    category: 'PAD',
    description: 'Bi-timbral physical modeling engine with dual macro resonators.',
    parameters: {
      engine_a: 'Swarm Saw',
      engine_b: 'Modal Resonator',
      macro1_spread: 0.75,
      macro2_decay: 4.5,
      drive: 2.4,
    },
  },
  {
    id: 'roar-master-warmth',
    deviceType: 'Roar',
    name: 'Analog Tape & Tube Master Color',
    category: 'FX_MASTERING',
    description: 'Ableton 12 dual-stage saturation with multiband crossover and mid/side focus.',
    parameters: {
      routing: 'MidSide',
      stage1_mode: 'Warm Tape',
      stage1_drive: 1.8,
      stage2_mode: 'Tube Triode',
      stage2_drive: 0.9,
      dry_wet: 0.35,
    },
  },
  {
    id: 'drum-buss-transient-glue',
    deviceType: 'DrumBuss',
    name: 'Sub Transients & Boom 45Hz',
    category: 'DRUMS',
    description: 'Punches drums through any stream broadcast mix with tuned sub resonance.',
    parameters: {
      drive: 0.25,
      crunch: 0.15,
      boom_freq: 45,
      boom_decay: 0.4,
      boom_amount: 0.65,
      transients: 0.2,
    },
  },
];
