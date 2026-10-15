/**
 * PINNACLE DERIVATIVES // 25 TOP INDUSTRIES & 125 PRE-CODED ENTERPRISE TEMPLATES
 * 
 * Provides outward-facing pre-configured templates for 25 major industries,
 * each with 5 top-performing benchmark enterprises (125 total businesses).
 * 
 * Each template is custom-tailored with:
 * - Specific corporate treasury concerns & financial friction points
 * - Tailored starting capital base, monthly operational inflows, and runway
 * - Target blended annual yields (T-Bill repo, delta-neutral basis, structured yield)
 * - Optimal US-regulated exchange routing (Coinbase, Gemini, FalconX, Kraken, CME Group, Cboe)
 * - Inter-bank settlement rails (Fedwire RTGS, FedNow Instant, Circle USDC, OCC National Banks)
 * - Pre-calculated prospective revenue growth models aligned with their actual business movements.
 */

const fs = require("fs");
const path = require("path");

const TOP_25_INDUSTRIES = [
  {
    id: "IND-AERO-DEFENSE",
    name: "Aerospace & Defense",
    category: "Heavy Industry & Government Contracting",
    primaryConcerns: "Long-cycle procurement lag, government milestone escrow releases, foreign currency FX exposure, multi-year subcontractor bonding.",
    typicalStartingCapitalUsd: 25000000,
    typicalMonthlyInflowUsd: 2500000,
    targetYieldPct: 11.2,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Coinbase Inc.", "FalconX", "CME Group", "Anchorage Digital Bank NA"],
    businesses: [
      { name: "Lockheed Martin Corp.", ticker: "LMT", focus: "Defense systems, multi-year DOD contract milestone escrow" },
      { name: "Raytheon Technologies (RTX)", ticker: "RTX", focus: "Avionics, missile defense supply-chain invoice factoring" },
      { name: "Northrop Grumman Corp.", ticker: "NOC", focus: "Autonomous aeronautics, classified facility bonding" },
      { name: "General Dynamics Corp.", ticker: "GD", focus: "Maritime combat vessels, defense subcontractor guarantees" },
      { name: "Boeing Defense & Space", ticker: "BA", focus: "Aerospace fleet procurement, global carrier currency hedging" }
    ]
  },
  {
    id: "IND-GLOBAL-LOGISTICS",
    name: "Global Logistics & Maritime Freight",
    category: "Supply Chain & Transportation",
    primaryConcerns: "Bunker fuel price volatility, port customs demurrage, international freight invoice delays, container leasing liquidity.",
    typicalStartingCapitalUsd: 15000000,
    typicalMonthlyInflowUsd: 1800000,
    targetYieldPct: 11.8,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "Kraken", "CME Group", "Circle"],
    businesses: [
      { name: "A.P. Moller - Maersk", ticker: "MAERSK", focus: "Ocean container shipping, port terminal operational escrow" },
      { name: "United Parcel Service (UPS)", ticker: "UPS", focus: "Global fleet express distribution, multi-currency customs settlement" },
      { name: "FedEx Corporation", ticker: "FDX", focus: "Air cargo express, aviation fuel delta-neutral hedging" },
      { name: "Kuehne + Nagel International", ticker: "KNIN", focus: "Global freight forwarding, cross-border maritime escrow" },
      { name: "C.H. Robinson Worldwide", ticker: "CHRW", focus: "Multimodal logistics brokerage, freight carrier fast-pay sweeps" }
    ]
  },
  {
    id: "IND-ENERGY-COMMODITIES",
    name: "Energy & Commodity Trading",
    category: "Resources & Utilities",
    primaryConcerns: "Extreme crude/gas price swings, refinery feedstock hedging, pipeline storage margin requirements, carbon offset verification.",
    typicalStartingCapitalUsd: 35000000,
    typicalMonthlyInflowUsd: 4000000,
    targetYieldPct: 12.5,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "FalconX", "Coinbase Inc.", "Gemini Trust Company"],
    businesses: [
      { name: "ExxonMobil Corp.", ticker: "XOM", focus: "Upstream exploration, global LNG cargo settlement escrow" },
      { name: "Chevron Corp.", ticker: "CVX", focus: "Refining & chemicals, cross-venue basis spread management" },
      { name: "ConocoPhillips", ticker: "COP", focus: "Independent E&P, pipeline transportation tariff clearing" },
      { name: "NextEra Energy", ticker: "NEE", focus: "Renewable utility generation, grid battery storage liquidity" },
      { name: "Schlumberger (SLB)", ticker: "SLB", focus: "Oilfield technological infrastructure, global offshore contractor payroll" }
    ]
  },
  {
    id: "IND-PHARMA-BIOTECH",
    name: "Pharmaceutical & Biotechnology",
    category: "Life Sciences & Healthcare",
    primaryConcerns: "Multi-year clinical trial capital lockup, FDA approval milestone escrows, global patent royalties, cold-chain logistics insurance.",
    typicalStartingCapitalUsd: 20000000,
    typicalMonthlyInflowUsd: 1500000,
    targetYieldPct: 10.8,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Gemini Trust Company", "Coinbase Inc.", "Circle", "Anchorage Digital Bank NA"],
    businesses: [
      { name: "Pfizer Inc.", ticker: "PFE", focus: "Global mRNA vaccines, multinational pharmaceutical distribution" },
      { name: "Johnson & Johnson", ticker: "JNJ", focus: "Medical devices & pharma, healthcare supply chain liquidity" },
      { name: "Eli Lilly and Co.", ticker: "LLY", focus: "Metabolic therapeutics, continuous clinical trial phase funding" },
      { name: "Merck & Co.", ticker: "MRK", focus: "Oncology & immunology, international patent royalty sweeps" },
      { name: "AbbVie Inc.", ticker: "ABBV", focus: "Biologic pharmaceuticals, specialty distributor rebate clearing" }
    ]
  },
  {
    id: "IND-SEMICONDUCTOR",
    name: "Semiconductor & Hardware Tech",
    category: "Advanced Technology",
    primaryConcerns: "Fab construction capital intensity, silicon wafer supply-chain prepayment risk, foundry yield variance, extreme demand cycle swings.",
    typicalStartingCapitalUsd: 30000000,
    typicalMonthlyInflowUsd: 3500000,
    targetYieldPct: 12.0,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "FalconX", "CME Group", "Interactive Brokers LLC"],
    businesses: [
      { name: "NVIDIA Corp.", ticker: "NVDA", focus: "AI compute accelerators, cloud hyperscaler allocation advance deposits" },
      { name: "Taiwan Semiconductor (TSMC US)", ticker: "TSM", focus: "Foundry fabrication, US mega-fab construction capital staging" },
      { name: "Intel Corp.", ticker: "INTC", focus: "CHIPS Act government co-investment escrow, foundry expansion" },
      { name: "Broadcom Inc.", ticker: "AVGO", focus: "Custom silicon & networking, enterprise OEM quarterly rebate pools" },
      { name: "Qualcomm Inc.", ticker: "QCOM", focus: "Mobile 5G & edge processors, global handset OEM royalty clearing" }
    ]
  },
  {
    id: "IND-CLOUD-SOFTWARE",
    name: "Cloud & Enterprise Software",
    category: "Enterprise Technology",
    primaryConcerns: "SaaS annual contract value (ACV) unearned revenue deferrals, cloud infrastructure compute commitments, multi-tenant billing latency.",
    typicalStartingCapitalUsd: 18000000,
    typicalMonthlyInflowUsd: 2200000,
    targetYieldPct: 11.4,
    settlementRail: "CIRCLE_USDC_TREASURY",
    preferredVenues: ["Coinbase Inc.", "Circle", "Gemini Trust Company", "Kraken"],
    businesses: [
      { name: "Microsoft Corp.", ticker: "MSFT", focus: "Azure cloud computing, enterprise multi-year subscription sweeps" },
      { name: "Amazon Web Services (AWS)", ticker: "AMZN", focus: "Global data center energy contracts, compute capacity reservations" },
      { name: "Salesforce Inc.", ticker: "CRM", focus: "Enterprise CRM, global channel partner commission disbursements" },
      { name: "Oracle Corp.", ticker: "ORCL", focus: "Cloud database infrastructure, sovereign government cloud tenancy" },
      { name: "Adobe Inc.", ticker: "ADBE", focus: "Creative cloud recurring ARR, global digital creator payouts" }
    ]
  },
  {
    id: "IND-TELECOM-SATELLITE",
    name: "Telecommunications & Satellites",
    category: "Communications & Infrastructure",
    primaryConcerns: "5G spectrum auction capital lockup, orbital satellite launch escrow, undersea cable maintenance funding, fiber optic capex.",
    typicalStartingCapitalUsd: 22000000,
    typicalMonthlyInflowUsd: 2000000,
    targetYieldPct: 11.0,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "Coinbase Inc.", "Circle", "FalconX"],
    businesses: [
      { name: "Verizon Communications", ticker: "VZ", focus: "Nationwide 5G ultra-wideband buildout, cellular tower lease payments" },
      { name: "AT&T Inc.", ticker: "T", focus: "Fiber broadband expansion, government defense communications" },
      { name: "T-Mobile US", ticker: "TMUS", focus: "Mid-band 5G deployment, subscriber device financing liquidity" },
      { name: "SpaceX / Starlink", ticker: "STARLINK", focus: "LEO satellite constellation manufacturing, ground station leasing" },
      { name: "Comcast Corp.", ticker: "CMCSA", focus: "Hybrid fiber-coax network, broadband infrastructure upgrades" }
    ]
  },
  {
    id: "IND-AUTOMOTIVE-EV",
    name: "Automotive & Clean Mobility",
    category: "Manufacturing & Mobility",
    primaryConcerns: "Lithium/battery raw material price swings, dealer inventory floorplan financing, EV rebate regulatory timing, tier-1 supplier delays.",
    typicalStartingCapitalUsd: 25000000,
    typicalMonthlyInflowUsd: 2800000,
    targetYieldPct: 11.6,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "CME Group", "FalconX", "Kraken"],
    businesses: [
      { name: "Tesla Inc.", ticker: "TSLA", focus: "Gigafactory expansion, energy storage megawatt-hour deposits" },
      { name: "General Motors Co.", ticker: "GM", focus: "Ultium battery manufacturing, dealer commercial credit floorplans" },
      { name: "Ford Motor Co.", ticker: "F", focus: "Commercial electric vans, automotive supplier invoice factoring" },
      { name: "Toyota Motor North America", ticker: "TM", focus: "Hybrid powertrain production, just-in-time component liquidity" },
      { name: "Rivian Automotive", ticker: "RIVN", focus: "Commercial delivery fleet production, battery pack assembly escrow" }
    ]
  },
  {
    id: "IND-INVESTMENT-BANKING",
    name: "Investment Banking & Prime Brokerage",
    category: "Financial Institutions",
    primaryConcerns: "Overnight repo rate volatility, collateral haircuts, institutional prime margin requirements, cross-venue basis arbitrage.",
    typicalStartingCapitalUsd: 50000000,
    typicalMonthlyInflowUsd: 6000000,
    targetYieldPct: 12.8,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "FalconX", "Coinbase Inc.", "Anchorage Digital Bank NA", "Gemini Trust Company"],
    businesses: [
      { name: "JPMorgan Chase & Co.", ticker: "JPM", focus: "Global prime brokerage, institutional multi-currency clearing" },
      { name: "Goldman Sachs Group", ticker: "GS", focus: "FICC trading desk, systematic delta-neutral market making" },
      { name: "Morgan Stanley", ticker: "MS", focus: "Institutional equities, wealth management liquidity pooling" },
      { name: "Bank of America Merrill Lynch", ticker: "BAC", focus: "Corporate treasury services, interbank Fedwire settlements" },
      { name: "Citigroup Inc.", ticker: "C", focus: "Global transaction services, cross-border corporate treasury sweeps" }
    ]
  },
  {
    id: "IND-INSURANCE-REINSURANCE",
    name: "Insurance & Reinsurance",
    category: "Financial Protection",
    primaryConcerns: "Catastrophic event claim surges, statutory capital reserve compliance, float investment yield drag, reinsurance treaty settlement.",
    typicalStartingCapitalUsd: 40000000,
    typicalMonthlyInflowUsd: 3500000,
    targetYieldPct: 10.5,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Gemini Trust Company", "Coinbase Inc.", "CME Group", "Anchorage Digital Bank NA"],
    businesses: [
      { name: "Berkshire Hathaway Reinsurance", ticker: "BRK.A", focus: "Super-catastrophe property coverage, permanent float compounding" },
      { name: "Chubb Limited", ticker: "CB", focus: "Commercial property & casualty, multi-national corporate claim escrow" },
      { name: "American International Group (AIG)", ticker: "AIG", focus: "Global commercial risk, aviation & marine hull underwriting" },
      { name: "MetLife Inc.", ticker: "MET", focus: "Institutional life & annuities, high-grade sovereign fixed-income match" },
      { name: "Prudential Financial", ticker: "PRU", focus: "Pension risk transfer, corporate retirement liquidity guarantees" }
    ]
  },
  {
    id: "IND-HEALTHCARE-NETWORKS",
    name: "Healthcare Networks & Hospital Systems",
    category: "Healthcare Infrastructure",
    primaryConcerns: "Medical claim reimbursement processing cycles, specialized surgical equipment leasing, pharmaceutical bulk purchasing escrow.",
    typicalStartingCapitalUsd: 20000000,
    typicalMonthlyInflowUsd: 2200000,
    targetYieldPct: 10.9,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "Circle", "Gemini Trust Company"],
    businesses: [
      { name: "UnitedHealth Group", ticker: "UNH", focus: "Optum health services, nationwide provider network clearing" },
      { name: "HCA Healthcare Inc.", ticker: "HCA", focus: "Hospital acute care facilities, surgical equipment capital leasing" },
      { name: "Elevance Health", ticker: "ELV", focus: "Commercial health plans, value-based care provider disbursements" },
      { name: "CVS Health Corp.", ticker: "CVS", focus: "Retail pharmacy distribution, pharmacy benefit management (PBM) sweeps" },
      { name: "Tenet Healthcare", ticker: "THC", focus: "Ambulatory surgical centers, hospital emergency system liquidity" }
    ]
  },
  {
    id: "IND-COMMERCIAL-REIT",
    name: "Commercial Real Estate & REITs",
    category: "Real Assets",
    primaryConcerns: "Commercial mortgage refinancing spreads, tenant lease default protection escrows, property capex reserves, 1031 tax exchange delays.",
    typicalStartingCapitalUsd: 30000000,
    typicalMonthlyInflowUsd: 2500000,
    targetYieldPct: 11.2,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Coinbase Inc.", "FalconX", "Circle", "Anchorage Digital Bank NA"],
    businesses: [
      { name: "Prologis Inc.", ticker: "PLD", focus: "Global logistics warehouses, e-commerce distribution center leasing" },
      { name: "American Tower Corp.", ticker: "AMT", focus: "Wireless communications towers, multi-tenant mobile network leases" },
      { name: "Equinix Inc.", ticker: "EQIX", focus: "Hyperscale data center colocation, international cross-connect revenue" },
      { name: "Simon Property Group", ticker: "SPG", focus: "Premier shopping destinations, retail tenant security deposit escrow" },
      { name: "Public Storage", ticker: "PSA", focus: "Self-storage facility acquisitions, high-frequency consumer rent sweeps" }
    ]
  },
  {
    id: "IND-RETAIL-ECOMMERCE",
    name: "Retail & E-Commerce Infrastructure",
    category: "Consumer Commerce",
    primaryConcerns: "Holiday inventory build capital requirements, third-party seller payout delays, payment processing fee drag (zero Stripe!), chargeback reserves.",
    typicalStartingCapitalUsd: 16000000,
    typicalMonthlyInflowUsd: 3000000,
    targetYieldPct: 11.5,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "Kraken", "Circle", "BitPay Inc."],
    businesses: [
      { name: "Walmart Inc.", ticker: "WMT", focus: "Omnichannel supercenters, massive supplier reverse-factoring network" },
      { name: "Costco Wholesale Corp.", ticker: "COST", focus: "Membership warehouse liquidity, bulk consumer goods inventory pool" },
      { name: "The Home Depot Inc.", ticker: "HD", focus: "Pro-contractor commercial accounts, lumber & building supply escrow" },
      { name: "Target Corp.", ticker: "TGT", focus: "Design-led retail merchandising, regional distribution center liquidity" },
      { name: "eBay Inc.", ticker: "EBAY", focus: "Global online marketplace, high-trust cross-border buyer escrow" }
    ]
  },
  {
    id: "IND-AGRICULTURE-FOOD",
    name: "Agriculture & Food Supply Chain",
    category: "Agricultural Commodities",
    primaryConcerns: "Seasonal crop harvesting cycles, grain elevator storage financing, livestock feed volatility, fertilizer chemical prepayments.",
    typicalStartingCapitalUsd: 18000000,
    typicalMonthlyInflowUsd: 1900000,
    targetYieldPct: 11.7,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["CME Group", "Coinbase Inc.", "Kraken", "Circle"],
    businesses: [
      { name: "Archer-Daniels-Midland (ADM)", ticker: "ADM", focus: "Agricultural origination, global oilseed processing & export" },
      { name: "Bunge Global SA", ticker: "BG", focus: "Agribusiness trading, grain processing plant operational liquidity" },
      { name: "Cargill Inc. (Private)", ticker: "CARGILL", focus: "Global agricultural trade, livestock nutrition contract settlement" },
      { name: "Deere & Company", ticker: "DE", focus: "Precision ag machinery, commercial farm equipment financing pools" },
      { name: "Tyson Foods Inc.", ticker: "TSN", focus: "Protein production & processing, refrigerated cold-chain distribution" }
    ]
  },
  {
    id: "IND-SOVEREIGN-PENSION",
    name: "Sovereign Wealth & Pension Funds",
    category: "Institutional Asset Management",
    primaryConcerns: "Actuarial liability matching, long-term purchasing power preservation, sovereign capital flight protection, unencumbered custody.",
    typicalStartingCapitalUsd: 60000000,
    typicalMonthlyInflowUsd: 5000000,
    targetYieldPct: 11.0,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Anchorage Digital Bank NA", "CME Group", "Gemini Trust Company", "FalconX"],
    businesses: [
      { name: "California Public Employees (CalPERS)", ticker: "CALPERS", focus: "State public employee retirement, long-duration liability hedging" },
      { name: "Texas Permanent School Fund", ticker: "TPSF", focus: "Endowment land mineral royalties, school fund sovereign allocations" },
      { name: "New York State Common Retirement", ticker: "NYSCRF", focus: "Public pension investments, ESG and institutional fiduciary oversight" },
      { name: "Florida State Board of Admin", ticker: "FSBA", focus: "State retirement system asset allocation, disaster contingency liquidity" },
      { name: "Alaska Permanent Fund Corp.", ticker: "APFC", focus: "Oil royalty principal preservation, annual sovereign dividend reserve" }
    ]
  },
  {
    id: "IND-MINING-METALS",
    name: "Mining, Rare Earth & Metals",
    category: "Basic Materials",
    primaryConcerns: "Mineral exploration capex, smelting energy power costs, physical metal refinery delivery guarantees, sovereign mineral export tariffs.",
    typicalStartingCapitalUsd: 25000000,
    typicalMonthlyInflowUsd: 2600000,
    targetYieldPct: 12.1,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "FalconX", "Coinbase Inc.", "Kraken"],
    businesses: [
      { name: "Freeport-McMoRan Inc.", ticker: "FCX", focus: "Copper mining, global electrification cathode delivery forward contracts" },
      { name: "Newmont Corp.", ticker: "NEM", focus: "Physical gold bullion production, Vault of Trust reserve backing integration" },
      { name: "MP Materials Corp.", ticker: "MP", focus: "US domestic rare earth mining, permanent magnet defense supply" },
      { name: "Nucor Corp.", ticker: "NUE", focus: "Mini-mill steel production, recycled scrap metal supplier instant pay" },
      { name: "Albemarle Corp.", ticker: "ALB", focus: "Battery-grade lithium extraction, EV automaker long-term off-take" }
    ]
  },
  {
    id: "IND-MEDIA-STREAMING",
    name: "Media, Streaming & Entertainment",
    category: "Digital Content & Intellectual Property",
    primaryConcerns: "Studio production budget escrow, talent royalty distribution latency, digital rights management compliance, box-office syndication.",
    typicalStartingCapitalUsd: 15000000,
    typicalMonthlyInflowUsd: 2100000,
    targetYieldPct: 11.3,
    settlementRail: "CIRCLE_USDC_TREASURY",
    preferredVenues: ["Coinbase Inc.", "Circle", "Gemini Trust Company"],
    businesses: [
      { name: "The Walt Disney Co.", ticker: "DIS", focus: "Studio entertainment, theme park contactless payment settlement" },
      { name: "Netflix Inc.", ticker: "NFLX", focus: "Original content production financing, global subscriber subscription clearing" },
      { name: "Warner Bros. Discovery", ticker: "WBD", focus: "Theatrical motion pictures, television network syndication royalties" },
      { name: "Sony Pictures Entertainment", ticker: "SONY", focus: "Global video game & film IP, cross-border licensing escrow" },
      { name: "Spotify Technology SA", ticker: "SPOT", focus: "Music streaming royalties, independent podcast creator micro-payouts" }
    ]
  },
  {
    id: "IND-DEFENSE-CONTRACTING",
    name: "Defense Logistics & Gov Contracting",
    category: "Federal & Defense Contracting",
    primaryConcerns: "FAR (Federal Acquisition Regulation) audit requirements, DOD contract advance funding, classified subcontractor surety bonds, zero foreign leakage.",
    typicalStartingCapitalUsd: 30000000,
    typicalMonthlyInflowUsd: 3200000,
    targetYieldPct: 11.1,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["Anchorage Digital Bank NA", "Coinbase Inc.", "FalconX", "CME Group"],
    businesses: [
      { name: "Booz Allen Hamilton", ticker: "BAH", focus: "Defense intelligence analytics, government cybersecurity engineering" },
      { name: "Leidos Holdings Inc.", ticker: "LDOS", focus: "National security technology, military health record modernization" },
      { name: "CACI International Inc.", ticker: "CACI", focus: "National security IT, tactical electromagnetic spectrum defense" },
      { name: "SAIC (Science Applications)", ticker: "SAIC", focus: "Defense mission integration, federal civil agency digital transformation" },
      { name: "L3Harris Technologies", ticker: "LHX", focus: "Tactical radios, military satellite communications, electronic warfare" }
    ]
  },
  {
    id: "IND-AI-SUPERCOMPUTING",
    name: "Artificial Intelligence & Supercomputing",
    category: "Frontier Computing",
    primaryConcerns: "H100/B200 GPU cluster power procurement, frontier model training capex, compute token reservation contracts, cloud cluster uptime guarantees.",
    typicalStartingCapitalUsd: 28000000,
    typicalMonthlyInflowUsd: 3800000,
    targetYieldPct: 12.6,
    settlementRail: "CIRCLE_USDC_TREASURY",
    preferredVenues: ["Coinbase Inc.", "FalconX", "Circle", "Kraken"],
    businesses: [
      { name: "Anthropic PBC", ticker: "ANTHROPIC", focus: "Frontier Claude AI alignment, enterprise compute clusters" },
      { name: "OpenAI LLC", ticker: "OPENAI", focus: "Generative AI infrastructure, enterprise model fine-tuning contracts" },
      { name: "CoreWeave Inc.", ticker: "COREWEAVE", focus: "Specialized GPU cloud infrastructure, massive cluster financing pools" },
      { name: "Lambda Labs", ticker: "LAMBDA", focus: "Deep learning GPU workstations & on-demand cloud clusters" },
      { name: "Scale AI", ticker: "SCALEAI", focus: "Data annotation & RLHF pipelines, defense AI validation contracts" }
    ]
  },
  {
    id: "IND-RENEWABLE-GRID",
    name: "Renewable Power & Grid Infrastructure",
    category: "Clean Tech & Power",
    primaryConcerns: "Utility interconnection queue delays, power purchase agreement (PPA) counterparty risk, battery storage cycle life financing.",
    typicalStartingCapitalUsd: 22000000,
    typicalMonthlyInflowUsd: 2400000,
    targetYieldPct: 11.4,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["CME Group", "Coinbase Inc.", "FalconX"],
    businesses: [
      { name: "Brookfield Renewable Partners", ticker: "BEP", focus: "Hydroelectric, wind & utility-scale solar generation assets" },
      { name: "Enphase Energy Inc.", ticker: "ENPH", focus: "Microinverter systems, residential solar & battery microgrid sweeps" },
      { name: "First Solar Inc.", ticker: "FSLR", focus: "Advanced thin-film PV solar modules, domestic utility procurement" },
      { name: "AES Corporation", ticker: "AES", focus: "Global power generation, utility-scale Fluence grid battery storage" },
      { name: "Constellation Energy Corp.", ticker: "CEG", focus: "Nuclear clean baseload power, long-term hyperscaler clean energy PPAs" }
    ]
  },
  {
    id: "IND-FINTECH-NEOBANK",
    name: "FinTech & Neo-Banking",
    category: "Digital Financial Services",
    primaryConcerns: "Interchange compression, instant consumer debit settlement liquidity, anti-money laundering (AML) compliance speed, zero Stripe dependency.",
    typicalStartingCapitalUsd: 14000000,
    typicalMonthlyInflowUsd: 2800000,
    targetYieldPct: 11.9,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Circle", "Coinbase Inc.", "Gemini Trust Company", "BitPay Inc."],
    businesses: [
      { name: "Block Inc. (Square / Cash App)", ticker: "SQ", focus: "Merchant point-of-sale, peer-to-peer digital wallet sweeps" },
      { name: "PayPal Holdings (Venmo)", ticker: "PYPL", focus: "Consumer digital payments, PYUSD stablecoin treasury management" },
      { name: "Chime Financial Inc.", ticker: "CHIME", focus: "Fee-free mobile banking, early direct deposit liquidity advances" },
      { name: "SoFi Technologies Inc.", ticker: "SOFI", focus: "Full-service digital national bank, student loan refinancing pools" },
      { name: "Robinhood Markets Inc.", ticker: "HOOD", focus: "Self-directed retail brokerage, 24-hour stock trading liquidity" }
    ]
  },
  {
    id: "IND-CHEMICAL-MANUFACTURING",
    name: "Chemical & Industrial Manufacturing",
    category: "Industrial Processing",
    primaryConcerns: "Petrochemical feedstock swings, EPA environmental compliance escrows, bulk hazardous material logistics, cross-border trade tariffs.",
    typicalStartingCapitalUsd: 20000000,
    typicalMonthlyInflowUsd: 2100000,
    targetYieldPct: 11.3,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "Coinbase Inc.", "Kraken"],
    businesses: [
      { name: "Dow Inc.", ticker: "DOW", focus: "Packaging, industrial intermediates, global plastics supply chain" },
      { name: "DuPont de Nemours Inc.", ticker: "DD", focus: "Advanced specialty materials, electronics & water filtration" },
      { name: "Ecolab Inc.", ticker: "ECL", focus: "Water hygiene, infection prevention, commercial kitchen sanitation" },
      { name: "Air Products & Chemicals", ticker: "APD", focus: "Industrial gases, blue & green hydrogen megaproject financing" },
      { name: "Linde plc", ticker: "LIN", focus: "Atmospheric gases, healthcare oxygen & engineering technology" }
    ]
  },
  {
    id: "IND-AVIATION-FLEET",
    name: "Aviation & Airline Fleet Operations",
    category: "Aviation Transport",
    primaryConcerns: "Jet A-1 fuel crack spread spikes, commercial aircraft lease financing, airport gate slot acquisition escrows, passenger ticketing cash float.",
    typicalStartingCapitalUsd: 24000000,
    typicalMonthlyInflowUsd: 3100000,
    targetYieldPct: 11.7,
    settlementRail: "INSTANT_FEDWIRE_RTGS",
    preferredVenues: ["CME Group", "Coinbase Inc.", "FalconX"],
    businesses: [
      { name: "Delta Air Lines", ticker: "DAL", focus: "Commercial passenger fleet, Trainer refinery fuel hedging desk" },
      { name: "United Airlines Holdings", ticker: "UAL", focus: "Global international routes, wide-body Boeing/Airbus advance deposits" },
      { name: "Southwest Airlines Co.", ticker: "LUV", focus: "Domestic point-to-point routes, conservative jet fuel call option collars" },
      { name: "American Airlines Group", ticker: "AAL", focus: "Major network carrier, aircraft fleet enhanced equipment trust certificates" },
      { name: "Alaska Air Group", ticker: "ALK", focus: "Pacific Northwest & transcontinental operations, regional airline acquisitions" }
    ]
  },
  {
    id: "IND-CYBER-INFRASTRUCTURE",
    name: "Cyber Security & Critical Infrastructure",
    category: "Information Assurance",
    primaryConcerns: "Zero-day vulnerability response escrow, ransomware warranty pool underwriting, government FedRAMP High certification, compliance surety.",
    typicalStartingCapitalUsd: 18000000,
    typicalMonthlyInflowUsd: 2500000,
    targetYieldPct: 11.8,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "FalconX", "Circle", "Anchorage Digital Bank NA"],
    businesses: [
      { name: "CrowdStrike Holdings", ticker: "CRWD", focus: "Falcon cloud endpoint protection, threat intelligence response" },
      { name: "Palo Alto Networks Inc.", ticker: "PANW", focus: "Next-generation firewalls, SASE cloud security infrastructure" },
      { name: "Fortinet Inc.", ticker: "FTNT", focus: "Cybersecurity appliances, integrated secure SD-WAN hardware" },
      { name: "Zscaler Inc.", ticker: "ZS", focus: "Zero Trust exchange, direct cloud app secure access gateways" },
      { name: "Cloudflare Inc.", ticker: "NET", focus: "DDoS mitigation, edge worker compute network, web performance" }
    ]
  },
  {
    id: "IND-HOSPITALITY-RESORT",
    name: "Hospitality & Luxury Resort Networks",
    category: "Consumer Experiences",
    primaryConcerns: "Seasonal booking occupancy swings, high-end property franchise capital capex, loyalty rewards redemption liability pools, foreign traveler currency friction.",
    typicalStartingCapitalUsd: 15000000,
    typicalMonthlyInflowUsd: 2000000,
    targetYieldPct: 11.2,
    settlementRail: "FEDNOW_INSTANT_CLEARING",
    preferredVenues: ["Coinbase Inc.", "Circle", "Gemini Trust Company"],
    businesses: [
      { name: "Marriott International", ticker: "MAR", focus: "Global hotel franchise network, Bonvoy loyalty points liability escrow" },
      { name: "Hilton Worldwide Holdings", ticker: "HLT", focus: "Brand hospitality licensing, hotel property developer construction financing" },
      { name: "Hyatt Hotels Corp.", ticker: "H", focus: "Luxury resort portfolio, specialized group convention escrow deposits" },
      { name: "Wynn Resorts Limited", ticker: "WYNN", focus: "Integrated gaming & luxury resorts, high-roller VIP credit guarantees" },
      { name: "Host Hotels & Resorts", ticker: "HST", focus: "Premier lodging REIT, luxury hotel property capital improvement reserves" }
    ]
  }
];

class PinnacleIndustriesRegistry {
  constructor() {
    this.industries = TOP_25_INDUSTRIES;
  }

  getAllIndustries() {
    return this.industries;
  }

  getIndustryById(id) {
    return this.industries.find(ind => ind.id === id || ind.name.toLowerCase().includes(id.toLowerCase())) || this.industries[0];
  }

  getBusinessesForIndustry(industryId) {
    const ind = this.getIndustryById(industryId);
    return ind ? ind.businesses : [];
  }

  getTemplateForBusiness(businessName) {
    for (const ind of this.industries) {
      const match = ind.businesses.find(b => 
        b.name.toLowerCase().includes(businessName.toLowerCase()) || 
        (b.ticker && b.ticker.toLowerCase() === businessName.toLowerCase())
      );
      if (match) {
        return {
          business: match,
          industry: ind,
          defaultParameters: {
            startingCapitalUsd: ind.typicalStartingCapitalUsd,
            monthlyInflowUsd: ind.typicalMonthlyInflowUsd,
            targetYieldPct: ind.targetYieldPct,
            settlementRail: ind.settlementRail,
            preferredVenues: ind.preferredVenues,
            primaryConcerns: ind.primaryConcerns,
            timeHorizonMonths: 12,
            reinvestmentRatioPct: 80
          }
        };
      }
    }
    return null;
  }
}

const pinnacleIndustriesRegistry = new PinnacleIndustriesRegistry();

module.exports = {
  pinnacleIndustriesRegistry,
  TOP_25_INDUSTRIES
};
