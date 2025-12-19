# 🔄 FormatDisc.hr CI/CD Pipeline - Visual Diagrams

## 1. Complete 6-Stage Pipeline Flow

```mermaid
graph TD
    A["👨‍💻 Developer Push<br/>git push origin feature/xyz"] --> B["📥 GitHub Webhook<br/>Trigger workflow"]
    
    B --> C["🔨 STAGE 1: BUILD<br/>2-3 min"]
    C --> C1["✅ ESLint<br/>Code style"]
    C --> C2["✅ TypeScript<br/>Type safety"]
    C --> C3["✅ Jest<br/>Unit tests"]
    C --> C4["✅ Next.js<br/>Production build"]
    
    C1 --> C_CHECK{"All tests<br/>passed?"}
    C2 --> C_CHECK
    C3 --> C_CHECK
    C4 --> C_CHECK
    
    C_CHECK -->|NO| C_FAIL["❌ BUILD FAILED<br/>Block merge"]
    C_CHECK -->|YES| D["📦 STAGE 2: SBOM & LICENSE<br/>3-5 min"]
    
    D --> D1["✅ Syft<br/>Generate SBOM"]
    D --> D2["✅ FOSSA<br/>License check"]
    D --> D3["✅ Auto-commit<br/>SBOM to repo"]
    
    D1 --> D_CHECK{"Licenses<br/>compatible?"}
    D2 --> D_CHECK
    D3 --> D_CHECK
    
    D_CHECK -->|NO| D_FAIL["❌ LICENSE FAILED<br/>Incompatible dependency"]
    D_CHECK -->|YES| E["🔐 STAGE 3: SECURITY<br/>2-3 min"]
    
    E --> E1["✅ npm audit<br/>Dependency audit"]
    E --> E2["✅ Trivy<br/>Vulnerability scan"]
    E --> E3["✅ Upload SARIF<br/>To GitHub Security"]
    
    E1 --> E_CHECK{"No high-severity<br/>vulns?"}
    E2 --> E_CHECK
    E3 --> E_CHECK
    
    E_CHECK -->|NO| E_FAIL["❌ SECURITY FAILED<br/>Critical CVE found"]
    E_CHECK -->|YES| F["🛡️ STAGE 4: COMPLIANCE<br/>2-3 min"]
    
    F --> F1["✅ OPA Policy Engine<br/>Evaluate rules"]
    F --> F2["✅ GDPR Routes<br/>Privacy, deletion, consent"]
    F --> F3["✅ SBOM Validation<br/>Present & valid"]
    F --> F4["✅ Encryption<br/>TLS 1.3, AES-256"]
    
    F1 --> F_CHECK{"All compliance<br/>gates pass?"}
    F2 --> F_CHECK
    F3 --> F_CHECK
    F4 --> F_CHECK
    
    F_CHECK -->|NO| F_FAIL["❌ COMPLIANCE FAILED<br/>Policy violation"]
    F_CHECK -->|YES| G["⚡ STAGE 5: PERFORMANCE<br/>5-10 min"]
    
    G --> G1["✅ Lighthouse CI<br/>Web Vitals"]
    G --> G2["✅ FCP <1500ms<br/>First paint budget"]
    G --> G3["✅ LCP <2500ms<br/>Content paint budget"]
    G --> G4["✅ Score ≥80%<br/>Performance score"]
    
    G1 --> G_CHECK{"Performance<br/>budget met?"}
    G2 --> G_CHECK
    G3 --> G_CHECK
    G4 --> G_CHECK
    
    G_CHECK -->|NO| G_FAIL["❌ PERFORMANCE FAILED<br/>Regression detected"]
    G_CHECK -->|YES| H{"On main<br/>branch?"}
    
    H -->|NO| H_YES["✅ READY TO MERGE<br/>All gates passed!"]
    H -->|YES| I["🚀 STAGE 6: DEPLOY<br/>3-5 min"]
    
    I --> I1["✅ Checkout code<br/>Latest commit"]
    I --> I2["✅ Build artefacts<br/>npm run build"]
    I --> I3["✅ Deploy to Vercel<br/>--prod flag"]
    I --> I4["✅ Blue-Green Deploy<br/>Zero-downtime switch"]
    
    I1 --> I_CHECK{"Deployment<br/>successful?"}
    I2 --> I_CHECK
    I3 --> I_CHECK
    I4 --> I_CHECK
    
    I_CHECK -->|NO| I_FAIL["❌ DEPLOY FAILED<br/>Rollback triggered"]
    I_CHECK -->|YES| J["🎉 PRODUCTION LIVE<br/>Users see new version"]
    
    C_FAIL --> K["📧 Notification<br/>Developer gets error"]
    D_FAIL --> K
    E_FAIL --> K
    F_FAIL --> K
    G_FAIL --> K
    I_FAIL --> K
    
    K --> L["🔧 Developer fixes<br/>Pushes new commit"]
    L --> C
    
    H_YES --> M["📋 Ready for review<br/>Waiting for approval"]
    J --> N["✅ Mission Complete<br/>Code in production"]
    
    style A fill:#4CAF50,color:#fff
    style J fill:#2196F3,color:#fff
    style N fill:#2196F3,color:#fff
    style C_FAIL fill:#f44336,color:#fff
    style D_FAIL fill:#f44336,color:#fff
    style E_FAIL fill:#f44336,color:#fff
    style F_FAIL fill:#f44336,color:#fff
    style G_FAIL fill:#f44336,color:#fff
    style I_FAIL fill:#f44336,color:#fff
    style H_YES fill:#8BC34A,color:#fff
```

---

## 2. Parallel Execution Timeline

```mermaid
gantt
    title FormatDisc.hr CI/CD Pipeline - Parallel Execution (Total: ~20-40 min)
    dateFormat YYYY-MM-DD HH:mm
    
    section Build Jobs
    Stage 1: Build (2-3min)           :s1, 2025-12-11 00:00, 3m
    Stage 2: SBOM & License (3-5min)  :s2, after s1, 5m
    Stage 3: Security (2-3min)        :s3, after s1, 3m
    Stage 4: Compliance (2-3min)      :s4, after s2, 3m
    Stage 5: Performance (5-10min)    :s5, after s3, 10m
    Stage 6: Deploy (3-5min)          :s6, after s4 s5, 5m
    
    section Status
    All Passed ✅                     :crit, s_pass, after s6, 1m
    Any Failed ❌                     :crit, s_fail, 2025-12-11 00:00, 3m
```

---

## 3. Decision Tree (What Gets Blocked?)

```mermaid
graph TD
    A["Code Push"] --> B["START: Build Stage"]
    
    B --> C{ESLint<br/>Pass?}
    C -->|NO| BLOCK1["❌ BLOCK: Fix linting<br/>errors"]
    C -->|YES| D{TypeScript<br/>Pass?}
    
    D -->|NO| BLOCK2["❌ BLOCK: Fix type<br/>errors"]
    D -->|YES| E{Tests<br/>Pass?}
    
    E -->|NO| BLOCK3["❌ BLOCK: Fix failing<br/>tests"]
    E -->|YES| F{Next.js Build<br/>Success?}
    
    F -->|NO| BLOCK4["❌ BLOCK: Fix build<br/>errors"]
    F -->|YES| G["✅ Stage 1 Pass"]
    
    G --> H{Licenses<br/>Compatible?}
    H -->|NO| BLOCK5["❌ BLOCK: Resolve<br/>license conflict"]
    H -->|YES| I["✅ Stage 2 Pass"]
    
    I --> J{High-Severity<br/>CVE?}
    J -->|YES| BLOCK6["❌ BLOCK: Fix<br/>vulnerability"]
    J -->|NO| K["✅ Stage 3 Pass"]
    
    K --> L{OPA Policy<br/>Gates Pass?}
    L -->|NO| BLOCK7["❌ BLOCK: Compliance<br/>violation"]
    L -->|YES| M["✅ Stage 4 Pass"]
    
    M --> N{Performance<br/>Budget Met?}
    N -->|NO| BLOCK8["❌ BLOCK: Performance<br/>regression"]
    N -->|YES| O["✅ Stage 5 Pass"]
    
    O --> P{Main Branch<br/>& All Pass?}
    P -->|NO| READY["✅ READY TO MERGE"]
    P -->|YES| Q["🚀 Auto-Deploy"]
    
    Q --> R{Deployment<br/>Successful?}
    R -->|NO| BLOCK9["❌ ROLLBACK: Deploy<br/>failed"]
    R -->|YES| SUCCESS["🎉 LIVE IN<br/>PRODUCTION"]
    
    BLOCK1 --> FIX["Developer fixes<br/>and re-pushes"]
    BLOCK2 --> FIX
    BLOCK3 --> FIX
    BLOCK4 --> FIX
    BLOCK5 --> FIX
    BLOCK6 --> FIX
    BLOCK7 --> FIX
    BLOCK8 --> FIX
    BLOCK9 --> FIX
    
    FIX --> B
    
    style READY fill:#8BC34A,color:#fff
    style SUCCESS fill:#2196F3,color:#fff
    style BLOCK1 fill:#f44336,color:#fff
    style BLOCK2 fill:#f44336,color:#fff
    style BLOCK3 fill:#f44336,color:#fff
    style BLOCK4 fill:#f44336,color:#fff
    style BLOCK5 fill:#f44336,color:#fff
    style BLOCK6 fill:#f44336,color:#fff
    style BLOCK7 fill:#f44336,color:#fff
    style BLOCK8 fill:#f44336,color:#fff
    style BLOCK9 fill:#f44336,color:#fff
```

---

## 4. Stage Dependencies & Parallelization

```mermaid
graph LR
    A["Build<br/>2-3 min"] --> B["SBOM<br/>3-5 min"]
    A --> C["Security<br/>2-3 min"]
    A --> D["Performance<br/>5-10 min"]
    
    B --> E["Compliance<br/>2-3 min"]
    C --> D
    
    E --> F["Deploy<br/>3-5 min"]
    D --> F
    
    F --> G["✅ Live"]
    
    style A fill:#FF9800,color:#fff
    style B fill:#FF9800,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#FF9800,color:#fff
    style E fill:#FF9800,color:#fff
    style F fill:#4CAF50,color:#fff
    style G fill:#2196F3,color:#fff
    
    classDef parallel fill:#FFC107,color:#000
    class B,C parallel
```

---

## 5. OPA Policy Gate Rules

```mermaid
graph TD
    A["OPA Policy Engine<br/>Stage 4: Compliance"] --> B["Audit Logging<br/>Check"]
    A --> C["SBOM Presence<br/>Check"]
    A --> D["Performance<br/>Thresholds"]
    A --> E["Hardcoded Secrets<br/>Check"]
    A --> F["GDPR Routes<br/>Check"]
    A --> G["Encryption<br/>Standards"]
    
    B -->|❌ Missing| B_FAIL["lib/audit.ts not found"]
    B -->|✅ Found| B_PASS["Audit logging OK"]
    
    C -->|❌ Missing| C_FAIL["SBOM not generated"]
    C -->|✅ Present| C_PASS["SBOM valid"]
    
    D -->|❌ Exceeded| D_FAIL["FCP >1.5s or LCP >2.5s"]
    D -->|✅ OK| D_PASS["Performance OK"]
    
    E -->|❌ Found| E_FAIL["Hardcoded secrets<br/>in code"]
    E -->|✅ None| E_PASS["No secrets exposed"]
    
    F -->|❌ Missing| F_FAIL["No privacy/deletion<br/>routes"]
    F -->|✅ Present| F_PASS["GDPR compliant"]
    
    G -->|❌ Wrong| G_FAIL["Not TLS 1.3 or<br/>not AES-256"]
    G -->|✅ OK| G_PASS["Encryption OK"]
    
    B_PASS --> RESULT
    C_PASS --> RESULT
    D_PASS --> RESULT
    E_PASS --> RESULT
    F_PASS --> RESULT
    G_PASS --> RESULT
    
    B_FAIL --> BLOCK["❌ COMPLIANCE<br/>GATE FAILED"]
    C_FAIL --> BLOCK
    D_FAIL --> BLOCK
    E_FAIL --> BLOCK
    F_FAIL --> BLOCK
    G_FAIL --> BLOCK
    
    RESULT["✅ ALL GATES<br/>PASSED"]
    
    style RESULT fill:#4CAF50,color:#fff
    style BLOCK fill:#f44336,color:#fff
    style B_PASS fill:#8BC34A,color:#fff
    style C_PASS fill:#8BC34A,color:#fff
    style D_PASS fill:#8BC34A,color:#fff
    style E_PASS fill:#8BC34A,color:#fff
    style F_PASS fill:#8BC34A,color:#fff
    style G_PASS fill:#8BC34A,color:#fff
```

---

## 6. What Happens After Each Stage

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub
    participant Build as Build Job
    participant SBOM as SBOM Job
    participant Security as Security Job
    participant Compliance as Compliance Job
    participant Performance as Performance Job
    participant Deploy as Deploy Job
    
    Dev->>GitHub: git push origin feature/xyz
    GitHub->>Build: Trigger Stage 1
    
    Build->>Build: ESLint, TypeScript, Jest
    Build-->>GitHub: ✅ Pass / ❌ Fail
    
    Note over Build,SBOM: Parallel: Stages 2, 3, 5
    
    Build->>SBOM: Stage 2 Start
    Build->>Security: Stage 3 Start
    Build->>Performance: Stage 5 Start
    
    SBOM->>SBOM: Syft + FOSSA
    SBOM-->>GitHub: ✅ SBOM generated
    
    Security->>Security: Trivy + npm audit
    Security-->>GitHub: ✅ No CVEs
    
    Performance->>Performance: Lighthouse CI
    Performance-->>GitHub: ✅ Score ≥80%
    
    SBOM->>Compliance: Dependencies ready
    Compliance->>Compliance: OPA policy eval
    Compliance-->>GitHub: ✅ All gates pass
    
    Note over Compliance,Deploy: Main branch only
    
    Compliance->>Deploy: Ready for production
    Deploy->>Deploy: Build + Blue-Green
    Deploy-->>GitHub: 🚀 Live
    Deploy-->>Dev: Deployment URL
    
    Dev->>Dev: Check production
```

---

## 7. Timing Breakdown

| Stage | Min Time | Max Time | What Gets Checked | Blocker? |
|-------|----------|----------|-------------------|----------|
| **1. Build** | 2 min | 3 min | Lint, Types, Tests, Build | YES ❌ |
| **2. SBOM** | 3 min | 5 min | Dependencies, Licenses | YES ❌ |
| **3. Security** | 2 min | 3 min | npm audit, Trivy scan | YES ❌ |
| **4. Compliance** | 2 min | 3 min | OPA policy, GDPR, encryption | YES ❌ |
| **5. Performance** | 5 min | 10 min | Lighthouse, Web Vitals | YES ❌ |
| **6. Deploy** | 3 min | 5 min | Vercel blue-green | YES ❌ |
| | | | | |
| **Total (Sequential)** | 17 min | 29 min | All above | All |
| **Total (Parallel)** | 20 min | 40 min | All above | All |

**Note:** Stages 2, 3, 5 run in parallel after Stage 1 completes. Stage 4 runs after Stage 2. Stage 6 only runs after all previous stages pass AND push is to `main` branch.

---

## 8. Error Recovery Flow

```mermaid
graph TD
    A["❌ CI Fails<br/>at any stage"] --> B["GitHub Status<br/>Shows RED ❌"]
    
    B --> C["Notification<br/>sent to developer"]
    
    C --> D["Developer reads<br/>error log"]
    
    D --> E{"What failed?"}
    
    E -->|Build error| E1["npm run lint<br/>npm run typecheck<br/>npm run test:ci"]
    E -->|SBOM error| E2["Check package-lock.json<br/>Check FOSSA API key"]
    E -->|Security error| E3["npm audit fix<br/>Fix CVE"]
    E -->|Compliance error| E4["Add missing route<br/>Enable encryption<br/>Add audit logging"]
    E -->|Performance error| E5["npm run build<br/>npm run lighthouse<br/>Optimize images"]
    
    E1 --> FIX["Developer fixes<br/>locally"]
    E2 --> FIX
    E3 --> FIX
    E4 --> FIX
    E5 --> FIX
    
    FIX --> PUSH["git add . &&<br/>git commit &&<br/>git push"]
    
    PUSH --> RERUN["CI re-runs<br/>all 6 stages"]
    
    RERUN --> CHECK{"All pass<br/>now?"}
    
    CHECK -->|YES| SUCCESS["✅ Ready to merge<br/>PR gets green check"]
    CHECK -->|NO| RETRY["⚠️ Still failing<br/>Go back to FIX"]
    
    RETRY --> FIX
    
    SUCCESS --> MERGE["👨‍💼 Reviewer approves<br/>Code merges to main"]
    
    MERGE --> DEPLOY["🚀 Auto-deploy<br/>to production"]
    
    style A fill:#f44336,color:#fff
    style B fill:#f44336,color:#fff
    style SUCCESS fill:#4CAF50,color:#fff
    style DEPLOY fill:#2196F3,color:#fff
```

---

## 📋 Quick Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Passed / Working |
| ❌ | Failed / Blocked |
| 🚀 | Deploy / Production |
| ⚡ | Performance / Speed |
| 🛡️ | Security / Compliance |
| 📦 | Packaging / Build artefacts |
| 📧 | Notification / Communication |
| 🔧 | Fix / Development |
| 🎉 | Success / Complete |

---

## 🎯 How to Read These Diagrams

1. **Complete Pipeline Flow (Diagram 1)** → See the whole process from push to production
2. **Timeline (Diagram 2)** → Understand which stages run in parallel
3. **Decision Tree (Diagram 3)** → What gets blocked and why
4. **Dependencies (Diagram 4)** → Which stages depend on which
5. **OPA Gates (Diagram 5)** → Compliance rules being enforced
6. **Sequence (Diagram 6)** → Step-by-step communication between systems
7. **Timing (Diagram 7)** → How long each stage takes
8. **Recovery (Diagram 8)** → How to fix failures and re-run

---

**Use these diagrams to:**
- 📚 Train new team members
- 🎓 Explain the pipeline to stakeholders
- 🐛 Debug CI failures
- 📊 Document the process
- 🚀 Understand deployment flow

Share with your team! 🌟
