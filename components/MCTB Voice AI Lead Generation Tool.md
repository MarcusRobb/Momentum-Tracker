# MCTB Voice AI Lead Generation Tool

## Complete Recipe Builder Handover Document

**Version:** 2.0\
**Date:** November 13, 2025\
**Location Context:** New South Wales, Australia\
**Total Niches:** 33 (across Tiers A, B, C)\
**Total Recipes Required:** 198 prompt recipes

---

## 1\. PROJECT OVERVIEW

### 1.1 What This System Does

The MCTB Voice AI Lead Generation Tool is an intelligent outreach system that:

* Analyzes a prospect's digital footprint (website, GBP, LinkedIn, reviews)

* Identifies specific pain points and challenges in their business

* Selects the most relevant messaging "lane" based on discovered signals

* Generates hyper-personalized outreach (email, LinkedIn DM, voicenote script)

* Adapts messaging based on temporal context (when relevant to the niche)

* Creates unique, non-templated messages that feel human and researched

### 1.2 Core Architecture

```
CONTEXT PACK (Input) 
    ↓
PAIN POINT DETECTION (via Matrix)
    ↓
LANE SELECTION (based on discovered challenges)
    ↓
TEMPORAL SIGNAL CHECK (if relevant to niche)
    ↓
PROMPT RECIPE EXECUTION
    ↓
PERSONALIZED OUTREACH (Output)
```

---

## 2\. THE THREE CRITICAL DOCUMENTS

### 2.1 Pain Point Matrix CSV (`pain_point_matrix_v1_2.csv`)

**Purpose:** Maps discovered signals to lane priorities for each niche

**Structure:**

* **Rank:** Priority ranking (1-33)

* **Niche:** Service category name

* **Tier:** A, B, or C (urgency/value tier)

* **Stage 1 Signals (Discovery Phase):**

  * `S1_UrgencyPhone(U)` - Phone urgency score (0-5)

  * `S1_AfterHours(A)` - After-hours service score (0-5)

  * `S1_MissedCallImpact(M)` - Missed call impact score (0-5)

  * `S1_DirectorySpend(D)` - Directory spending score (0-5)

  * `S1_PaidTraffic(P)` - Paid traffic score (0-5)

  * `S1_LinkedInBase(L)` - LinkedIn presence score (0-5)

  * `Stage1_Score` - Weighted total (0-100)

* **Stage 2 Signals (Validation Phase):**

  * `S2_GBP_Pain(G)` - Google Business Profile pain score (0-5)

  * `S2_GBP_ReplyGap(R)` - Review reply gap score (0-5)

  * `S2_WebsiteGap(W)` - Website quality gap score (0-5)

  * `S2_HiringSignal(H)` - Hiring signal score (0-5)

  * `S2_Proof_PR(S)` - Social proof/PR score (0-5)

  * `S2_AboutHooks(B)` - About page hooks score (0-5)

  * `Stage2_Score` - Weighted total (0-100)

* **Total_Priority:** Combined priority score (0-100)

**How to Use:**

1. Look up the niche row in the CSV

2. Identify which signals score 4-5 (high priority)

3. Map high-scoring signals to their corresponding lanes

4. Use these as primary lane recommendations in recipes

**Signal → Lane Mapping:**

* **U (UrgencyPhone) → Lane 1** (Missed Call Recovery)

* **A (AfterHours) → Lane 1** (Missed Call Recovery)

* **M (MissedCallImpact) → Lane 1** (Missed Call Recovery)

* **D (DirectorySpend) → Lane 2** (Directory Waste)

* **P (PaidTraffic) → Lane 3** (Paid Traffic Waste)

* **L (LinkedInBase) → Lane 4** (LinkedIn Authority)

* **G (GBP_Pain) → Lane 5** (GBP Optimization)

* **R (GBP_ReplyGap) → Lane 5** (GBP Optimization)

* **W (WebsiteGap) → Lane 6** (Website Conversion)

* **H (HiringSignal) → Lane 7** (Hiring/Scaling)

* **S (Proof_PR) → Lane 8** (Social Proof)

* **B (AboutHooks) → Lane 9** (Brand Story)

### 2.2 Temporal Signal Matrix

**Purpose:** Defines when and how to use seasonal/temporal context

**Temporal Relevance Levels:**

* **HIGH:** Seasonal patterns directly drive demand and pain points

* **MEDIUM:** Timing influences some aspects but isn't primary driver

* **LOW:** Timing rarely matters; pain points are consistent year-round

**Key Temporal Niches (HIGH Relevance):**

* Roofing (storm season, hail damage)

* HVAC (summer heat, winter cold)

* Pest Control (seasonal pest cycles)

* Landscaping (growing seasons)

* Pool Services (summer demand)

* Gutter Cleaning (autumn leaves, pre-storm prep)

* Tree Services (storm prep, post-storm cleanup)

**When to Include Temporal Context:**

* Only if niche has MEDIUM or HIGH temporal relevance

* Only if it strengthens the pain point being addressed

* Never force seasonal references into non-temporal niches

### 2.3 Lane Definitions & Messaging Angles

**Lane 1: Missed Call Recovery**

* **Trigger:** High call volume, after-hours inquiries, emergency service model

* **Pain Point:** Every missed call = lost revenue

* **Angle:** "You're losing $X per missed call"

* **Asset:** Call tracking dashboard, missed opportunity calculator

**Lane 2: Directory Waste**

* **Trigger:** Listed on multiple directories, high directory spend

* **Pain Point:** Paying for leads that don't convert

* **Angle:** "You're spending $X/month on directories that send you tire-kickers"

* **Asset:** Directory ROI audit, cost-per-quality-lead analysis

**Lane 3: Paid Traffic Waste**

* **Trigger:** Running Google Ads, Facebook Ads, high PPC spend

* **Pain Point:** Traffic doesn't convert, high cost per acquisition

* **Angle:** "Your ads are working, but your follow-up isn't"

* **Asset:** Traffic conversion audit, follow-up gap analysis

**Lane 4: LinkedIn Authority**

* **Trigger:** Weak LinkedIn presence, no personal brand

* **Pain Point:** Invisible to commercial clients and partners

* **Angle:** "Your competitors are winning commercial work on LinkedIn"

* **Asset:** LinkedIn authority blueprint, commercial client pipeline

**Lane 5: GBP Optimization**

* **Trigger:** Low review count, unanswered reviews, incomplete GBP

* **Pain Point:** Losing local search visibility and trust

* **Angle:** "You're invisible in the 3-pack when locals search"

* **Asset:** GBP optimization checklist, review response templates

**Lane 6: Website Conversion**

* **Trigger:** Outdated website, no clear CTA, slow load times

* **Pain Point:** Traffic bounces before converting

* **Angle:** "Your website is costing you 60% of your leads"

* **Asset:** Conversion rate audit, quick-win optimization list

**Lane 7: Hiring/Scaling**

* **Trigger:** Job postings, "we're hiring" signals, growth indicators

* **Pain Point:** Can't scale without systems to handle volume

* **Angle:** "You're hiring, but your systems can't support the growth"

* **Asset:** Scale-ready systems checklist, hiring-to-revenue calculator

**Lane 8: Social Proof**

* **Trigger:** Few testimonials, no case studies, weak trust signals

* **Pain Point:** Prospects don't trust you enough to choose you

* **Angle:** "You do great work, but prospects can't see the proof"

* **Asset:** Social proof framework, testimonial collection system

**Lane 9: Brand Story**

* **Trigger:** Generic "About Us" page, no differentiation

* **Pain Point:** Commoditized in a crowded market

* **Angle:** "You're competing on price because your story isn't clear"

* **Asset:** Brand story framework, differentiation positioning

---

## 3\. CONTEXT PACK STRUCTURE

Every prompt recipe receives a standardized context pack with these variables:

```json
{
  "business_name": "string",
  "owner_name": "string",
  "niche": "string",
  "location": "string (suburb, NSW)",
  "current_season": "string (Summer/Autumn/Winter/Spring)",
  "current_month": "string",

  "website_url": "string",
  "website_quality": "string (Strong/Moderate/Weak/None)",
  "website_gaps": ["array of specific issues"],

  "gbp_url": "string",
  "gbp_review_count": "number",
  "gbp_avg_rating": "number",
  "gbp_reply_rate": "string (High/Medium/Low/None)",
  "gbp_photos_quality": "string (Professional/Mixed/Poor/None)",
  "gbp_completeness": "string (Complete/Partial/Minimal)",

  "linkedin_url": "string or null",
  "linkedin_presence": "string (Strong/Moderate/Weak/None)",
  "linkedin_activity": "string (Active/Occasional/Dormant/None)",

  "discovered_pain_points": ["array of specific challenges found"],
  "urgency_signals": ["array of urgency indicators"],
  "proof_gaps": ["array of missing trust elements"],

  "directory_presence": ["array of directories found on"],
  "paid_traffic_signals": ["array of ad platforms detected"],
  "hiring_signals": ["array of growth indicators"],

  "recent_reviews_sample": ["array of 2-3 recent review excerpts"],
  "about_page_tone": "string (Professional/Personal/Generic/Missing)",

  "temporal_context": {
    "relevant": "boolean",
    "current_pain_point": "string (if relevant)",
    "urgency_factor": "string (if relevant)"
  }
}
```

---

## 4\. HOW TO BUILD A RECIPE FOR EACH NICHE

### 4.1 Step-by-Step Process

**STEP 1: Research the Niche**

* Understand the business model (emergency vs. planned, B2C vs. B2B)

* Identify common pain points in NSW market

* Research seasonal patterns (if applicable)

* Note industry-specific terminology and challenges

**STEP 2: Consult the Pain Point Matrix CSV**

```python
# Example for Locksmiths (Rank 3)
S1_UrgencyPhone: 5 (HIGH) → Lane 1 priority
S1_AfterHours: 5 (HIGH) → Lane 1 priority
S1_MissedCallImpact: 5 (HIGH) → Lane 1 priority
S1_DirectorySpend: 5 (HIGH) → Lane 2 priority
S2_GBP_Pain: 5 (HIGH) → Lane 5 priority

# This tells us:
# - Lane 1 (Missed Call) is PRIMARY (3 high signals)
# - Lane 2 (Directory Waste) is SECONDARY (1 high signal)
# - Lane 5 (GBP) is TERTIARY (1 high signal)
# - Build recipes for ALL lanes, but prioritize these
```

**STEP 3: Check Temporal Relevance**

* Consult Temporal Signal Matrix

* If HIGH or MEDIUM: include seasonal context research

* If LOW: omit temporal context entirely

**STEP 4: Build Lane-Specific Recipes**\
For EACH of the 9 lanes, create:

1. **Lane Trigger Logic** (when to use this lane)

2. **Pain Point Messaging** (core angle)

3. **Seasonal Integration** (if relevant)

4. **Personalization Variables** (what to customize)

5. **Executable Prompt Instruction** (the actual prompt)

6. **Anti-Template Rules** (variation requirements)

**STEP 5: Create Output Format Variations**\
Each lane needs 3 format variations:

* **Email** (subject line + body)

* **LinkedIn DM** (conversational, no subject)

* **Voicenote Script** (spoken, casual, 45-60 seconds)

---

## 5\. RECIPE TEMPLATE STRUCTURE

```markdown
# [NICHE NAME] - PROMPT RECIPE LIBRARY

## NICHE OVERVIEW
- **Tier:** [A/B/C]
- **Business Model:** [Emergency/Planned/Hybrid]
- **Primary Client Type:** [Residential/Commercial/Both]
- **Temporal Relevance:** [HIGH/MEDIUM/LOW]

## PAIN POINT MATRIX ANALYSIS
[Pull from CSV - show signal scores and lane priorities]

**Primary Lanes (Score 4-5):**
- Lane X: [Name] (Signals: [list])
- Lane Y: [Name] (Signals: [list])

**Secondary Lanes (Score 2-3):**
- Lane Z: [Name] (Signals: [list])

**All Lanes Must Have Recipes:** Even if score is 0-1

## TEMPORAL CONTEXT (if relevant)
[Only include if MEDIUM or HIGH temporal relevance]

**NSW Seasonal Pain Points:**
- **Summer (Dec-Feb):** [specific challenges]
- **Autumn (Mar-May):** [specific challenges]
- **Winter (Jun-Aug):** [specific challenges]
- **Spring (Sep-Nov):** [specific challenges]

---

## LANE 1: MISSED CALL RECOVERY

### Trigger Logic
```

IF (urgency_signals contains "after hours inquiries"\
OR discovered_pain_points contains "missed calls"\
OR niche has high emergency call volume)\
THEN use Lane 1

```

### Pain Point Messaging Angle
[Specific angle for this niche in this lane]

### Seasonal Integration
[How to weave in temporal context if relevant, or "N/A" if not]

### Personalization Variables
- `{business_name}` - Company name
- `{owner_name}` - Owner's first name
- `{location}` - Suburb, NSW
- `{specific_gap}` - From discovered_pain_points array
- `{seasonal_pain}` - From temporal_context (if relevant)
- `{proof_element}` - From recent_reviews_sample

### Executable Prompt Instruction

**FORMAT: EMAIL**
```

You are writing a personalized cold email to {owner_name} at {business_name}, a {niche} business in {location}.

CONTEXT ANALYSIS:

* Discovered pain point: {specific_gap}

* Urgency signals: {urgency_signals}

* Current season: {current_season} \[if temporal_context.relevant = true\]

* Seasonal pain point: {temporal_context.current_pain_point} \[if applicable\]

YOUR TASK:\
Write a 120-150 word email that:

1. Opens with a specific observation about their business (use {specific_gap})

2. Connects this to the missed call/after-hours opportunity

3. \[If temporal: Ties in {seasonal_pain} naturally\]

4. Quantifies the cost of missed calls for their niche

5. Offers one specific, actionable insight

6. Ends with a low-pressure question

TONE: Direct, helpful, slightly urgent\
SUBJECT LINE: Create a curiosity-driven subject (6-8 words) that references their specific situation

ANTI-TEMPLATE RULES:

* Never use "I noticed" or "I came across"

* Never use "I hope this email finds you well"

* Never use "quick question" or "picking your brain"

* Vary sentence structure (no formulaic patterns)

* Use contractions naturally

* Include 1-2 niche-specific terms

* Make the opening sentence unique to their business

OUTPUT FORMAT:\
Subject: \[subject line\]

\[email body\]

```

**FORMAT: LINKEDIN DM**
```

\[Similar structure but adapted for LinkedIn's conversational style\]

```

**FORMAT: VOICENOTE SCRIPT**
```

\[Similar structure but adapted for spoken delivery, 45-60 seconds\]

```

### Anti-Template Variation Requirements
- **Opening Hooks:** Minimum 8 different opening patterns
- **Transition Phrases:** Minimum 6 different ways to connect ideas
- **CTAs:** Minimum 5 different closing questions
- **Seasonal References:** Minimum 4 different ways to mention timing (if applicable)

---

## LANE 2: DIRECTORY WASTE
[Repeat full structure above]

## LANE 3: PAID TRAFFIC WASTE
[Repeat full structure above]

## LANE 4: LINKEDIN AUTHORITY
[Repeat full structure above]

## LANE 5: GBP OPTIMIZATION
[Repeat full structure above]

## LANE 6: WEBSITE CONVERSION
[Repeat full structure above]

## LANE 7: HIRING/SCALING
[Repeat full structure above]

## LANE 8: SOCIAL PROOF
[Repeat full structure above]

## LANE 9: BRAND STORY
[Repeat full structure above]

---

## TESTING CHECKLIST
- [ ] All 9 lanes have complete recipes
- [ ] Temporal context only included if relevant
- [ ] Pain point matrix signals correctly mapped
- [ ] All personalization variables defined
- [ ] Anti-template rules are specific and enforceable
- [ ] Each lane has 3 format variations (email, LinkedIn, voicenote)
- [ ] Executable prompts are clear and actionable
- [ ] Niche-specific terminology is accurate
```

---

## 6\. THE MASTER EXECUTION PROMPT

This is the prompt that will RUN the recipes once they're built:

```
# MCTB VOICE AI - OUTREACH GENERATOR

You are an expert lead generation copywriter specializing in home services businesses in NSW, Australia.

## YOUR TASK
Generate a hyper-personalized outreach message based on the provided context pack and selected lane.

## INPUT YOU'LL RECEIVE
1. **Context Pack:** Complete business intelligence (see structure in Section 3)
2. **Selected Lane:** The messaging angle to use (1-9)
3. **Output Format:** Email, LinkedIn DM, or Voicenote Script
4. **Niche Recipe:** The specific prompt recipe for this niche + lane combination

## YOUR PROCESS

**STEP 1: ANALYZE THE CONTEXT PACK**
- Identify the strongest pain point signals
- Note any temporal context (if relevant to niche)
- Find specific, unique details about this business
- Locate proof elements (reviews, gaps, signals)

**STEP 2: LOAD THE NICHE RECIPE**
- Retrieve the recipe for: {niche} → Lane {lane_number} → {format}
- Review the trigger logic to confirm lane selection is appropriate
- Note the personalization variables required
- Review anti-template rules for this niche

**STEP 3: EXECUTE THE RECIPE**
- Follow the executable prompt instruction exactly
- Populate all personalization variables from context pack
- Apply anti-template rules to ensure uniqueness
- Integrate temporal context ONLY if recipe specifies it
- Maintain the specified tone and word count

**STEP 4: QUALITY CHECK**
Before outputting, verify:
- [ ] Message feels researched and specific (not generic)
- [ ] No template phrases from anti-template list
- [ ] Personalization variables are populated correctly
- [ ] Seasonal context (if used) feels natural, not forced
- [ ] CTA is low-pressure and relevant
- [ ] Tone matches niche and format
- [ ] Length is within specified range

**STEP 5: OUTPUT**
Provide the final message in the requested format.

## CRITICAL RULES
1. **Never invent context** - Only use data from the context pack
2. **Never use template phrases** - Follow anti-template rules strictly
3. **Never force seasonal context** - Only use if recipe specifies it
4. **Never be salesy** - Tone should be helpful and consultative
5. **Never use generic openings** - Every message must feel custom-researched
6. **Always quantify** - Use numbers, percentages, or dollar values when possible
7. **Always be specific** - Reference actual details from their business
8. **Always vary structure** - No two messages should follow the same pattern

## OUTPUT FORMAT
[Depends on format requested - email includes subject line, LinkedIn doesn't, voicenote includes timing notes]
```

---

## 7\. NICHE BUILD ORDER

### Tier A (Build First - Highest Priority)

1. Locksmiths

2. Roofing

3. Pest Control

4. Emergency Glaziers

5. Emergency Plumbing

6. HVAC

7. Electricians

### Tier B (Build Second)

1. Carpet Cleaning

2. Garage Doors

3. Fencing

4. Landscaping

5. Pool Services

6. Concrete/Paving

7. Painting

8. Bathroom Renovations

9. Kitchen Renovations

10. Flooring

11. Blinds/Shutters

### Tier C (Build Last)

1. Gutter Cleaning

2. Window Cleaning

3. Pressure Washing

4. Handyman Services

5. Rubbish Removal

6. Tree Services

7. Solar Installation

8. Security Systems

9. Antenna/TV Installation

10. Appliance Repair

11. Tiling

12. Rendering

13. Waterproofing

14. Insulation

15. Scaffolding

---

## 8\. QUALITY STANDARDS

### Each Recipe Must Include:

* ✅ Niche overview with tier and business model

* ✅ Pain point matrix analysis with signal scores

* ✅ Temporal context research (if relevant)

* ✅ All 9 lanes with complete recipes

* ✅ Trigger logic for each lane

* ✅ Pain point messaging angle for each lane

* ✅ Personalization variables defined

* ✅ Executable prompt instructions for each format (email, LinkedIn, voicenote)

* ✅ Anti-template rules with minimum variation counts

* ✅ Testing checklist

### Each Recipe Must NOT Include:

* ❌ Example outputs (only the prompts that generate them)

* ❌ Forced seasonal context in non-temporal niches

* ❌ Generic template phrases

* ❌ Lanes marked as "not applicable" (all 9 lanes must have recipes)

* ❌ Vague personalization instructions

---

## 9\. REFERENCE MATERIALS CHECKLIST

Before building any niche recipe, ensure you have:

* \[ \] `pain_point_matrix_v1_2.csv` - For signal scores and lane priorities

* \[ \] Temporal Signal Matrix - For seasonal relevance determination

* \[ \] Lane Definitions - For messaging angles and triggers

* \[ \] Context Pack Structure - For variable definitions

* \[ \] Master Execution Prompt - For understanding how recipes will be used

* \[ \] Anti-Template Rules - For variation requirements

---

## 10\. NEXT STEPS

1. **Select a niche** from Tier A to begin

2. **Research the niche** (business model, NSW market, pain points)

3. **Consult pain_point_matrix_v1_2.csv** for signal scores

4. **Check Temporal Signal Matrix** for seasonal relevance

5. **Build the complete recipe** following the template in Section 5

6. **Test with sample context packs** (if available)

7. **Iterate based on output quality**

8. **Move to next niche**

---

## 11\. SUCCESS CRITERIA

A recipe is complete when:

* An AI agent can execute it with only a context pack as input

* It generates unique, non-templated messages every time

* It correctly applies lane selection logic

* It integrates temporal context appropriately (or omits it correctly)

* It produces messages that feel researched and specific

* It maintains consistent quality across all 3 formats

* It passes all anti-template checks

---

**Document End**

_This handover contains everything needed to build all 198 prompt recipes for the MCTB Voice AI Lead Generation Tool. Follow the structure, consult the reference materials, and maintain quality standards throughout._