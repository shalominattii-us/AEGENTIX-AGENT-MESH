/**
 * AEGENTIX CYBERDAW - INDUSTRY AUDIO PRODUCTION & MASTERING CONFIGURATIONS
 * Curated production architectures, DSP chains, mastering presets, and stream routing
 * from leading audio technology leaders: iZotope, FabFilter, Dolby.io, LANDR, Waves, and Audiomovers.
 */

export interface IndustryMasteringChainConfig {
  id: string;
  vendor: 'iZotope' | 'FabFilter' | 'Dolby.io' | 'LANDR' | 'Waves' | 'Audiomovers';
  title: string;
  category: 'MASTERING_SUITE' | 'TAPE_WARMTH' | 'DYNAMIC_EQ' | 'STEM_SEPARATION' | 'STREAM_LINK';
  targetLufs: number;
  truePeakCeilingDb: number;
  dynamicRangeTargetLu: number;
  description: string;
  signalFlow: string[];
  dspParameters: Record<string, any>;
  abletonDevices: Array<{
    name: string;
    type: string;
    settings: Record<string, any>;
  }>;
  obsStreamFilterConfig: {
    compressorRatio: number;
    compressorThresholdDb: number;
    limiterCeilingDb: number;
    rnnoiseEnabled: boolean;
  };
}

export const INDUSTRY_MASTERING_CONFIGS: IndustryMasteringChainConfig[] = [
  // 1. iZotope Ozone 11 Advanced Mastering Chain
  {
    id: 'izotope-ozone-11-club-maximizer',
    vendor: 'iZotope',
    title: 'Ozone 11 Advanced: Club & Festival Dynamic Maximizer',
    category: 'MASTERING_SUITE',
    targetLufs: -8.0,
    truePeakCeilingDb: -0.1,
    dynamicRangeTargetLu: 5.8,
    description: 'IRC IV (Intelligent Release Control) multi-band transient maximization with sub-120Hz mono focus and harmonic exciter.',
    signalFlow: [
      '1. High-Pass Clean (24Hz 4th-order Butterworth)',
      '2. Dynamic EQ (Surgical mud cut at 280Hz, harshness tame at 3.4kHz)',
      '3. Vintage Tape Saturation (Warm odd harmonics, 15 IPS bump)',
      '4. Mid/Side Stereo Imager (Band 1 < 120Hz Mono 0%, Band 4 > 8kHz 135%)',
      '5. IRC IV Maximizer (Ceiling -0.1 dBTP, Transient mode, Soft-clip enabled)',
    ],
    dspParameters: {
      maximizerMode: 'IRC_IV_TRANSIENT',
      softClipDriveDb: 1.2,
      stereoWidthBands: [
        { freqRange: '0 - 120 Hz', widthPct: 0, monoSub: true },
        { freqRange: '120 - 2.5 kHz', widthPct: 100 },
        { freqRange: '2.5k - 8 kHz', widthPct: 120 },
        { freqRange: '8k - 20 kHz', widthPct: 140 },
      ],
      dynamicEqNotches: [
        { freq: 280, q: 2.1, maxGainReductionDb: -2.5 },
        { freq: 3400, q: 3.5, maxGainReductionDb: -2.0 },
      ],
    },
    abletonDevices: [
      {
        name: 'Master Utility',
        type: 'AudioEffectGroupDevice',
        settings: { BassMono: true, BassMonoFreq: 120, Width: 1.0 },
      },
      {
        name: 'EQ Eight Surgical',
        type: 'Eq8',
        settings: { HPF: 25, LowShelf: 75, MidCut: 280, HighShelf: 12000 },
      },
      {
        name: 'Glue Compressor (SSL G-Master)',
        type: 'GlueCompressor',
        settings: { Attack: 30, Release: 'Auto', Ratio: 2.0, Range: 3.0 },
      },
      {
        name: 'Saturator (Analog Warmth)',
        type: 'Saturator',
        settings: { Drive: 1.2, Curve: 'AnalogClip', Color: 3500 },
      },
      {
        name: 'Color Limiter',
        type: 'Limiter',
        settings: { Ceiling: -0.1, Lookahead: 5.0, Release: 80 },
      },
    ],
    obsStreamFilterConfig: {
      compressorRatio: 2.5,
      compressorThresholdDb: -14.0,
      limiterCeilingDb: -0.1,
      rnnoiseEnabled: true,
    },
  },

  // 2. FabFilter Pro-Q 3 / Pro-C 2 / Pro-L 2 Mastering Suite
  {
    id: 'fabfilter-pro-streaming-reference',
    vendor: 'FabFilter',
    title: 'FabFilter Mastering Suite: Transparent Streaming Master (-14 LUFS)',
    category: 'MASTERING_SUITE',
    targetLufs: -14.0,
    truePeakCeilingDb: -1.0,
    dynamicRangeTargetLu: 9.5,
    description: 'Linear-phase pristine mastering chain adhering strictly to Spotify, Apple Music, and TIDAL loudness distribution specs.',
    signalFlow: [
      '1. Pro-Q 3 Linear Phase High-Res EQ (Tilt 3dB/oct slope, 30Hz brickwall)',
      '2. Pro-C 2 Mastering Opto Compressor (Smooth leveling, 30ms attack)',
      '3. Pro-MB 6-Band Multiband Dynamics (Sub control, vocal air expansion)',
      '4. Pro-L 2 True Peak ISP Brickwall Limiter (4x oversampling, -1.0 dBTP)',
    ],
    dspParameters: {
      phaseMode: 'LINEAR_PHASE_HIGH',
      limiterStyle: 'TRANSPARENT_ISP',
      oversamplingRate: '4X',
      targetLoudnessLufs: -14.0,
      truePeakProtection: true,
    },
    abletonDevices: [
      {
        name: 'FabFilter Pro-Q 3 Curve Emulator',
        type: 'Eq8',
        settings: { Band1_HPF: 30, Band2_Dip: 320, Band8_Air: 14000 },
      },
      {
        name: 'FabFilter Pro-C 2 Opto Emulator',
        type: 'Compressor',
        settings: { Model: 'Opto', Attack: 30, Release: 120, Ratio: 2.0 },
      },
      {
        name: 'FabFilter Pro-L 2 True Peak Emulator',
        type: 'Limiter',
        settings: { Ceiling: -1.0, Lookahead: 4.0, Mode: 'Stereo' },
      },
    ],
    obsStreamFilterConfig: {
      compressorRatio: 2.0,
      compressorThresholdDb: -18.0,
      limiterCeilingDb: -1.0,
      rnnoiseEnabled: true,
    },
  },

  // 3. Dolby.io Broadcast Intelligent Mastering
  {
    id: 'dolby-io-broadcast-master',
    vendor: 'Dolby.io',
    title: 'Dolby.io Media Processing: Broadcast & EBU R128 Television Spec',
    category: 'MASTERING_SUITE',
    targetLufs: -23.0,
    truePeakCeilingDb: -1.0,
    dynamicRangeTargetLu: 14.0,
    description: 'International broadcast compliance for television, cinema dialogue clarity, and zero clipping over digital transmission.',
    signalFlow: [
      '1. Dialogue Intelligibility Enhancer (Center channel extraction)',
      '2. Spectral De-Hum & De-Esser (5.5kHz sibilance control)',
      '3. EBU R128 Loudness Normalizer (Integrated -23.0 LUFS, Max Short-Term -18.0)',
      '4. ITU-R BS.1770 True Peak Limiter (-1.0 dBTP ceiling)',
    ],
    dspParameters: {
      dialogueProtection: true,
      deEsserThresholdDb: -22.0,
      targetStandard: 'EBU_R128',
    },
    abletonDevices: [
      {
        name: 'Dolby Dialogue EQ',
        type: 'Eq8',
        settings: { HighPass: 40, DeEssDip: 5800, DialogueClarity: 2500 },
      },
      {
        name: 'Broadcast Limiter',
        type: 'Limiter',
        settings: { Ceiling: -1.0, Release: 150 },
      },
    ],
    obsStreamFilterConfig: {
      compressorRatio: 4.0,
      compressorThresholdDb: -20.0,
      limiterCeilingDb: -1.0,
      rnnoiseEnabled: true,
    },
  },

  // 4. Waves Abbey Road TG Mastering & Tape Saturation
  {
    id: 'waves-abbey-road-analog-tape',
    vendor: 'Waves',
    title: 'Abbey Road TG12410 & Studer A800 Analog Tape Warmth',
    category: 'TAPE_WARMTH',
    targetLufs: -10.5,
    truePeakCeilingDb: -0.3,
    dynamicRangeTargetLu: 7.2,
    description: 'Legendary Abbey Road Studio console tone with magnetic tape harmonic saturation and gentle transient rounding.',
    signalFlow: [
      '1. Abbey Road TG Console EQ (Presence & Brilliance boost)',
      '2. Studer A800 1/2" 30 IPS Tape Machine (Flux 250 nWb/m saturation)',
      '3. TG Limiter / Compressor in Zener Diode Mode',
      '4. Stereo Spreader with vintage transformer phase response',
    ],
    dspParameters: {
      tapeSpeedIps: 30,
      tapeFormulation: 'GP9',
      biasLevel: '+3dB Overbias',
      harmonicDrive: 2.4,
    },
    abletonDevices: [
      {
        name: 'Roar Analog Tape Machine',
        type: 'Roar',
        settings: { Mode: 'WarmTape', Drive: 2.2, Tone: 4800, Bias: 0.1 },
      },
      {
        name: 'Abbey Road EQ Eight',
        type: 'Eq8',
        settings: { BassLift: 80, AirShine: 10000 },
      },
      {
        name: 'Vintage Glue Compressor',
        type: 'GlueCompressor',
        settings: { Attack: 10, Release: 'Auto', Ratio: 4.0 },
      },
    ],
    obsStreamFilterConfig: {
      compressorRatio: 3.0,
      compressorThresholdDb: -16.0,
      limiterCeilingDb: -0.3,
      rnnoiseEnabled: false,
    },
  },

  // 5. Audiomovers LISTENTO & SonoBus Lossless PCM Stream Link
  {
    id: 'audiomovers-listento-lossless-link',
    vendor: 'Audiomovers',
    title: 'Audiomovers LISTENTO & SonoBus Lossless DAW Stream Bridge',
    category: 'STREAM_LINK',
    targetLufs: -14.0,
    truePeakCeilingDb: -0.5,
    dynamicRangeTargetLu: 10.0,
    description: 'Pristine 32-bit float / 24-bit 96kHz uncompressed PCM audio streaming directly between Ableton Live and OBS Studio broadcast.',
    signalFlow: [
      '1. Live DAW Master Bus Output (32-bit floating point)',
      '2. Audiomovers VST / Max for Live Telemetry Intercept',
      '3. Ultra-Low Latency Buffer (128 samples / 2.7ms jitter)',
      '4. OBS Application Audio Capture (BETA) Direct Ingestion',
    ],
    dspParameters: {
      bitDepth: 32,
      sampleRate: 48000,
      channels: 2,
      codec: 'UNCOMPRESSED_PCM',
      bufferSizeSamples: 128,
    },
    abletonDevices: [
      {
        name: 'AEGENTIX CYBERDAW Telemetry Passthrough',
        type: 'MxDPlugin',
        settings: { PluginL: 'plugin~', PlugoutR: 'plugout~', BitDepth: 32 },
      },
    ],
    obsStreamFilterConfig: {
      compressorRatio: 1.5,
      compressorThresholdDb: -12.0,
      limiterCeilingDb: -0.5,
      rnnoiseEnabled: false,
    },
  },
];
