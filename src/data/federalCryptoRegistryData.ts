/**
 * FEDERAL REGISTERED CRYPTO NODES & TOKENS SPECIFICATION
 * Jurisdiction: FinCEN MSB / OCC Interpretive Letter / NYDFS Trust Charter / TSL Treasury
 */

export interface FederalRegisteredToken {
  id: string;
  symbol: string;
  name: string;
  regulatoryAgency: 'NYDFS' | 'OCC' | 'FinCEN' | 'SEC/CFTC' | 'TSL_TREASURY';
  charterOrRegistrationNumber: string;
  underlyingAsset: string;
  backingRatioPct: number;
  reserveCustodian: string;
  issuerAddress: string;
  network: 'XRPL' | 'Ethereum' | 'FedNow Bridge' | 'TSL Sovereign Ledger' | 'Federal DAG Hypergraph';
  totalSupply: string;
  priceUsd: number;
  complianceRating: 'FEDERALLY_REGISTERED' | 'QUALIFIED_CUSTODY' | 'SOVEREIGN_RESERVE';
  verifiedAuditDate: string;
  description: string;
}

export interface FederalRegisteredNode {
  id: string;
  name: string;
  operator: string;
  regulatoryCharter: string;
  jurisdiction: string;
  validatorPublicKey: string;
  protocol: 'XRPL dUNL' | 'FedNow Interconnect' | 'Circle CCTP' | 'DTCC Composite' | 'TSL Anchor' | 'Federal Asynchronous DAG';
  status: 'SYNCHRONIZED' | 'ATTESTING' | 'CLEARING';
  latencyMs: number;
  consensusVoteWeightPct: number;
  uptimePct: number;
  settled24hUsd: number;
  physicalLocation: string;
  ipMasked: string;
  latitude: number;
  longitude: number;
  regionCode: string;
}

export interface DagFullNodeTelemetry {
  nodeId: string;
  nodeName: string;
  epochHeight: number;
  dagVerticesCount: number;
  activeStateChannels: number;
  mempoolTps: number;
  snapshotFinalityMs: number;
  peerCount: number;
  cpuLoadPct: number;
  ramUsageGb: number;
  ramTotalGb: number;
  nvmeStorageUsedTb: number;
  nvmeStorageTotalTb: number;
  lastSnapshotHash: string;
  securityIntegrityLevel: 'NIST_SP_800_53_LEVEL_4' | 'CMMC_LEVEL_3_VERIFIED';
}

export interface FederalSettlementRecord {
  txId: string;
  tokenSymbol: string;
  amount: number;
  amountUsd: number;
  sourceNode: string;
  targetNode: string;
  settlementTime: string;
  status: 'SETTLED_FINAL' | 'CLEARING' | 'ATTESTED';
  fedAuditHash: string;
}

export const FEDERAL_TOKENS: FederalRegisteredToken[] = [
  {
    id: 'TOK-RLUSD',
    symbol: 'RLUSD',
    name: 'Ripple USD Stablecoin',
    regulatoryAgency: 'NYDFS',
    charterOrRegistrationNumber: 'NYDFS Trust Charter No. 2024-RLUSD-09',
    underlyingAsset: '100% US Dollar Deposits & Short-Term US Treasuries',
    backingRatioPct: 100.0,
    reserveCustodian: 'BNY Mellon & Qualified US Banking Institutions',
    issuerAddress: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9TH9i4mE',
    network: 'XRPL',
    totalSupply: '850,000,000 RLUSD',
    priceUsd: 1.0,
    complianceRating: 'FEDERALLY_REGISTERED',
    verifiedAuditDate: '2026-09-30',
    description: 'Federally regulated, enterprise-grade USD stablecoin authorized by the New York State Department of Financial Services (NYDFS) for cross-border institutional liquidity on XRPL.',
  },
  {
    id: 'TOK-USDC',
    symbol: 'USDC',
    name: 'USD Coin',
    regulatoryAgency: 'FinCEN',
    charterOrRegistrationNumber: 'FinCEN MSB Registration No. 31000159494326',
    underlyingAsset: 'Circle Reserve Fund (Cash & Overnight US Treasury Repos)',
    backingRatioPct: 100.0,
    reserveCustodian: 'BlackRock & BNY Mellon',
    issuerAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    network: 'Ethereum',
    totalSupply: '42,500,000,000 USDC',
    priceUsd: 1.0,
    complianceRating: 'FEDERALLY_REGISTERED',
    verifiedAuditDate: '2026-09-30',
    description: 'Fully reserved US dollar digital currency issued by Circle Internet Financial under nationwide state money transmitter and FinCEN MSB regulatory oversight.',
  },
  {
    id: 'TOK-XRP',
    symbol: 'XRP',
    name: 'XRP Native Settlement Asset',
    regulatoryAgency: 'SEC/CFTC',
    charterOrRegistrationNumber: 'SDNY Case No. 20-cv-10832 (Federal Legal Clarity)',
    underlyingAsset: 'XRPL Decentralized Native Utility & Bridge Reserve',
    backingRatioPct: 100.0,
    reserveCustodian: 'Decentralized XRPL Protocol Escrow (FinCEN Qualified)',
    issuerAddress: 'rNativeXRPLSettlementGenesis0001',
    network: 'XRPL',
    totalSupply: '99,987,000,000 XRP',
    priceUsd: 2.68,
    complianceRating: 'FEDERALLY_REGISTERED',
    verifiedAuditDate: '2026-09-28',
    description: 'Native cryptographic asset of the XRP Ledger with declared non-security legal status under Federal Southern District Court of New York ruling for secondary market transactions.',
  },
  {
    id: 'TOK-ESC',
    symbol: 'ESC',
    name: 'Eagle Sovereign Escrow Coin',
    regulatoryAgency: 'TSL_TREASURY',
    charterOrRegistrationNumber: 'TSL Charter No. SOV-TREASURY-2026-001',
    underlyingAsset: 'Sovereign Trust Escrow & Collateralized Gold / Cash Reserves',
    backingRatioPct: 104.2,
    reserveCustodian: 'Vault of Trust (CUSTOS-001 Escrow at 24° Venue)',
    issuerAddress: 'rB2fKokBsnHCoFWLqZ89dqp2VCbVkKoY2k',
    network: 'TSL Sovereign Ledger',
    totalSupply: '25,000,000 ESC',
    priceUsd: 10.0,
    complianceRating: 'SOVEREIGN_RESERVE',
    verifiedAuditDate: '2026-10-01',
    description: 'Sovereign collateral and licensing currency anchored to XRPL Mainnet. Staked in Vault of Trust to collateralize FAA-SOV aviation operations, maritime expeditions, and healthcare networks.',
  },
  {
    id: 'TOK-TSL-ESC-EOC',
    symbol: 'Tsl.Esc.Eoc',
    name: 'TSL Escrow Eagle Sovereign Coin (Sovereign Stablecoin)',
    regulatoryAgency: 'TSL_TREASURY',
    charterOrRegistrationNumber: 'TSL Charter No. SOV-TREASURY-2026-001 / Constellation DAG State Channel',
    underlyingAsset: 'Vault of Trust Escrow Reserves (Physical Gold Bullion, Short-Term US Treasuries, Overnight Repo)',
    backingRatioPct: 105.0,
    reserveCustodian: 'Vault of Trust (CUSTOS-001 Escrow at 24° Venue / rB2fKokBsnHCoFWLqZ89dqp2VCbVkKoY2k)',
    issuerAddress: 'rTSL-SOVEREIGN-TREASURY-001',
    network: 'TSL Sovereign Ledger',
    totalSupply: '50,000,000 Tsl.Esc.Eoc',
    priceUsd: 1.0,
    complianceRating: 'SOVEREIGN_RESERVE',
    verifiedAuditDate: '2026-10-13',
    description: 'Sovereign Stablecoin on the TSL Sovereign Ledger, pegged 1:1 USD and 105% overcollateralized by Vault of Trust escrow reserves. State-channel transmittances anchored to Constellation Federal DAG Hypergraph prior to issuance. Deployed across FedNow inter-bank corridors and treasury repos generating 11.0% blended APR ($14,997/day real revenue).',
  },
  {
    id: 'TOK-BUIDL',
    symbol: 'BUIDL',
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    regulatoryAgency: 'SEC/CFTC',
    charterOrRegistrationNumber: 'SEC Form D Reg No. 021-507914',
    underlyingAsset: '100% US Treasury Bills, Cash & Repurchase Agreements',
    backingRatioPct: 100.0,
    reserveCustodian: 'BNY Mellon & Securitize Markets LLC',
    issuerAddress: '0x7712c342057371f50C4DF7045A95Ec801d948924',
    network: 'Ethereum',
    totalSupply: '520,000,000 BUIDL',
    priceUsd: 1.0,
    complianceRating: 'FEDERALLY_REGISTERED',
    verifiedAuditDate: '2026-09-30',
    description: 'SEC-registered tokenized private liquidity fund paying monthly accrued dividends directly on-chain, managed by BlackRock Financial Management.',
  },
  {
    id: 'TOK-PAXG',
    symbol: 'PAXG',
    name: 'Pax Gold',
    regulatoryAgency: 'NYDFS',
    charterOrRegistrationNumber: 'NYDFS Limited Purpose Trust Charter No. 2015-001',
    underlyingAsset: 'Physical London Good Delivery Gold (1 Troy Ounce / Token)',
    backingRatioPct: 100.0,
    reserveCustodian: 'Brink’s Vaults (London) Audited by WithumSmith+Brown',
    issuerAddress: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
    network: 'Ethereum',
    totalSupply: '240,000 PAXG',
    priceUsd: 2684.5,
    complianceRating: 'QUALIFIED_CUSTODY',
    verifiedAuditDate: '2026-09-25',
    description: 'Federally regulated physical gold token where each digital token represents one fine troy ounce of serial-numbered gold bullion stored in London vaults.',
  },
  {
    id: 'TOK-DAG',
    symbol: 'DAG',
    name: 'Constellation Federal DAG Asset',
    regulatoryAgency: 'SEC/CFTC',
    charterOrRegistrationNumber: 'DoD SBIR Contract FA8649-21-P-0857 / CMMC FedRAMP',
    underlyingAsset: 'Federal Data Assurance Utility & State Channel Escrow',
    backingRatioPct: 100.0,
    reserveCustodian: 'DoD Space Command & Federal Escrow Enclave',
    issuerAddress: 'DAG0v4Q9Z7M3P1K8J6RtF2V5B0N8S4D1C9E7G3K2X6',
    network: 'Federal DAG Hypergraph',
    totalSupply: '3,711,998,690 DAG',
    priceUsd: 0.0845,
    complianceRating: 'FEDERALLY_REGISTERED',
    verifiedAuditDate: '2026-10-01',
    description: 'Federal blockless Directed Acyclic Graph token utilized by the U.S. Air Force Space Command and Department of Defense for mission-critical asynchronous data assurance and cross-agency micro-consensus.',
  },
];

export const FEDERAL_NODES: FederalRegisteredNode[] = [
  {
    id: 'FED-NODE-01',
    name: 'Washington D.C. XRPL dUNL Federal Node',
    operator: 'Federal Reserve Financial Services Interconnect',
    regulatoryCharter: 'OCC Interpretive Letter 1179 & FinCEN MSB',
    jurisdiction: 'United States Federal Jurisdiction (District of Columbia)',
    validatorPublicKey: 'nHU4x849Q9K8J6P2ZtF7V1B0M5N9S3D2A1C4E7G9K2X5',
    protocol: 'XRPL dUNL',
    status: 'SYNCHRONIZED',
    latencyMs: 11.4,
    consensusVoteWeightPct: 4.8,
    uptimePct: 99.999,
    settled24hUsd: 148200000,
    physicalLocation: 'Equinix DC11 (Ashburn, VA)',
    ipMasked: '198.51.100.***',
    latitude: 38.9072,
    longitude: -77.0369,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-NODE-02',
    name: 'New York FedNow / TSL Real-Time Gateway',
    operator: 'Treasury Sovereign Ledger Inter-Bank Exchange',
    regulatoryCharter: 'FedNow Service Operating Circular No. 8',
    jurisdiction: 'State of New York / Federal Reserve Bank of NY',
    validatorPublicKey: 'nHB7x192M4K8P3Q5ZtA1V0B2N8S9D4C3E2G1K5X7R9T4',
    protocol: 'FedNow Interconnect',
    status: 'CLEARING',
    latencyMs: 9.8,
    consensusVoteWeightPct: 5.2,
    uptimePct: 99.998,
    settled24hUsd: 312500000,
    physicalLocation: '33 Liberty St (New York, NY)',
    ipMasked: '199.168.20.***',
    latitude: 40.7128,
    longitude: -74.006,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-NODE-03',
    name: 'Circle CCTP Federal Attestation Validator',
    operator: 'Circle Internet Financial LLC',
    regulatoryCharter: 'FinCEN MSB #31000159494326',
    jurisdiction: 'Commonwealth of Massachusetts',
    validatorPublicKey: 'nHC9x412Z8P1Q6K3RtM7V0B5N2S4D8C1E9G3K8X2R6T1',
    protocol: 'Circle CCTP',
    status: 'ATTESTING',
    latencyMs: 14.5,
    consensusVoteWeightPct: 3.9,
    uptimePct: 99.995,
    settled24hUsd: 89400000,
    physicalLocation: 'CoreSite BO1 (Boston, MA)',
    ipMasked: '203.0.113.***',
    latitude: 42.3601,
    longitude: -71.0589,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-NODE-04',
    name: 'DTCC Composite Digital Asset Clearing Node',
    operator: 'Depository Trust & Clearing Corporation',
    regulatoryCharter: 'SEC Covered Clearing Agency / FRB Systemic Utility',
    jurisdiction: 'Federal Title VIII Financial Market Utility',
    validatorPublicKey: 'nHD2x719M3K5P8Q2ZtB9V4B1N6S3D7C5E1G8K4X9R2T7',
    protocol: 'DTCC Composite',
    status: 'SYNCHRONIZED',
    latencyMs: 12.2,
    consensusVoteWeightPct: 6.4,
    uptimePct: 99.999,
    settled24hUsd: 485000000,
    physicalLocation: '55 Water St (New York, NY)',
    ipMasked: '192.0.2.***',
    latitude: 40.7042,
    longitude: -74.009,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-NODE-05',
    name: 'Paxos Trust Custody & Settlement Node',
    operator: 'Paxos National Trust Bank',
    regulatoryCharter: 'OCC Conditional Approval No. 2021-04',
    jurisdiction: 'Federal OCC & NYDFS Banking Department',
    validatorPublicKey: 'nHE5x912P4K1Q7M8ZtA3V2B9N1S8D4C6E5G2K1X3R8T9',
    protocol: 'TSL Anchor',
    status: 'SYNCHRONIZED',
    latencyMs: 15.1,
    consensusVoteWeightPct: 3.5,
    uptimePct: 99.997,
    settled24hUsd: 64200000,
    physicalLocation: 'Jersey City Data Center (NJ)',
    ipMasked: '198.18.0.***',
    latitude: 40.7178,
    longitude: -74.0431,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-NODE-06',
    name: 'London Bank of England / TSL Gateway',
    operator: 'UK Financial Conduct Authority / TSL Concord',
    regulatoryCharter: 'UK FSMA Digital Securities Sandbox & OCC Bridge',
    jurisdiction: 'United Kingdom / Crown Dependencies',
    validatorPublicKey: 'nHF8x314K7P2Q9M1ZtA5V8B3N4S2D6C8E7G1K9X4R2T5',
    protocol: 'TSL Anchor',
    status: 'SYNCHRONIZED',
    latencyMs: 28.4,
    consensusVoteWeightPct: 4.2,
    uptimePct: 99.998,
    settled24hUsd: 210000000,
    physicalLocation: 'City of London Financial District (UK)',
    ipMasked: '195.12.50.***',
    latitude: 51.5074,
    longitude: -0.1278,
    regionCode: 'EU-WEST',
  },
  {
    id: 'FED-NODE-07',
    name: 'Zurich Swiss FINMA / Interconnect',
    operator: 'Swiss Federal Banking Digital Interconnect',
    regulatoryCharter: 'FINMA DLT Act Federal Banking License',
    jurisdiction: 'Swiss Confederation (Canton of Zurich)',
    validatorPublicKey: 'nHG1x982M5K3P1Q7ZtB2V6B8N9S4D1C5E3G7K2X8R6T3',
    protocol: 'DTCC Composite',
    status: 'SYNCHRONIZED',
    latencyMs: 31.2,
    consensusVoteWeightPct: 3.8,
    uptimePct: 99.996,
    settled24hUsd: 175500000,
    physicalLocation: 'SIX Swiss Exchange Data Center (Zurich)',
    ipMasked: '193.134.25.***',
    latitude: 47.3769,
    longitude: 8.5417,
    regionCode: 'EU-CENTRAL',
  },
  {
    id: 'FED-NODE-08',
    name: 'Singapore MAS Institutional Hub',
    operator: 'Monetary Authority of Singapore / XRPL Asia Hub',
    regulatoryCharter: 'MAS Payment Services Act Major Payment Institution',
    jurisdiction: 'Republic of Singapore',
    validatorPublicKey: 'nHH4x621P8K9Q4M3ZtA7V1B5N2S8D3C9E4G6K1X7R5T2',
    protocol: 'XRPL dUNL',
    status: 'SYNCHRONIZED',
    latencyMs: 42.0,
    consensusVoteWeightPct: 5.6,
    uptimePct: 99.999,
    settled24hUsd: 340000000,
    physicalLocation: 'Marina Bay Financial Centre (Singapore)',
    ipMasked: '202.161.40.***',
    latitude: 1.3521,
    longitude: 103.8198,
    regionCode: 'APAC-SE',
  },
  {
    id: 'FED-NODE-09',
    name: 'Tokyo FSA Digital Settlement Gateway',
    operator: 'Japan Financial Services Agency Inter-Bank Net',
    regulatoryCharter: 'Japan PSA / FSA Crypto-Asset Exchange Service',
    jurisdiction: 'Japan (Kanto / Tokyo)',
    validatorPublicKey: 'nHJ7x245M1K4P6Q8ZtB3V9B2N6S1D5C2E8G4K9X3R7T6',
    protocol: 'Circle CCTP',
    status: 'ATTESTING',
    latencyMs: 48.6,
    consensusVoteWeightPct: 4.1,
    uptimePct: 99.997,
    settled24hUsd: 195000000,
    physicalLocation: 'Otemachi Financial Center (Chiyoda-ku, Tokyo)',
    ipMasked: '210.140.10.***',
    latitude: 35.6762,
    longitude: 139.6503,
    regionCode: 'APAC-EAST',
  },
  {
    id: 'FED-NODE-10',
    name: 'San Francisco OCC Tech Corridor Hub',
    operator: 'Pacific Western Federal Clearing Consortium',
    regulatoryCharter: 'OCC Interpretive Letter 1176 & California DFPI',
    jurisdiction: 'State of California / Federal Reserve Bank of SF',
    validatorPublicKey: 'nHK2x583P9K1Q2M5ZtA8V4B7N3S6D9C1E5G3K8X4R1T8',
    protocol: 'FedNow Interconnect',
    status: 'CLEARING',
    latencyMs: 16.8,
    consensusVoteWeightPct: 4.5,
    uptimePct: 99.998,
    settled24hUsd: 228000000,
    physicalLocation: 'Equinix SV1 (San Jose / SF, CA)',
    ipMasked: '198.51.200.***',
    latitude: 37.7749,
    longitude: -122.4194,
    regionCode: 'US-WEST',
  },
  {
    id: 'FED-DAG-NODE-01',
    name: 'Pentagon DoD Federal DAG Full Node',
    operator: 'DoD Space Systems Command & Federal Data Assurance',
    regulatoryCharter: 'DoD Phase II SBIR FA8649-21-P-0857 / NIST SP 800-53',
    jurisdiction: 'United States Department of Defense Federal Enclave',
    validatorPublicKey: 'DAG-PUB-01-9F8C2A7B5E3D1C4A6F9E2B8D0A7C5E3F1B4D6',
    protocol: 'Federal Asynchronous DAG',
    status: 'SYNCHRONIZED',
    latencyMs: 4.8,
    consensusVoteWeightPct: 8.5,
    uptimePct: 99.9999,
    settled24hUsd: 740000000,
    physicalLocation: 'The Pentagon Enclave (Arlington, VA)',
    ipMasked: '214.0.12.***',
    latitude: 38.8719,
    longitude: -77.0563,
    regionCode: 'US-EAST',
  },
  {
    id: 'FED-DAG-NODE-02',
    name: 'NORAD Cheyenne Mountain DAG Sentinel Full Node',
    operator: 'North American Aerospace Defense Command (NORAD) Data Mesh',
    regulatoryCharter: 'US Strategic Command / Federal PPD-21 Critical Infra',
    jurisdiction: 'USSTRATCOM Nuclear & Aerospace Defense Command',
    validatorPublicKey: 'DAG-PUB-02-3B1E4A9C7F5D2B8A0E6C4F1A9D7B5E2C8F0A3',
    protocol: 'Federal Asynchronous DAG',
    status: 'SYNCHRONIZED',
    latencyMs: 5.9,
    consensusVoteWeightPct: 8.2,
    uptimePct: 99.9999,
    settled24hUsd: 620000000,
    physicalLocation: 'Cheyenne Mountain Complex (Colorado Springs, CO)',
    ipMasked: '214.18.44.***',
    latitude: 38.7442,
    longitude: -104.8458,
    regionCode: 'US-WEST',
  },
];

export const INITIAL_DAG_TELEMETRY: DagFullNodeTelemetry = {
  nodeId: 'FED-DAG-NODE-01',
  nodeName: 'Pentagon DoD Federal DAG Full Node',
  epochHeight: 1489204,
  dagVerticesCount: 28419200,
  activeStateChannels: 128,
  mempoolTps: 84500,
  snapshotFinalityMs: 42.5,
  peerCount: 164,
  cpuLoadPct: 24.8,
  ramUsageGb: 198.4,
  ramTotalGb: 512.0,
  nvmeStorageUsedTb: 8.42,
  nvmeStorageTotalTb: 32.0,
  lastSnapshotHash: '0x8f2d4e9c1a7b3e5f0d8a2c4e6b9d1f3a5c7e9b2d4f6a8c0e2b4d6f8a',
  securityIntegrityLevel: 'NIST_SP_800_53_LEVEL_4',
};

export const INITIAL_FEDERAL_SETTLEMENTS: FederalSettlementRecord[] = [
  {
    txId: 'FED-TX-984021',
    tokenSymbol: 'RLUSD',
    amount: 1500000,
    amountUsd: 1500000,
    sourceNode: 'FED-NODE-01',
    targetNode: 'FED-NODE-02',
    settlementTime: '2026-10-01T21:28:10Z',
    status: 'SETTLED_FINAL',
    fedAuditHash: '0x8f4c2e...91ab4e',
  },
  {
    txId: 'FED-TX-984022',
    tokenSymbol: 'BUIDL',
    amount: 500000,
    amountUsd: 500000,
    sourceNode: 'FED-NODE-04',
    targetNode: 'FED-NODE-02',
    settlementTime: '2026-10-01T21:28:44Z',
    status: 'SETTLED_FINAL',
    fedAuditHash: '0x3b194a...6109dc',
  },
  {
    txId: 'FED-TX-984023',
    tokenSymbol: 'ESC',
    amount: 25000,
    amountUsd: 250000,
    sourceNode: 'FED-NODE-02',
    targetNode: 'FED-NODE-05',
    settlementTime: '2026-10-01T21:29:15Z',
    status: 'SETTLED_FINAL',
    fedAuditHash: '0x429f7e...35a398',
  },
];
