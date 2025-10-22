// Utility Functions
function showLoading(resultBox) {
    resultBox.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>AI Processing...</p></div>';
    resultBox.className = 'result-box show';
}

function showError(resultBox, message) {
    resultBox.innerHTML = `<h4><i class="fas fa-exclamation-circle"></i> Error</h4><p>${message}</p>`;
    resultBox.className = 'result-box show error';
}

function generateCaseId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `WB${timestamp}${random}`;
}

// Demo 1: Smart Matching Engine
function runSmartMatching() {
    const taskDesc = document.getElementById('taskDesc').value;
    const location = document.getElementById('taskLocation').value;
    const resultBox = document.getElementById('matchingResult');

    if (!taskDesc.trim()) {
        showError(resultBox, 'Please enter a task description');
        return;
    }

    showLoading(resultBox);

    setTimeout(() => {
        const matches = generateSmartMatches(taskDesc, location);
        resultBox.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: var(--success);"></i> Top 3 Recommended Solvers</h4>
            ${matches.map(match => `
                <div class="match-card">
                    <h5>${match.name} - ${match.matchScore}% Match</h5>
                    <p>${match.bio}</p>
                    <div class="stats">
                        <span><i class="fas fa-star" style="color: #fbbf24;"></i> ${match.rating}</span>
                        <span><i class="fas fa-check"></i> ${match.completed} tasks</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${match.distance}</span>
                        <span><i class="fas fa-language"></i> ${match.languages}</span>
                    </div>
                </div>
            `).join('')}
            <p style="margin-top: 1rem;"><strong>Matching Factors:</strong> Location proximity (30%), Rating (30%), Relevant experience (25%), Language match (15%)</p>
        `;
        resultBox.classList.add('show');
    }, 1500);
}

function generateSmartMatches(taskDesc, location) {
    const isVisaTask = taskDesc.toLowerCase().includes('visa');
    const isAcademicTask = taskDesc.toLowerCase().includes('assignment') || taskDesc.toLowerCase().includes('homework') || taskDesc.toLowerCase().includes('tutor');
    const isCantonese = taskDesc.toLowerCase().includes('cantonese');

    if (isVisaTask) {
        return [
            {
                name: 'David Wong',
                matchScore: 95,
                bio: 'Experienced in visa applications with 3 years helping international students. Fluent in Cantonese, English, and Mandarin.',
                rating: '4.9/5.0',
                completed: 47,
                distance: '0.8 km',
                languages: 'Cantonese, English'
            },
            {
                name: 'Sarah Chen',
                matchScore: 88,
                bio: 'Former immigration consultant assistant. Helped 30+ students with work visa and IANG applications.',
                rating: '4.8/5.0',
                completed: 32,
                distance: '1.2 km',
                languages: 'Cantonese, Mandarin'
            },
            {
                name: 'Michael Tam',
                matchScore: 82,
                bio: 'Local student familiar with Immigration Department procedures. Patient and detail-oriented.',
                rating: '4.7/5.0',
                completed: 25,
                distance: '2.1 km',
                languages: 'Cantonese, English'
            }
        ];
    }

    if (isAcademicTask) {
        return [
            {
                name: 'Professor Emily Liu',
                matchScore: 93,
                bio: 'PhD student specializing in academic tutoring. Expert in essay writing, research methodology, and exam prep.',
                rating: '4.9/5.0',
                completed: 56,
                distance: '1.0 km',
                languages: 'English, Mandarin'
            },
            {
                name: 'Kevin Zhang',
                matchScore: 87,
                bio: 'Honors student with 4.0 GPA. Tutored 40+ students in various subjects including math, science, and business.',
                rating: '4.8/5.0',
                completed: 42,
                distance: '1.5 km',
                languages: 'English, Mandarin'
            },
            {
                name: 'Jessica Leung',
                matchScore: 81,
                bio: 'Bilingual tutor with experience helping international students adapt to HK university style.',
                rating: '4.7/5.0',
                completed: 34,
                distance: '2.3 km',
                languages: 'Cantonese, English'
            }
        ];
    }

    return [
        {
            name: 'Emily Liu',
            matchScore: 91,
            bio: 'Multilingual student helper with experience in various administrative tasks.',
            rating: '4.8/5.0',
            completed: 38,
            distance: '1.5 km',
            languages: 'English, Mandarin'
        },
        {
            name: 'Jason Lee',
            matchScore: 85,
            bio: 'Friendly local with extensive knowledge of Hong Kong services and procedures.',
            rating: '4.7/5.0',
            completed: 29,
            distance: '2.0 km',
            languages: 'Cantonese, English'
        },
        {
            name: 'Amy Ng',
            matchScore: 80,
            bio: 'Patient helper who enjoys assisting international students adapt to HK life.',
            rating: '4.6/5.0',
            completed: 22,
            distance: '2.8 km',
            languages: 'Cantonese, English'
        }
    ];
}

// Demo 2: Fraud Detection
function runFraudDetection() {
    const taskDesc = document.getElementById('fraudTaskDesc').value;
    const resultBox = document.getElementById('fraudResult');

    if (!taskDesc.trim()) {
        showError(resultBox, 'Please enter task content to analyze');
        return;
    }

    showLoading(resultBox);

    setTimeout(() => {
        const analysis = analyzeFraud(taskDesc);
        
        // Set appropriate class based on risk level
        let boxClass = 'result-box show';
        if (analysis.risk === 'critical' || analysis.risk === 'high') {
            boxClass += ' error';
        } else if (analysis.risk === 'medium') {
            boxClass += ' warning';
        }
        resultBox.className = boxClass;
        
        // For critical violations, show special formatting
        if (analysis.risk === 'critical') {
            resultBox.innerHTML = `
                <h4 style="color: #dc2626;"><i class="fas ${analysis.icon}"></i> ${analysis.message}</h4>
                <p><span class="risk-badge risk-${analysis.risk}">Risk Level: ${analysis.risk.toUpperCase()}</span></p>
                <p><strong>Detected Violations:</strong></p>
                <ul class="suggestion-list">
                    ${analysis.patterns.map(p => `<li style="color: #991b1b;">${p}</li>`).join('')}
                </ul>
                ${analysis.recommendation}
            `;
        } else {
            resultBox.innerHTML = `
                <h4><i class="fas ${analysis.icon}"></i> Risk Analysis Complete</h4>
                <p><span class="risk-badge risk-${analysis.risk}">Risk Level: ${analysis.risk.toUpperCase()}</span></p>
                <p><strong>Analysis:</strong> ${analysis.message}</p>
                <p><strong>Detected Patterns:</strong></p>
                <ul class="suggestion-list">
                    ${analysis.patterns.map(p => `<li>${p}</li>`).join('')}
                </ul>
                <p><strong>Recommendation:</strong> ${analysis.recommendation}</p>
            `;
        }
    }, 1500);
}

function analyzeFraud(taskDesc) {
    const lowerDesc = taskDesc.toLowerCase();
    
    // CRITICAL: Illegal Activities - Gambling, Sex, Drugs
    const gamblingKeywords = ['gambl', 'casino', 'bet', 'poker', 'lottery', 'slot machine', 'baccarat', 'blackjack', 'roulette', '赌', '博彩', '投注'];
    const sexKeywords = ['prostitut', 'escort', 'sex service', 'massage service', 'adult service', 'companionship for money', 'sugar', '性服务', '援交', '色情'];
    const drugKeywords = ['drug', 'cocaine', 'heroin', 'marijuana', 'weed', 'cannabis', 'ecstasy', 'mdma', 'meth', 'pills', 'prescription drug', '毒品', '大麻', '可卡因'];
    
    let detectedIllegal = [];
    
    // Check for gambling
    if (gamblingKeywords.some(keyword => lowerDesc.includes(keyword))) {
        detectedIllegal.push('Gambling-related activity');
    }
    
    // Check for sex services
    if (sexKeywords.some(keyword => lowerDesc.includes(keyword))) {
        detectedIllegal.push('Sexual services or prostitution');
    }
    
    // Check for drugs
    if (drugKeywords.some(keyword => lowerDesc.includes(keyword))) {
        detectedIllegal.push('Drug-related activity');
    }
    
    // If ANY illegal content detected - CRITICAL ALERT
    if (detectedIllegal.length > 0) {
        return {
            risk: 'critical',
            icon: 'fa-ban',
            message: '🚨 CRITICAL VIOLATION DETECTED - ILLEGAL CONTENT',
            patterns: [
                `Detected: ${detectedIllegal.join(', ')}`,
                'This content violates Hong Kong laws and WeBond Terms of Service',
                'Prohibited activities: Gambling, drug trafficking, sexual services',
                'All platform communications are monitored and recorded'
            ],
            recommendation: `
                <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <h4 style="color: #dc2626; margin-bottom: 0.5rem;">⚠️ SEVERE WARNING - BOTH PARTIES NOTIFIED</h4>
                    <p style="color: #991b1b; font-weight: 600; margin-bottom: 0.5rem;">
                        This task contains content related to illegal activities prohibited by Hong Kong law.
                    </p>
                    <p style="color: #991b1b; margin-bottom: 0.5rem;">
                        <strong>Immediate Actions Taken:</strong>
                    </p>
                    <ul style="color: #991b1b; margin: 0.5rem 0; padding-left: 1.5rem;">
                        <li>❌ Task automatically REJECTED and BLOCKED</li>
                        <li>📸 Content saved as evidence (Case ID: #${generateCaseId()})</li>
                        <li>⚠️ Both parties' accounts flagged for review</li>
                        <li>👮 Content forwarded to platform security team</li>
                        <li>🚫 Repeat violations will result in permanent ban + legal reporting</li>
                    </ul>
                    <p style="color: #991b1b; font-weight: 700; margin-top: 0.5rem;">
                        IF YOU PROCEED WITH THIS ACTIVITY:<br>
                        • Your account will be PERMANENTLY BANNED<br>
                        • Evidence will be submitted to Hong Kong Police<br>
                        • You may face criminal prosecution
                    </p>
                </div>
                <p style="color: #dc2626; font-weight: 700; margin-top: 1rem;">
                    🚨 WeBond has ZERO TOLERANCE for illegal activities. All content is monitored and recorded.
                </p>
            `
        };
    }
    
    // High risk indicators - Academic fraud
    if (lowerDesc.includes('write') && (lowerDesc.includes('dissertation') || lowerDesc.includes('thesis') || lowerDesc.includes('essay') || lowerDesc.includes('paper'))) {
        return {
            risk: 'high',
            icon: 'fa-exclamation-triangle',
            message: 'This task may violate academic integrity policies. Academic ghostwriting is prohibited on WeBond.',
            patterns: [
                'Academic writing assistance beyond tutoring',
                'Potential plagiarism or contract cheating',
                'Violates university academic integrity codes'
            ],
            recommendation: 'Task flagged for review. Consider offering tutoring/guidance instead of direct writing services.'
        };
    }

    if (lowerDesc.includes('money') && (lowerDesc.includes('transfer') || lowerDesc.includes('cash') || lowerDesc.includes('investment') || lowerDesc.includes('loan'))) {
        return {
            risk: 'high',
            icon: 'fa-exclamation-triangle',
            message: 'Financial transaction detected. This may be a money laundering or fraud attempt.',
            patterns: [
                'Requests involving money transfers',
                'Potential financial scam',
                'High risk for both parties'
            ],
            recommendation: 'Task rejected. Financial transactions outside platform are prohibited.'
        };
    }

    if (lowerDesc.includes('fake') || lowerDesc.includes('forged') || lowerDesc.includes('counterfeit')) {
        return {
            risk: 'high',
            icon: 'fa-exclamation-triangle',
            message: 'Illegal document falsification detected.',
            patterns: [
                'Request for fake or forged documents',
                'Criminal activity',
                'Serious legal consequences'
            ],
            recommendation: 'Task rejected and reported. This violates platform terms and local laws.'
        };
    }

    // Medium risk indicators
    if (lowerDesc.includes('help') && lowerDesc.includes('exam')) {
        return {
            risk: 'medium',
            icon: 'fa-exclamation-circle',
            message: 'Task involves exam assistance. Needs clarification to ensure it\'s ethical tutoring.',
            patterns: [
                'Exam-related assistance mentioned',
                'Could be legitimate tutoring or cheating',
                'Requires clarification'
            ],
            recommendation: 'Request clarification: Is this for exam preparation/tutoring or actual exam help during test?'
        };
    }

    if ((lowerDesc.includes('buy') || lowerDesc.includes('sell')) && (lowerDesc.includes('account') || lowerDesc.includes('id'))) {
        return {
            risk: 'medium',
            icon: 'fa-exclamation-circle',
            message: 'Possible account trading detected. This violates platform policies.',
            patterns: [
                'Account or credential exchange',
                'Potential identity theft',
                'Terms of service violation'
            ],
            recommendation: 'Task requires manual review. Account trading is prohibited.'
        };
    }

    // Low risk
    return {
        risk: 'low',
        icon: 'fa-check-circle',
        message: 'No significant risk patterns detected. Task appears legitimate.',
        patterns: [
            'Clear and specific task description',
            'No prohibited content detected',
            'Standard service request'
        ],
        recommendation: 'Task approved. Proceed with normal workflow.'
    };
}

// Demo 3: Task Assistant
function runTaskAssistant() {
    const draftTask = document.getElementById('draftTask').value;
    const resultBox = document.getElementById('assistantResult');

    if (!draftTask.trim()) {
        showError(resultBox, 'Please enter a draft task description');
        return;
    }

    showLoading(resultBox);

    setTimeout(() => {
        const optimized = optimizeTask(draftTask);
        resultBox.innerHTML = `
            <h4><i class="fas fa-magic" style="color: var(--primary);"></i> Optimized Task Description</h4>
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>Title:</strong> ${optimized.title}
            </div>
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>Description:</strong><br>
                ${optimized.description}
            </div>
            <p><strong>Improvements Made:</strong></p>
            <ul class="suggestion-list">
                ${optimized.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
            <p><strong>Suggested Questions to Clarify:</strong></p>
            <ul class="suggestion-list">
                ${optimized.questions.map(q => `<li>${q}</li>`).join('')}
            </ul>
        `;
        resultBox.classList.add('show');
    }, 1500);
}

function optimizeTask(draftTask) {
    const lowerDraft = draftTask.toLowerCase();

    if (lowerDraft.includes('assignment') || lowerDraft.includes('homework') || lowerDraft.includes('tutor')) {
        return {
            title: 'Academic Assignment Tutoring Assistance',
            description: `I need help understanding and completing my academic assignment. I'm looking for someone who can guide me through the concepts and help me improve my work.<br><br><strong>What I need:</strong><br>
• Explanation of key concepts<br>
• Guidance on approach and methodology<br>
• Review and feedback on my draft work<br>
• Tutoring session(s) to ensure I understand the material<br><br>
<strong>Important:</strong> This is for tutoring/guidance only, not ghostwriting. I want to learn and do the work myself with proper guidance.`,
            improvements: [
                'Added clear structure with sections',
                'Specified this is for tutoring, not ghostwriting',
                'Made expectations explicit',
                'Added ethical disclaimer'
            ],
            questions: [
                'What subject/topic is this assignment about?',
                'What is your deadline?',
                'Do you prefer online or in-person tutoring?',
                'What is your budget for this help?'
            ]
        };
    }

    if (lowerDraft.includes('visa') || lowerDraft.includes('immigration')) {
        return {
            title: 'Visa Application Support & Guidance',
            description: `I need assistance with my Hong Kong visa application process.<br><br><strong>What I need help with:</strong><br>
• Understanding required documents<br>
• Filling out application forms correctly<br>
• Accompanying me to Immigration Department if needed<br>
• Translation assistance (if applicable)<br><br>
<strong>Details:</strong><br>
Location: Immigration Department, Wan Chai<br>
Preferred date: [Your preferred date]<br>
Language: [English/Cantonese/Mandarin]<br>
Budget: HKD [amount]`,
            improvements: [
                'Clarified the type of visa assistance needed',
                'Added location and logistics details',
                'Specified language requirements',
                'Made it clear this is guidance, not fraud'
            ],
            questions: [
                'What type of visa are you applying for?',
                'When is your appointment or deadline?',
                'Do you need translation services?',
                'Have you prepared any documents yet?'
            ]
        };
    }

    return {
        title: 'General Task Assistance Required',
        description: `I am looking for assistance with: ${draftTask}<br><br><strong>Task Details:</strong><br>
Location: [Please specify]<br>
Preferred completion date: [Please specify]<br>
Language preference: [English/Cantonese/Mandarin]<br>
Budget range: HKD [amount]<br><br>
<strong>What I expect:</strong><br>
• [Please describe expected outcomes]<br>
• [Please specify any requirements]`,
        improvements: [
            'Structured format with clear sections',
            'Added location and timing fields',
            'Included budget discussion',
            'Made task more specific and actionable'
        ],
        questions: [
            'Where should this task take place?',
            'When do you need this completed by?',
            'What language do you prefer for communication?',
            'What is your budget range?'
        ]
    };
}

// Demo 4: Dispute Resolution
function runDisputeResolution() {
    const disputeDesc = document.getElementById('disputeDesc').value;
    const resultBox = document.getElementById('disputeResult');

    if (!disputeDesc.trim()) {
        showError(resultBox, 'Please describe the dispute situation');
        return;
    }

    showLoading(resultBox);

    setTimeout(() => {
        const resolution = generateResolution(disputeDesc);
        resultBox.innerHTML = `
            <h4><i class="fas fa-gavel" style="color: var(--primary);"></i> AI Arbitration Analysis</h4>
            <p><strong>Case Summary:</strong> ${resolution.summary}</p>
            <p><strong>Analysis:</strong> ${resolution.analysis}</p>
            <p><strong>Preliminary Resolution:</strong></p>
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                ${resolution.decision}
            </div>
            <p><strong>Compensation Recommendation:</strong></p>
            <ul class="suggestion-list">
                ${resolution.compensation.map(c => `<li>${c}</li>`).join('')}
            </ul>
            <p><strong>Next Steps:</strong> ${resolution.nextSteps}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);"><em>Note: This is a preliminary AI analysis. Final decisions require human review.</em></p>
        `;
        resultBox.classList.add('show');
    }, 1500);
}

function generateResolution(disputeDesc) {
    const lowerDesc = disputeDesc.toLowerCase();

    // Late completion
    if (lowerDesc.includes('late') || lowerDesc.includes('delay')) {
        const hasProof = lowerDesc.includes('proof') || lowerDesc.includes('traffic') || lowerDesc.includes('evidence');
        
        if (hasProof) {
            return {
                summary: 'Task completed late with provided evidence/justification',
                analysis: 'The solver was 2 hours late but provided proof of circumstances beyond their control (traffic delay). The task was completed satisfactorily.',
                decision: '<strong>Recommended Resolution:</strong> Partial compensation for inconvenience, but no full refund since task was completed with valid reason for delay.',
                compensation: [
                    'Raiser receives 20% discount (HKD 40 if task was HKD 200)',
                    'Solver receives 80% of payment (HKD 160)',
                    'Platform waives commission on this transaction',
                    'No negative impact on solver\'s rating if first offense'
                ],
                nextSteps: 'Both parties to confirm agreement. If raiser disagrees, escalate to human arbitrator within 24 hours.'
            };
        }

        return {
            summary: 'Task completed significantly late without justification',
            analysis: 'Solver was late without valid excuse or prior notification. This violates platform punctuality standards.',
            decision: '<strong>Recommended Resolution:</strong> Partial refund to raiser due to breach of agreement.',
            compensation: [
                'Raiser receives 40% refund',
                'Solver receives 60% of payment',
                'Negative rating note on solver profile',
                'Warning issued to solver'
            ],
            nextSteps: 'Resolution executed automatically unless solver disputes within 24 hours.'
        };
    }

    // Quality issues
    if (lowerDesc.includes('quality') || lowerDesc.includes('incomplete') || lowerDesc.includes('not satisfied')) {
        return {
            summary: 'Dispute over task quality/completeness',
            analysis: 'Raiser claims task was not completed to expected standard. Requires review of original task description and delivery.',
            decision: '<strong>Recommended Resolution:</strong> Review task requirements and actual delivery. Request both parties to provide evidence.',
            compensation: [
                'Solver given 24 hours to revise/complete work',
                'If revision satisfactory: Full payment released',
                'If revision unsatisfactory: 50/50 payment split',
                'If task clearly incomplete: 70% refund to raiser'
            ],
            nextSteps: 'Request detailed evidence from both parties. Solver has one opportunity to address quality concerns.'
        };
    }

    // Payment disputes
    if (lowerDesc.includes('payment') || lowerDesc.includes('refund') || lowerDesc.includes('money')) {
        return {
            summary: 'Payment-related dispute',
            analysis: 'Disagreement over payment amount or refund request. Review transaction history and task completion status.',
            decision: '<strong>Recommended Resolution:</strong> Verify task completion against original requirements.',
            compensation: [
                'If task completed as specified: Full payment to solver',
                'If partially completed: Pro-rated payment based on completion %',
                'If not completed: Full refund to raiser',
                'Platform fee adjusted proportionally'
            ],
            nextSteps: 'Human arbitrator to review chat logs and evidence within 48 hours.'
        };
    }

    // Default resolution
    return {
        summary: 'General dispute requiring review',
        analysis: 'The dispute requires detailed review of task agreement, communications, and deliverables.',
        decision: '<strong>Recommended Resolution:</strong> Gather more information from both parties before making final decision.',
        compensation: [
            'Payment held in escrow pending investigation',
            'Both parties submit evidence within 24 hours',
            'Human arbitrator makes final decision',
            'Decision binding unless both parties agree otherwise'
        ],
        nextSteps: 'Case escalated to human review team. Expected resolution within 48-72 hours.'
    };
}
