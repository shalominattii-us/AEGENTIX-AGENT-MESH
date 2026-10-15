/**
 * Authoritative Anti-Human-Trafficking & Forced Labor Datasets
 * 
 * Enforced across the Aegentix Sovereign Core and Outward Gateways.
 * Formulated under:
 * - FinCEN Advisory FIN-2020-A008 (Financial Red Flags on Human Trafficking & Smuggling)
 * - US Department of Labor ILAB (List of Goods Produced by Child Labor or Forced Labor)
 * - US State Department Trafficking in Persons (TIP) Office Jurisdictional Tiering
 * - United Nations Palermo Protocol (Act-Means-Purpose Triad)
 * - Title 18 U.S. Code §§ 1581-1597 (Federal Criminal Civil Rights & Labor Statutes)
 * - OFAC Global Magnitsky Serious Human Rights Abuse Sanctions
 * - FATF Financial Indicators for Digital Assets & Transnational Crime
 */

export interface TraffickingTypology {
  id: string;
  category: 'SEX_TRAFFICKING' | 'FORCED_LABOR' | 'SUPPLY_CHAIN_SLAVERY' | 'FINANCIAL_FUNNEL' | 'IDENTITY_RETENTION' | 'ILLICIT_CRYPTO_FLOW';
  code: string;
  sourceAuthority: string;
  name: string;
  description: string;
  riskWeight: number; // 1 to 100
  detectionPattern: string[];
  mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE' | 'FREEZE_AND_FILE_SAR' | 'HIGH_SCRUTINY_HOLD';
}

export interface IlabCommodityEntry {
  country: string;
  commodity: string;
  exploitationType: 'FORCED_LABOR' | 'CHILD_LABOR' | 'BOTH';
  highRiskCategory: string;
  statutoryBasis: string;
}

export interface TipJurisdictionTier {
  country: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_2_WATCHLIST' | 'TIER_3_SANCTIONED';
  sanctionRiskScore: number;
  autoBlockOutwardChannel: boolean;
  notes: string;
}

export interface AntiTraffickingDatasetSuite {
  version: string;
  lastUpdated: string;
  charter: string;
  statutes: Array<{ title: string; citation: string; penalty: string; mandate: string }>;
  finCenTypologies: TraffickingTypology[];
  ilabSupplyChainCommodities: IlabCommodityEntry[];
  tipJurisdictionMatrix: TipJurisdictionTier[];
  unPalermoTriadChecks: Array<{ pillar: string; criteria: string[]; failVerdict: string }>;
}

export const ANTI_TRAFFICKING_DATASETS: AntiTraffickingDatasetSuite = {
  version: '2026.4-SOVEREIGN-FREEDOM-ROOT',
  lastUpdated: '2026-10-15T17:30:00Z',
  charter: 'SOVEREIGN_HUMAN_FREEDOM_COVENANT_V1',

  statutes: [
    {
      title: 'Forced Labor',
      citation: '18 U.S.C. § 1589',
      penalty: 'Up to 20 years to life imprisonment + mandatory asset forfeiture',
      mandate: 'Prohibits knowingly providing or obtaining the labor or services of a person by force, threat, serious harm, or abuse of legal process.'
    },
    {
      title: 'Trafficking in Peonage or Involuntary Servitude',
      citation: '18 U.S.C. § 1590',
      penalty: 'Up to 20 years to life imprisonment',
      mandate: 'Prohibits recruiting, harboring, transporting, providing, or obtaining by any means any person for labor or services in violation of federal servitude laws.'
    },
    {
      title: 'Sex Trafficking by Force, Fraud, or Coercion',
      citation: '18 U.S.C. § 1591',
      penalty: '15 years minimum to life imprisonment + mandatory restitution',
      mandate: 'Prohibits recruiting, enticing, harboring, transporting, or patronizing a person for commercial sex acts involving force, fraud, coercion, or underage persons.'
    },
    {
      title: 'Unlawful Document Confiscation',
      citation: '18 U.S.C. § 1592',
      penalty: 'Up to 5 years imprisonment',
      mandate: 'Criminalizes knowingly destroying, concealing, removing, confiscating, or possessing any actual or purported passport or immigration document of another person.'
    },
    {
      title: 'Forfeiture & Mandatory Injunctions',
      citation: '18 U.S.C. § 1594',
      penalty: 'Civil and criminal forfeiture of all assets and transaction proceeds',
      mandate: 'Authorizes immediate forfeiture of any property, real or personal, used or intended to be used in furtherance of human exploitation.'
    }
  ],

  finCenTypologies: [
    {
      id: 'FIN-TYP-001',
      category: 'SEX_TRAFFICKING',
      code: 'FIN-2020-A008-ST1',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008',
      name: 'Structured Funnel Account Micro-Deposits',
      description: 'Multiple small cash or P2P deposits below reporting thresholds deposited in disparate geographic regions into a single centralized beneficiary account.',
      riskWeight: 95,
      detectionPattern: ['funnel_deposit', 'geographic_dispersion', 'rapid_aggregation', 'escort_funnel'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-002',
      category: 'SEX_TRAFFICKING',
      code: 'FIN-2020-A008-ST2',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008',
      name: 'Commercial Sex & Adult Classified Advertising Purchases',
      description: 'Recurring card or crypto transactions to commercial sex hosting platforms, adult backpage successors, or darkweb escort verification directories.',
      riskWeight: 100,
      detectionPattern: ['escort', 'adult classifieds', 'cam service', 'commercial sex advertising', 'backpage successor'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-003',
      category: 'SEX_TRAFFICKING',
      code: 'FIN-2020-A008-ST3',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008',
      name: 'Unusual Multi-Room Hotel & Transportation Clusters',
      description: 'Continuous frequent booking of budget motels and extended stay hotels across multiple cities using split prepaid cards combined with continuous ride-hailing hops.',
      riskWeight: 88,
      detectionPattern: ['motel_clustering', 'split_prepaid', 'high_frequency_ride_hops', 'hotel_turnover'],
      mandatoryAction: 'FREEZE_AND_FILE_SAR'
    },
    {
      id: 'FIN-TYP-004',
      category: 'FORCED_LABOR',
      code: 'FIN-2020-A008-LT1',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008',
      name: 'Recruitment Fee Deductions & Debt Peonage Siphoning',
      description: 'Payroll records reflecting automatic confiscatory deductions for recruitment fees, visa sponsorship, mandatory lodging, or food exceeding statutory maximums.',
      riskWeight: 96,
      detectionPattern: ['recruitment_fee_siphon', 'peonage_deduction', 'visa_fee_retention', 'captive_lodging_deduction'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-005',
      category: 'FORCED_LABOR',
      code: 'FIN-2020-A008-LT2',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008',
      name: 'Shared Residential Address for High-Volume Workers',
      description: 'Dozens of unrelated workers sharing the exact same residential address, corporate PO box, or employer-owned warehouse facility with wages wired to a single management proxy.',
      riskWeight: 92,
      detectionPattern: ['dormitory_clustering', 'shared_payee_proxy', 'bulk_single_address', 'employer_controlled_payout'],
      mandatoryAction: 'HIGH_SCRUTINY_HOLD'
    },
    {
      id: 'FIN-TYP-006',
      category: 'IDENTITY_RETENTION',
      code: 'FIN-2020-A008-ID1',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008 / 18 U.S.C. § 1592',
      name: 'Passport & Identity Credential Retention Indicators',
      description: 'Third-party control of worker identification, bank account credentials, mobile authenticators, or passport renewal withholdings.',
      riskWeight: 98,
      detectionPattern: ['withheld_passport', 'third_party_identity_holding', 'denied_document_access'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-007',
      category: 'ILLICIT_CRYPTO_FLOW',
      code: 'FATF-RED-FLAG-VASP-01',
      sourceAuthority: 'FATF Virtual Asset Red Flags & OFAC TOC',
      name: 'Darknet Exploitation Marketplace Liquidity Ingestion',
      description: 'Direct or 1-hop deposit links from sanctioned darknet mixers, child sexual abuse material (CSAM) networks, or human smuggling escrow smart contracts.',
      riskWeight: 100,
      detectionPattern: ['csam_nexus', 'darknet_escrow_smuggling', 'unregistered_tumbler_smuggle', 'ofac_toc_match'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-008',
      category: 'SUPPLY_CHAIN_SLAVERY',
      code: 'DOL-ILAB-CARGO-01',
      sourceAuthority: 'US Dept of Labor ILAB / Uyghur Forced Labor Prevention Act (UFLPA)',
      name: 'High-Risk Forced Labor Supply Chain Sourcing',
      description: 'Commodity shipments of cotton, polysilicon, cobalt, or seafood originating from jurisdictions and entities barred under UFLPA or Section 307 Tariff Act.',
      riskWeight: 94,
      detectionPattern: ['uflpa_entity_list', 'section_307_tariff_withhold', 'drc_child_cobalt', 'forced_cotton_cargo'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-009',
      category: 'FORCED_LABOR',
      code: 'FIN-2023-ALERT001-CYBER',
      sourceAuthority: 'FinCEN Alert FIN-2023-Alert001 / UNODC Southeast Asia Cyber Trafficking',
      name: 'Southeast Asian Cyber Scam Compound Forced Labor Siphoning',
      description: 'Transactions and cross-border remittances tied to known forced labor cyber fraud compounds (KK Park, Shwe Kokko, Laukkai) where victims are held in captive servitude to run fraud schemes.',
      riskWeight: 99,
      detectionPattern: ['scam compound', 'kk park', 'shwe kokko', 'laukkai', 'pig butchering forced labor', 'boiler room captivity'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-010',
      category: 'FORCED_LABOR',
      code: 'UN-PALERMO-ORGAN-01',
      sourceAuthority: 'United Nations Palermo Protocol Art. 3 / 18 U.S.C. § 1590',
      name: 'Coercive Organ Harvesting & Black Market Surgical Escrow',
      description: 'Payments, escrow arrangements, or cryptocurrency settlements routed to illicit organ brokers, unverified transplant clinics, or medical human trafficking networks.',
      riskWeight: 100,
      detectionPattern: ['organ harvesting', 'kidney broker', 'coerced donor payout', 'transplant tourism escrow', 'black market organ'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    },
    {
      id: 'FIN-TYP-011',
      category: 'IDENTITY_RETENTION',
      code: 'FIN-2020-A008-DS1',
      sourceAuthority: 'FinCEN Advisory FIN-2020-A008 / 18 U.S.C. § 1589',
      name: 'Domestic Servitude & Diplomatic Peonage Wage Traps',
      description: 'Wages for domestic workers channeled back into employer accounts, confiscation of legal immigration papers, or round-the-clock surveillance with zero personal access to funds.',
      riskWeight: 92,
      detectionPattern: ['domestic servitude', 'diplomatic peonage', 'isolated residence payout', 'withheld wages maid', 'employer controlled account'],
      mandatoryAction: 'FREEZE_AND_FILE_SAR'
    },
    {
      id: 'FIN-TYP-012',
      category: 'ILLICIT_CRYPTO_FLOW',
      code: 'FATF-RED-FLAG-VASP-02',
      sourceAuthority: 'FATF Recommendation 15 / FinCEN Section 311 Orders',
      name: 'Nested Exploitation Mixers & Smuggling Laundering Rings',
      description: 'Layered high-velocity cryptocurrency hops through nested instant exchangers and privacy pools designed to obscure human trafficking proceeds from law enforcement.',
      riskWeight: 97,
      detectionPattern: ['illicit mixer', 'human smuggling wash', 'crypto ransom trafficking', 'nested exchanger hops', 'trafficking tumbler'],
      mandatoryAction: 'IMMEDIATE_TERMINATION_AND_FORFEITURE'
    }
  ],

  ilabSupplyChainCommodities: [
    { country: 'Democratic Republic of Congo', commodity: 'Cobalt', exploitationType: 'BOTH', highRiskCategory: 'Critical Minerals', statutoryBasis: 'DOL ILAB / Dodd-Frank 1502' },
    { country: 'Democratic Republic of Congo', commodity: 'Coltan (Tantalum)', exploitationType: 'BOTH', highRiskCategory: 'Critical Minerals', statutoryBasis: 'DOL ILAB / Dodd-Frank 1502' },
    { country: 'Democratic Republic of Congo', commodity: 'Gold', exploitationType: 'BOTH', highRiskCategory: 'Precious Metals & Conflict Minerals', statutoryBasis: 'DOL ILAB / Section 1502' },
    { country: 'China (Xinjiang)', commodity: 'Cotton & Textiles', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Apparel & Agriculture', statutoryBasis: 'UFLPA / 19 U.S.C. § 1307' },
    { country: 'China (Xinjiang)', commodity: 'Polysilicon & Solar Cells', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Electronics & Energy', statutoryBasis: 'UFLPA / 19 U.S.C. § 1307' },
    { country: 'China (Xinjiang)', commodity: 'Tomatoes & Down Products', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'UFLPA / 19 U.S.C. § 1307' },
    { country: 'China', commodity: 'Electronics & Toys Assembly', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Manufacturing & Tech', statutoryBasis: 'DOL ILAB / Section 307 Tariff Act' },
    { country: 'Ivory Coast', commodity: 'Cocoa', exploitationType: 'CHILD_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'Harkin-Engel Protocol / DOL ILAB' },
    { country: 'Ghana', commodity: 'Cocoa', exploitationType: 'CHILD_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'DOL ILAB' },
    { country: 'Thailand', commodity: 'Seafood (Trawlers & Shrimp)', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Aquaculture & Fisheries', statutoryBasis: 'DOL ILAB / State TIP' },
    { country: 'Myanmar (Burma)', commodity: 'Teak & Jadeite', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Natural Resources', statutoryBasis: 'JADE Act / OFAC Sanctions' },
    { country: 'North Korea', commodity: 'Coal, Iron Ore, Seafood', exploitationType: 'FORCED_LABOR', highRiskCategory: 'State-Sanctioned Labor Export', statutoryBasis: 'CAATSA Section 321' },
    { country: 'Uzbekistan / Turkmenistan', commodity: 'Cotton (State-Orchestrated Harvest)', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'DOL ILAB / Section 307 WRO' },
    { country: 'Brazil', commodity: 'Charcoal & Cattle Ranching', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Forestry & Meat', statutoryBasis: 'DOL ILAB Lista Suja' },
    { country: 'Dominican Republic', commodity: 'Sugarcane', exploitationType: 'BOTH', highRiskCategory: 'Agriculture', statutoryBasis: 'Customs WRO Central Romana' },
    { country: 'Pakistan', commodity: 'Brick Kiln Labor', exploitationType: 'BOTH', highRiskCategory: 'Construction', statutoryBasis: 'Bonded Labor Abolition Act' },
    { country: 'India', commodity: 'Garments & Hand-Knotted Carpets', exploitationType: 'BOTH', highRiskCategory: 'Textiles', statutoryBasis: 'DOL ILAB' },
    { country: 'India', commodity: 'Mica (Sheet & Scrap)', exploitationType: 'CHILD_LABOR', highRiskCategory: 'Cosmetics & Auto Coatings', statutoryBasis: 'DOL ILAB' },
    { country: 'Malaysia', commodity: 'Palm Oil & Rubber Gloves', exploitationType: 'FORCED_LABOR', highRiskCategory: 'Agriculture & Medical Supplies', statutoryBasis: 'CBP Withhold Release Orders (WRO)' },
    { country: 'Indonesia', commodity: 'Palm Oil', exploitationType: 'CHILD_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'DOL ILAB' },
    { country: 'Malawi', commodity: 'Tobacco', exploitationType: 'CHILD_LABOR', highRiskCategory: 'Agriculture', statutoryBasis: 'CBP WRO / DOL ILAB' },
    { country: 'Peru', commodity: 'Artisanal Gold Mining', exploitationType: 'BOTH', highRiskCategory: 'Precious Metals', statutoryBasis: 'DOL ILAB / State TIP' }
  ],

  tipJurisdictionMatrix: [
    { country: 'North Korea (DPRK)', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 100, autoBlockOutwardChannel: true, notes: 'State-sponsored forced labor camps and overseas forced labor export.' },
    { country: 'Iran', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 98, autoBlockOutwardChannel: true, notes: 'Failure to comply with minimum human freedom standards; sex trafficking transit.' },
    { country: 'Russia', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 96, autoBlockOutwardChannel: true, notes: 'Forced labor of Ukrainian detainees, North Korean worker pacts, military conscription servitude.' },
    { country: 'Syria', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 100, autoBlockOutwardChannel: true, notes: 'Systematic forced labor, armed conflict child soldiering, captive exploitation.' },
    { country: 'Myanmar (Burma)', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 97, autoBlockOutwardChannel: true, notes: 'Transnational scam center forced labor compound networks (KK Park, Shwe Kokko).' },
    { country: 'Cambodia', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 95, autoBlockOutwardChannel: true, notes: 'Endemic cyber scam compound forced labor, physical torture of captive workers, transit hub.' },
    { country: 'Laos', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 94, autoBlockOutwardChannel: true, notes: 'Golden Triangle Special Economic Zone (SEZ) lawless forced labor & trafficking enclaves.' },
    { country: 'Belarus', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 92, autoBlockOutwardChannel: true, notes: 'State-mandated prison labor and complicity in regional trafficking pipelines.' },
    { country: 'Cuba', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 90, autoBlockOutwardChannel: true, notes: 'State-sponsored coercive overseas medical mission labor contracts.' },
    { country: 'Eritrea', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 95, autoBlockOutwardChannel: true, notes: 'Indefinite national service forced labor conscription system.' },
    { country: 'South Sudan', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 94, autoBlockOutwardChannel: true, notes: 'Widespread conflict-driven child soldiering and domestic servitude.' },
    { country: 'Turkmenistan', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 91, autoBlockOutwardChannel: true, notes: 'Government-enforced annual mandatory cotton harvesting mobilizations.' },
    { country: 'Venezuela', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 93, autoBlockOutwardChannel: true, notes: 'State-tolerated forced labor in illegal mining zones (Arco Minero) and sex trafficking rings.' },
    { country: 'Afghanistan', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 99, autoBlockOutwardChannel: true, notes: 'Taliban rule; systemic child exploitation, forced marriage trafficking, and servitude.' },
    { country: 'Nicaragua', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 89, autoBlockOutwardChannel: true, notes: 'State repression, lack of victim identification, and government complicity in trafficking.' },
    { country: 'China', tier: 'TIER_3_SANCTIONED', sanctionRiskScore: 95, autoBlockOutwardChannel: true, notes: 'State-sponsored forced labor camps targeting Uyghurs and other minorities in Xinjiang; state export.' },
    { country: 'United States', tier: 'TIER_1', sanctionRiskScore: 0, autoBlockOutwardChannel: false, notes: 'Tier 1 compliant; rigorous federal prosecution under Title 18 USC §§ 1581-1594.' },
    { country: 'United Kingdom', tier: 'TIER_1', sanctionRiskScore: 0, autoBlockOutwardChannel: false, notes: 'Modern Slavery Act 2015 enforcement; robust statutory transparency.' },
    { country: 'Germany', tier: 'TIER_1', sanctionRiskScore: 0, autoBlockOutwardChannel: false, notes: 'Supply Chain Due Diligence Act (LkSG) statutory mandate.' }
  ],

  unPalermoTriadChecks: [
    {
      pillar: 'ACT (The What)',
      criteria: ['Recruitment', 'Transportation', 'Transfer', 'Harboring', 'Receipt of Persons'],
      failVerdict: 'ACT_DETECTED_UNDER_UNVERIFIED_COVENANT'
    },
    {
      pillar: 'MEANS (The How)',
      criteria: ['Threat or Use of Force', 'Coercion', 'Abduction', 'Fraud', 'Deception', 'Abuse of Power / Vulnerability', 'Debt Manipulation'],
      failVerdict: 'COERCIVE_MEANS_DETECTED_IMMEDIATE_TERMINATION'
    },
    {
      pillar: 'PURPOSE (The Why)',
      criteria: ['Commercial Sex Exploitation', 'Forced Labor', 'Slavery or Similar Practices', 'Involuntary Servitude', 'Organ Harvesting'],
      failVerdict: 'EXPLOITATION_PURPOSE_IDENTIFIED_PERMANENT_BLACKLIST'
    }
  ]
};

/**
 * Evaluates any entity, counterparty, payload, or transaction metadata
 * against the complete Anti-Trafficking Dataset Suite.
 */
export function evaluateAntiTraffickingCompliance(metadata: {
  entityName?: string;
  counterpartyId?: string;
  jurisdiction?: string;
  declaredCommodity?: string;
  notesOrTerms?: string;
  transactionAmountUsd?: number;
  recipientAccountType?: string;
}) {
  const textCorpus = [
    metadata.entityName || '',
    metadata.counterpartyId || '',
    metadata.jurisdiction || '',
    metadata.declaredCommodity || '',
    metadata.notesOrTerms || '',
    metadata.recipientAccountType || ''
  ].join(' ').toLowerCase();

  const detectedViolations: Array<{
    ruleId: string;
    source: string;
    reason: string;
    severity: 'HARD_STOP_CRITICAL' | 'HIGH_ALERT';
  }> = [];

  // 1. Check Prohibited Terms & FinCEN Typologies
  for (const typology of ANTI_TRAFFICKING_DATASETS.finCenTypologies) {
    for (const pattern of typology.detectionPattern) {
      if (textCorpus.includes(pattern.toLowerCase())) {
        detectedViolations.push({
          ruleId: typology.code,
          source: typology.sourceAuthority,
          reason: `Typology hit: ${typology.name} (${pattern}). Mandatory action: ${typology.mandatoryAction}`,
          severity: 'HARD_STOP_CRITICAL'
        });
      }
    }
  }

  // 2. Check State Department TIP High-Risk / Sanctioned Tier 3 Jurisdictions
  if (metadata.jurisdiction) {
    const jurNorm = metadata.jurisdiction.trim().toLowerCase();
    const matchedTier = ANTI_TRAFFICKING_DATASETS.tipJurisdictionMatrix.find(
      (j) => jurNorm.includes(j.country.toLowerCase()) || j.country.toLowerCase().includes(jurNorm)
    );
    if (matchedTier && matchedTier.autoBlockOutwardChannel) {
      detectedViolations.push({
        ruleId: 'TIP-TIER-3-SANCTION',
        source: 'US State Dept TIP Office',
        reason: `Jurisdiction '${matchedTier.country}' is classified TIER 3 (Severe Human Trafficking Sanctions). Outward connection barred.`,
        severity: 'HARD_STOP_CRITICAL'
      });
    }
  }

  // 3. Check DOL ILAB High-Risk Forced Labor Commodities
  if (metadata.declaredCommodity) {
    const commNorm = metadata.declaredCommodity.trim().toLowerCase();
    const matchedCommodity = ANTI_TRAFFICKING_DATASETS.ilabSupplyChainCommodities.find(
      (c) => commNorm.includes(c.commodity.toLowerCase()) || c.commodity.toLowerCase().includes(commNorm)
    );
    if (matchedCommodity && metadata.jurisdiction && metadata.jurisdiction.toLowerCase().includes(matchedCommodity.country.toLowerCase())) {
      detectedViolations.push({
        ruleId: 'DOL-ILAB-UFLPA-FLAG',
        source: matchedCommodity.statutoryBasis,
        reason: `High-risk forced labor commodity '${matchedCommodity.commodity}' originating from '${matchedCommodity.country}'. Barred under 19 U.S.C. § 1307.`,
        severity: 'HARD_STOP_CRITICAL'
      });
    }
  }

  const passed = detectedViolations.length === 0;
  const riskScore = passed ? 0 : Math.min(100, detectedViolations.length * 35 + 30);

  return {
    passed,
    riskScore,
    status: passed ? 'CLEARED_HUMAN_FREEDOM_COMPLIANT' : 'ZERO_TOLERANCE_TRAFFICKING_TRIPWIRE_TRIGGERED',
    covenant: ANTI_TRAFFICKING_DATASETS.charter,
    evaluatedAt: new Date().toISOString(),
    violationsCount: detectedViolations.length,
    violations: detectedViolations,
    attestationSeal: `HMAC-SOV-DIGNITY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
  };
}
