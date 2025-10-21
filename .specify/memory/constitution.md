<!--
SYNC IMPACT REPORT - Constitution v1.0.0
Created: 2025-10-20
Changes:
  - Initial constitution created for WeBond project
  - Defined 5 core principles: Trust & Safety, Social Inclusion, AI-Driven Intelligence,
    Transparent Operations, Sustainable Scalability
  - Established security, technical, and governance requirements
Templates Status:
  ✅ spec-template.md - Reviewed, aligned with constitution principles
  ✅ plan-template.md - Reviewed, aligned with constitution principles
  ✅ tasks-template.md - Reviewed, aligned with constitution principles
  ✅ checklist-template.md - Reviewed, aligned with constitution principles
Follow-up TODOs: None
-->

# WeBond Constitution

## Core Principles

### I. User Trust & Safety First (NON-NEGOTIABLE)

Every feature MUST prioritize user safety, data protection, and fraud prevention.

**Requirements:**
- All task solvers undergo identity verification before accepting tasks
- Escrow-based payment system mandatory for all transactions
- Personal data handled according to PDPO (Personal Data Privacy Ordinance) standards
- Real-time fraud detection and suspicious activity monitoring
- Transparent dispute resolution process accessible to all users

**Rationale:** Non-local residents are 55% more likely to be targeted by scams (2024 Police Data). Trust is the foundation that enables vulnerable users to seek help confidently.

### II. Social Inclusion as Core Mission

Every feature MUST foster meaningful connections and cross-cultural understanding between locals and non-locals.

**Requirements:**
- Task matching algorithms prioritize compatibility and communication quality over pure efficiency
- Features encourage mutual understanding (e.g., cultural context in task descriptions)
- Rating system evaluates both task completion AND positive interaction quality
- Platform language supports Cantonese, English, Mandarin, and common non-local languages
- Community guidelines explicitly promote respect and cultural sensitivity

**Rationale:** The platform exists to bridge social fragmentation and build lasting connections, not just transactional efficiency.

### III. AI-Driven Intelligence

AI systems MUST be transparent, explainable, and continuously improving based on user feedback.

**Requirements:**
- Matching algorithm considers location, rating, past performance, language skills, and availability
- AI recommendations include explanation of why a solver was matched (e.g., "nearby + high rating")
- Regular A/B testing and model updates based on completion rates and satisfaction scores
- Fallback to manual matching if AI confidence is low
- User control to override AI suggestions and select solvers manually

**Rationale:** AI matching is core to platform efficiency, but must remain understandable and user-controllable to maintain trust.

### IV. Transparent Operations

All platform operations—pricing, fees, ratings, and policies—MUST be clear and accessible to users.

**Requirements:**
- Commission structure clearly displayed before task posting (Bronze 30%, Silver 20%, Gold 10%)
- Payment breakdown shown: task price → platform fee → solver earnings
- All ratings and reviews publicly visible (with privacy controls for sensitive tasks)
- Terms of service written in plain language, translated into all supported languages
- Platform updates and policy changes communicated with 30-day notice period

**Rationale:** Transparency builds trust and prevents exploitation of vulnerable non-local users unfamiliar with local norms.

### V. Sustainable Scalability

Platform architecture MUST support growth from pilot (students) to city-wide adoption without compromising quality.

**Requirements:**
- Modular design: task posting, matching, payment, and rating systems independently scalable
- Database and API designed for 10,000+ concurrent users (Phase 2 target)
- Performance benchmarks: AI matching < 3 seconds, payment processing < 5 seconds
- Phased rollout strategy: validate with students before expanding to workforce and immigrants
- Cost structure maintains CAC (Customer Acquisition Cost) < 30% of LTV (Lifetime Value)

**Rationale:** WeBond targets 800,000 potential non-local users. Infrastructure must scale efficiently while maintaining service quality.

## Security & Compliance Requirements

**Regulatory Compliance:**
- Partner with HKMA-licensed payment providers (FPS, PayMe) for escrow transactions
- Implement KYC/AML (Know Your Customer / Anti-Money Laundering) light verification for task solvers
- Comply with Hong Kong Personal Data Privacy Ordinance (PDPO) for all user data
- Maintain audit logs for transactions and dispute resolution (minimum 7 years retention)

**Data Protection:**
- User personal data encrypted at rest and in transit (TLS 1.3 minimum)
- Minimal data collection principle: only gather data necessary for task matching and safety
- Users can request data export and deletion (GDPR-style rights)
- Third-party integrations (ads, analytics) must not access personal identifiable information without consent

**Fraud Prevention:**
- Automated detection for suspicious patterns (e.g., same user/device creating multiple accounts)
- Flagging system for unusual task requests or payment behavior
- Community reporting mechanism for scam attempts or misconduct
- Suspended accounts review process within 48 hours

## Technical Excellence Standards

**Code Quality:**
- All features require unit tests with minimum 80% code coverage
- Integration tests mandatory for: payment flows, AI matching, rating system, user authentication
- Code reviews required for all pull requests (minimum 1 approver)
- Documentation updated simultaneously with code changes

**Performance Targets:**
- App load time: < 2 seconds on 4G networks
- Task search/filter response: < 1 second
- AI matching recommendation: < 3 seconds
- Payment processing: < 5 seconds end-to-end
- System uptime: 99.5% monthly average

**Accessibility:**
- Mobile-first responsive design (iOS and Android)
- Web application accessible via desktop browsers
- Support for screen readers and accessibility tools
- Clear visual hierarchy and intuitive navigation for users unfamiliar with Hong Kong apps

## Governance

**Constitution Authority:**
This constitution supersedes all other development practices, guidelines, and decisions. Any feature, policy, or code change conflicting with these principles MUST be rejected or require formal constitution amendment.

**Amendment Process:**
1. Proposed amendments documented with rationale and impact analysis
2. Review by core team and stakeholder consultation (universities, NGOs, user representatives)
3. Approval requires consensus on impact to user trust, safety, and social mission
4. Migration plan required for breaking changes
5. Version increment follows semantic versioning (MAJOR.MINOR.PATCH)

**Compliance Review:**
- All feature specifications reviewed against constitution before implementation
- Pull requests include checklist confirming alignment with core principles
- Quarterly audits of AI matching fairness, security practices, and user satisfaction
- User feedback loop integrated into product roadmap decisions

**Development Guidance:**
For day-to-day development practices and agent-specific workflows, refer to `.specify/templates/agent-file-template.md` and project-specific README files. When conflicts arise, constitution principles take precedence.

**Version**: 1.0.0 | **Ratified**: 2025-10-20 | **Last Amended**: 2025-10-20
