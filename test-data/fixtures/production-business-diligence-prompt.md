# Production Business Due Diligence — 4-Stage Prompt Chain

Source: Real-world prompt chain for evaluating India-based production businesses.
This is the most complex test prompt — a 4-stage sequential pipeline with filtering
gates, data pass-through contracts, and a 28-point deep diligence framework.

## Why This Is a Good Stress Test

- 4 explicit stages with data dependencies (not just "write 10 sections")
- Progressive candidate narrowing: 25 → 15 → 7 → 3
- Cross-stage data contracts ("DATA FOR PROMPT N")
- Different expert personas per stage (researcher → analyst → diligence lead → strategist)
- 28-point structured analysis repeated 3x (for each Top 3 candidate)
- Hard filtering gates (Production Purity Test, Exciting But Wrong)
- Mixed output formats (tables, matrices, week-by-week plans, milestone lists)
- Real founder constraints that must be preserved across all stages

## The Source Prompt

Paste the full text below as the `sourcePrompt` value when testing W0/W1.

---

**BLUF:** Splitting this master prompt into four sequential stages prevents LLM context degradation, ensures analytical rigor for the 28-point diligence, and forces hard decisions at each filtering gate. The plan below structures the workflow, followed by the optimized prompts.

### Execution Plan: Sequential Prompt Strategy

| Stage | Focus Area | Inputs Required | Core Outputs | Pass-Through Data Required |
| :---- | :---- | :---- | :---- | :---- |
| **1** | Foundation & Sourcing | Founder Context, Core Objectives, Production Purity Test | Assumption Check, Methodology, 25-Item Longlist, Purity Filter Results | Founder constraints, Top 15 surviving models, Purity definitions. |
| **2** | Scoring & Selection | Output from Stage 1 | Scoring Matrix, Top 7 Shortlist, Top 3 Recommendations, "Exciting but Wrong" List | Top 3 models, Founder constraints, Scoring data. |
| **3** | Deep Diligence & AI | Output from Stage 2 | 28-point Diligence for Top 3, AI Impact Analysis, Capital/Time Reality Checks | Top 3 Diligence data, Founder constraints. |
| **4** | Execution & Risk | Output from Stage 3 | Financing Map, State/Cluster Analysis, Entry Routes, 60-Day Validation, Resignation Trigger | Final compiled report. |

---

### Prompt 1: Foundation, Assumptions & The Longlist

Act as a principal market researcher and technical-commercial diligence lead.

**Founder Context:** Delhi NCR, India. ~30 years IT/engineering leadership. Leads 300+ member product/engineering org. Strong: turnaround execution, structured problem solving, metrics-driven governance, cross-cultural leadership, written/verbal communication, operating-model design, vendor/cost optimization. Blind spots: moves too fast, underweights soft feedback, underinvests in governance detail, overconfident about execution speed, tires of operational grind. Preferences: ethical, fairly paid, no labor-arbitrage. Prefers automation/robotics/software/AI where economically justified. No heavy personal physical work. Wants to protect personal savings. Open to deep-tech/science. Open to phased path to production control.

**Objective:** Identify best India-based businesses that physically produce, grow, formulate, assemble with real value-add, or materially transform a tangible/biological output. Must be: resilient to/improved by AI, incubatable while employed, minimize promoter capital, avoid exploitative labor, viable path to INR 3 lakh/month draw.

**Non-Negotiables:** No pure IT, SaaS, consulting, staffing, trading, distribution, or arbitrage. Must physically produce/transform. Value creation from production/process/IP control. Controlled contract manufacturing allowed only as a bridge. NCR preferred unless math dictates otherwise. Founder keeps current job initially.

**Task 1: Mandatory Assumption Check**
Explicitly validate/challenge these assumptions:
A. "I do not want IT; I want a true production business."
B. "AI can shorten domain gaps but does not eliminate tacit operating knowledge."
C. "Strong profile reduces, but doesn't eliminate, founder-capital requirements."
D. "Debt/incentives reduce equity, but subsidy timing/bank behavior matter."
E. "Some production incubates while employed; many cannot."
F. "Automation improves economics in India, but not automatically."
G. "AI accelerates R&D/QC, making science-based businesses more accessible."
H. "Phased control may beat owning production day one."
I. "Turnaround skills fit asset acquisition better than greenfield."

**Task 2: Source Discipline**
List the official Indian ministries, regulators, and schemes (e.g., MSME, CGTMSE, SIDBI, PLI) you will use as primary evaluation criteria in subsequent steps.

**Task 3: Production Purity Test & Longlist**
Generate 25 highly granular business models across sectors like Clean Energy, High-Tech Ag, Food Processing, Drones, Med-Tech, and Distressed Assets.
Apply the "Production Purity Test" (Pass only if it physically creates/transforms and controls spec/BOM/IP; Fail if it buys/resells or is a services wrapper).

**Output Format:**
1. BLUF
2. Assumption Check Results [Verified Fact] or [Opinion]
3. Source Discipline & Regulatory Framework
4. Longlist Table (25 items: Business Model | Purity Test Pass/Fail | Justification)

**Pass-Through Requirement:** Append the full "Founder Context" and the raw text of the surviving (passed) business models to the end of your response inside a code block labeled "DATA FOR PROMPT 2".

---

### Prompt 2: Scoring, Selection & The "Exciting But Wrong" List

Act as an India industrial-policy analyst and MSME credit underwriter.

**Input:** Read the attached output from Prompt 1. Extract the "Founder Context" and the surviving business models from the data block.

**Task 1: Scoring Model**
Evaluate the surviving business models using a weighted score. Dimensions must include: production purity, founder fit, part-time incubation feasibility, automation suitability, AI resilience, bankability, realistic incentive access, expected promoter equity, working-capital intensity, regulatory burden, time to breakeven, and downtime/spares risk. Explicitly state weights.

**Task 2: Shortlisting**
Rank the top 7 models based on the score.
From the top 7, select the **Top 3 Recommendations**. Be decisive.

**Task 3: Exciting but Wrong**
Identify 5 business models (from the broader market or the rejected longlist) that sound glamorous (e.g., generic drone assembly, basic solar trading) but violate the founder constraints (e.g., require full-time presence, rely on arbitrage, heavy labor). Explain exactly why they fail.

**Output Format:**
1. Scoring Weights & Methodology
2. Scoring Matrix Table (Scores for top 11 candidates)
3. Top 7 Shortlist (Brief justifications)
4. Top 3 Recommendations (Ranked)
5. Exciting but Wrong for This Founder Right Now (5 items with harsh reality checks)

**Pass-Through Requirement:** Append the "Founder Context" and the names/brief descriptions of the "Top 3 Recommendations" to the end of your response inside a code block labeled "DATA FOR PROMPT 3".

---

### Prompt 3: Deep Diligence, Capital Reality & AI Impact

Act as a technical-commercial diligence lead and operations architect.

**Input:** Read the attached output from Prompt 2. Focus exclusively on the "Top 3 Recommendations" and the "Founder Context".

**Task 1: 28-Point Diligence**
For *each* of the Top 3 options, provide a dense, metric-backed analysis covering:
1. Exact product/consumer. 2. Production purity justification. 3. Required assets. 4. Minimum viable scale. 5. Capex estimate. 6. Working-capital estimate. 7. Facility/land needs. 8. Power/water/EHS. 9. Regulatory stack. 10. Machinery sourcing. 11. Imported-spares risk. 12. Headcount model. 13. Labor absenteeism sensitivity. 14. Automation utility (real vs. overkill). 15. Mandatory key hires (e.g., QA lead, agronomist) & expected monthly cost. 16. Revenue model. 17. Margin drivers. 18. Main failure modes. 19. Early-kill risks. 20. Path to INR 3L/mo draw. 21. Estimated founder time burden (hrs/week) during incubation. 22. Operator-adjusted, debt-adjusted founder draw estimate. 23. Sensitivity check (-20% sales, +10% RM, +60 days receivable).

**Task 2: Promoter-Capital & Part-Time Reality Check**
For each Top 3 option, assign a realistic capital case (Zero, 5-50L, 50L-1Cr, 1-2Cr, >2Cr). Be blunt if undercapitalization is fatal. Classify incubation status as Green (safe while employed), Yellow (needs trusted operator), or Red (requires immediate resignation).

**Task 3: AI Feasibility Gain**
Detail how AI materially changes the feasibility of these specific science/production businesses (e.g., accelerating QA, documentation, process control) vs. what it does *not* solve (tacit floor knowledge).

**Output Format:**
1. Detailed Business Plan: Option 1
2. Detailed Business Plan: Option 2
3. Detailed Business Plan: Option 3
4. Capital & Incubation Reality Check Matrix
5. AI Feasibility Analysis

**Pass-Through Requirement:** Append the "Top 3 Recommendations" and their respective "Capital/Incubation Reality Check" statuses to the end of your response inside a code block labeled "DATA FOR PROMPT 4".

---

### Prompt 4: Financing, Clusters, Validation & Resignation

Act as a founder-fit evaluator and commercial strategist.

**Input:** Read the attached output from Prompt 3. Focus on the Top 3 Recommendations.

**Task 1: Financing & Scheme Map**
For each Top 3 option, map usable schemes (e.g., CGTMSE, PMFME, specific state PLIs). Separate theoretical support from practical bankability. Define the required bridge capital.

**Task 2: State/Cluster & Entry Route Analysis**
Compare the 3 best clusters (default to NCR unless economically inferior) for logistics, power, talent, and incentives. Compare entry routes: greenfield vs. distressed turnaround vs. contract-first. State the definitive best path for each option.

**Task 3: 60-Day Validation Plan**
Create a strict, low-spend, week-by-week validation plan for each option. Include buyer interviews, toll runs, working-capital stress tests. Define the exact evidence required to proceed, and the evidence that triggers a hard kill.

**Task 4: Resignation Trigger**
Define the exact operational, financial, and regulatory milestones that *must* be achieved before the founder resigns from their current job.

**Output Format:**
1. Financing and Scheme Map (Practical vs. Theoretical)
2. State/Cluster Comparison
3. Entry-Route Strategy
4. 60-Day Validation Plan (Week-by-week matrix)
5. Resignation Trigger Milestones
6. Primary Unmitigated Risk (Final conclusion)
