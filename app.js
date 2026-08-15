/* ========================================
   NeuroPace AI - Core Application Logic
   app.js - UI State, Navigation, KPIs & DOM Management
   ======================================== */

// ========================================
// 1. APPLICATION STATE MANAGEMENT
// ========================================

const AppState = {
    currentSection: 'dashboard',
    themeMode: 'dark',
    trackingEntries: [],
    therapySessions: [],
    initialized: false,

    init() {
        this.loadFromStorage();
        if (!this.themeMode) {
            this.themeMode = 'dark';
        }
    },

    saveToStorage() {
        localStorage.setItem('neuropace_entries', JSON.stringify(this.trackingEntries));
        localStorage.setItem('neuropace_sessions', JSON.stringify(this.therapySessions));
        localStorage.setItem('neuropace_theme', this.themeMode);
    },

    loadFromStorage() {
        const entries = localStorage.getItem('neuropace_entries');
        const sessions = localStorage.getItem('neuropace_sessions');
        const theme = localStorage.getItem('neuropace_theme');

        if (entries) {
            try {
                this.trackingEntries = JSON.parse(entries);
            } catch (e) {
                console.error('Error loading tracking entries:', e);
                this.trackingEntries = [];
            }
        }

        if (sessions) {
            try {
                this.therapySessions = JSON.parse(sessions);
            } catch (e) {
                console.error('Error loading therapy sessions:', e);
                this.therapySessions = [];
            }
        }

        if (theme) {
            this.themeMode = theme;
        }
    },

    addTrackingEntry(entry) {
        entry.timestamp = entry.timestamp || new Date().toISOString();
        entry.id = Date.now();
        this.trackingEntries.unshift(entry);
        this.saveToStorage();
        return entry;
    },

    addTherapySession(session) {
        session.timestamp = new Date().toISOString();
        session.id = Date.now();
        this.therapySessions.unshift(session);
        this.saveToStorage();
        return session;
    },

    getTodayStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEntries = this.trackingEntries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        const todaySessions = this.therapySessions.filter(session => {
            const sessionDate = new Date(session.timestamp);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        });

        const totalCount = this.trackingEntries.length;

        const avgSymptom = totalCount > 0
            ? (this.trackingEntries.reduce((sum, e) => sum + (parseFloat(e.symptomSeverity) || 0), 0) / totalCount).toFixed(1)
            : '0.0';

        const avgScreenTime = totalCount > 0 
            ? (this.trackingEntries.reduce((sum, e) => sum + (parseFloat(e.screenTime) || 0), 0) / totalCount).toFixed(1)
            : '0.0';

        const avgSleepQuality = totalCount > 0
            ? (this.trackingEntries.reduce((sum, e) => sum + (parseFloat(e.sleepQuality) || 0), 0) / totalCount).toFixed(1)
            : '0.0';

        const avgHydration = totalCount > 0
            ? (this.trackingEntries.reduce((sum, e) => sum + (parseFloat(e.hydrationLevel) || 0), 0) / totalCount).toFixed(1)
            : '0.0';

        const avgActivity = totalCount > 0
            ? (this.trackingEntries.reduce((sum, e) => sum + (parseFloat(e.activityLevel) || 0), 0) / totalCount).toFixed(1)
            : '0.0';

        return {
            entries: todayEntries,
            totalEntries: totalCount,
            sessions: todaySessions,
            sessionCount: todaySessions.length,
            avgSymptom,
            avgScreenTime,
            avgSleepQuality,
            avgHydration,
            avgActivity
        };
    }
};

// ========================================
// 2. UI UTILITIES & HELPERS
// ========================================

const UIUtils = {
    showToast(message, type = 'info', duration = 4000) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    },

    formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);

        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        if (dateToCheck.getTime() === today.getTime()) {
            return 'Today, ' + timeStr;
        } else if (dateToCheck.getTime() === yesterday.getTime()) {
            return 'Yesterday, ' + timeStr;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + timeStr;
        }
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    getSeverityLevel(value) {
        if (value <= 2) return 'Minimal';
        if (value <= 4) return 'Mild';
        if (value <= 6) return 'Moderate';
        if (value <= 8) return 'Significant';
        return 'Severe';
    },

    getSleepDescription(value) {
        if (value <= 2) return 'Very Poor';
        if (value <= 4) return 'Poor';
        if (value <= 6) return 'Fair';
        if (value <= 8) return 'Good';
        return 'Excellent';
    }
};

// ========================================
// 3. NAVIGATION MANAGER
// ========================================

const NavigationManager = {
    navigateTo(sectionId) {
        const allSections = document.querySelectorAll('.section');
        allSections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-section') === sectionId) {
                btn.classList.add('active');
            }
        });

        AppState.currentSection = sectionId;
        window.scrollTo(0, 0);
    }
};

// ========================================
// 4. GEMINI AI SERVICE INTEGRATION
// ========================================

const FALLBACK_GEMINI_API_KEY = ""; 

const GeminiAIService = {
    async getApiKey() {
        try {
            const res = await fetch('/api/config');
            if (res.ok) {
                const data = await res.json();
                if (data.GEMINI_API_KEY) return data.GEMINI_API_KEY;
            }
        } catch (e) {
            console.warn("Could not fetch key from /api/config, falling back to local key.");
        }
        return window.GEMINI_API_KEY || FALLBACK_GEMINI_API_KEY;
    },

    calculateBrainBreakScore(formData) {
        const severityWeight = (formData.symptomSeverity / 10) * 0.4;
        const screenWeight = Math.min(formData.screenTime / 12, 1) * 0.3;
        const sleepWeight = ((10 - formData.sleepQuality) / 10) * 0.3;
        return Math.min(Math.max(severityWeight + screenWeight + sleepWeight, 0.05), 0.99);
    },

    async fetchAIRecommendation(formData) {
        const apiKey = await this.getApiKey();

        if (!apiKey || apiKey === "") {
            console.error("❌ Gemini API key is missing.");
            return "<strong>API Key Error:</strong> Please set your API key in server.js or inside app.js (FALLBACK_GEMINI_API_KEY).";
        }

        const systemPrompt = `You are NeuroPace AI, a specialized clinical cognitive health, physical pacing, and neurodiversity assistant.

Analyze these daily health metrics:
- Symptom Severity: ${formData.symptomSeverity}/10
- Screen Time: ${formData.screenTime} hours
- Sleep Quality: ${formData.sleepQuality}/10
- Hydration Level: ${formData.hydrationLevel}/10
- Physical Activity: ${formData.activityLevel}/10

Instructions for recommendations:
- If Screen Time is high (>5 hrs), mandate 20-20-20 eye rest intervals and palming exercises.
- If Sleep Quality or Physical Activity is low, suggest gentle somatic grounding or physical stretching.
- If Symptom Severity is high (>6), emphasize strict cognitive resting and sensory reduction.

Provide a response formatted into two clear sections:

1. Patient Guidance (For Patients):
A warm, supportive, and actionable 2-step plan covering mental pacing, eye strain relief, and physical recovery tailored to their energy envelope.

2. Clinical Summary (For Doctors):
A concise, objective observation correlating primary fatigue triggers (e.g., high screen exposure vs. sleep/hydration deficits) and overall cognitive strain level.

Strict Formatting Rules:
- Keep the entire output under 140 words total.
- Maintain a warm, encouraging, yet professional tone.
- Do NOT use asterisks (*) or markdown bullet symbols anywhere in the response.
- Do NOT make definitive medical diagnoses.`;

        // Try gemini-3.6-flash first
       const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        try {
            console.log("📡 Sending request to Gemini API...");
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Gemini API Returned Error:", data);
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }

            console.log("✅ Gemini API Success Response:", data);
            return data.candidates[0].content.parts[0].text;

        } catch (err) {
            console.error('❌ Gemini Fetch Failed:', err);
            return `<strong>AI Analysis Failed:</strong> ${err.message}. Check browser console (F12) for details.`;
        }
    }
};

// ========================================
// 5. TRACKER FORM & CHART MANAGER
// ========================================

const TrackerManager = {
    currentPrediction: null,

    init() {
        const form = document.getElementById('tracker-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.updateSliderDisplay(e));
        });

        const saveBtn = document.getElementById('save-result-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePredictionResult());
        }
    },

    updateSliderDisplay(event) {
        const slider = event.target;
        const value = slider.value;
        const displayId = slider.id + '-display';
        const display = document.getElementById(displayId);

        if (display) {
            display.textContent = value;
        }
    },

    getFormValues() {
        return {
            symptomSeverity: parseInt(document.getElementById('symptom-severity')?.value || 5, 10),
            screenTime: parseFloat(document.getElementById('screen-time')?.value || 0),
            sleepQuality: parseInt(document.getElementById('sleep-quality')?.value || 5, 10),
            hydrationLevel: parseInt(document.getElementById('hydration-level')?.value || 5, 10),
            activityLevel: parseInt(document.getElementById('activity-level')?.value || 0, 10)
        };
    },

    async handleFormSubmit(event) {
        event.preventDefault();
        UIUtils.showLoading(true);

        const resultContainer = document.getElementById('prediction-result');
        const recommendationDiv = document.getElementById('prediction-recommendation');
        const saveBtn = document.getElementById('save-result-btn');

        if (recommendationDiv) {
            recommendationDiv.innerHTML = '<span style="color:#6c5ce7;">Analyzing metrics with Gemini AI...</span>';
        }
        if (resultContainer) {
            resultContainer.classList.remove('hidden');
        }

        try {
            const formData = this.getFormValues();
            const calculatedScore = GeminiAIService.calculateBrainBreakScore(formData);
            const aiOutput = await GeminiAIService.fetchAIRecommendation(formData);

            this.currentPrediction = {
                brainBreakScore: calculatedScore,
                recommendation: aiOutput,
                formData: formData
            };

            this.displayPredictionResult(this.currentPrediction, formData);

            if (saveBtn) {
                saveBtn.classList.remove('hidden');
            }

            UIUtils.showToast('Analysis complete!', 'success');
        } catch (error) {
            console.error('Error in tracker form submission:', error);
            UIUtils.showToast('An error occurred during analysis.', 'error');
        } finally {
            UIUtils.showLoading(false);
        }
    },

    displayPredictionResult(prediction, inputData) {
        const resultContainer = document.getElementById('prediction-result');
        const scoreValue = document.getElementById('prediction-score');
        const messageDiv = document.getElementById('prediction-message');
        const recommendationDiv = document.getElementById('prediction-recommendation');

        if (!resultContainer) return;

        const percentage = Math.round((prediction.brainBreakScore || 0) * 100);
        if (scoreValue) scoreValue.textContent = percentage + '%';

        if (messageDiv) {
            messageDiv.innerHTML = `
                <strong>Analysis Summary:</strong><br>
                Symptom Severity: ${inputData.symptomSeverity}/10<br>
                Sleep Quality: ${inputData.sleepQuality}/10<br>
                Screen Time: ${inputData.screenTime} hours
            `;
        }

        if (recommendationDiv) {
            recommendationDiv.innerHTML = `
                <div style="margin-top:0.5rem; line-height:1.5;">
                    <strong style="color:#6c5ce7;">AI Recommendation:</strong>
                    <p style="margin-top:0.5rem;">${prediction.recommendation.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }

        resultContainer.classList.remove('hidden');
    },

    savePredictionResult() {
        const formData = this.currentPrediction?.formData || this.getFormValues();
        const brainBreakScore = this.currentPrediction?.brainBreakScore ?? GeminiAIService.calculateBrainBreakScore(formData);
        const recommendation = this.currentPrediction?.recommendation || 'Directly logged entry.';

        const entryToSave = {
            symptomSeverity: formData.symptomSeverity,
            screenTime: formData.screenTime,
            sleepQuality: formData.sleepQuality,
            hydrationLevel: formData.hydrationLevel,
            activityLevel: formData.activityLevel,
            timestamp: new Date().toISOString(),
            prediction: {
                brainBreakScore: brainBreakScore,
                recommendation: recommendation
            }
        };

        AppState.addTrackingEntry(entryToSave);

        UIUtils.showToast('Entry saved successfully!', 'success');
        this.updateHistoryDisplay();
        this.initChart();
        DashboardManager.updateStats();
    },

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = '';

        if (AppState.trackingEntries.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-tertiary);">No entries yet.</p>';
            return;
        }

        AppState.trackingEntries.slice(0, 10).forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const predictionScore = entry.prediction && typeof entry.prediction.brainBreakScore === 'number'
                ? Math.round(entry.prediction.brainBreakScore * 100) 
                : '—';

            item.innerHTML = `
                <div><span class="history-item-label">Symptom Severity:</span> <span class="history-item-value">${entry.symptomSeverity}/10</span></div>
                <div><span class="history-item-label">Brain Break Score:</span> <span class="history-item-value">${predictionScore}%</span></div>
                <span class="history-item-time">${UIUtils.formatDate(entry.timestamp)}</span>
            `;

            historyList.appendChild(item);
        });
    },

    // RESTORED CHART CODE FROM ORIGINAL APPL.JS
    initChart() {
        const canvas = document.getElementById('symptom-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const entries = AppState.trackingEntries.slice(0, 14).reverse();

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: entries.map(e => new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Symptom Severity',
                    data: entries.map(e => e.symptomSeverity),
                    borderColor: '#ff7675',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: { responsive: true }
        });
    }
};
// ========================================
// 6. ADVANCED NEURO-SOMATIC BIO-PACING ENGINE (ENHANCED & BRAND-ALIGNED)
// ========================================

const BioPacingEngine = {
    activeInterval: null,
    timeRemaining: 0,
    currentPhaseIndex: 0,

    protocols: {
        vagus: {
            title: "🫁 Vagus Nerve Reset",
            tagline: "Autonomic Hyperarousal & Overload Relief",
            totalTime: 60,
            advice: "True Advice: Slow exhalations engage the vagus nerve, sending direct parasympathetic signals to lower heart rate and reduce physiological panic.",
            timing: { inhale: 4, hold: 4, exhale: 7 }
        },
        oculomotor: {
            title: "👁️ Oculomotor Saccadic Shift",
            tagline: "Eye Strain & Cognitive Fatigue Reduction",
            totalTime: 40,
            advice: "True Advice: Shifting eyes to cardinal gaze extremes inhibits brainstem hyper-reactivity and relieves visual processing overload caused by screen exposure.",
            steps: ["Gaze Top-Left", "Gaze Bottom-Right", "Gaze Top-Right", "Gaze Bottom-Left", "Soft Center Focus"],
            stepDuration: 8
        },
        energy: {
            title: "🔋 Orthostatic Energy Pacing",
            tagline: "Physical Energy Crash & PEM Recovery",
            totalTime: 90,
            advice: "True Advice: Resting in a horizontal position with elevated legs reduces cardiac work, aiding cerebral perfusion without expending ATP reserves.",
            instructions: "Lie flat on your back, elevate your knees on a cushion, and allow muscle tension to melt into the surface."
        },
        bilateral: {
            title: "🧠 Bilateral Somatic Tapping",
            tagline: "Mental Overwhelm & Cognitive Pacing",
            totalTime: 45,
            advice: "True Advice: Alternating left-right tactile stimulation engages both brain hemispheres, lowering amygdala activity and restoring executive control.",
            instructions: "Cross arms over your chest (Butterfly Hug) and tap your shoulders alternately: Left... Right... Left... Right."
        },
        ribExpansion: {
            title: "🫀 Diaphragmatic Rib Pacing",
            tagline: "Physical Fatigue & Low Oxygenation",
            totalTime: 60,
            advice: "True Advice: Expanding the lateral lower ribs increases lower-lung ventilation, maximizing oxygen exchange efficiency with minimal muscular effort.",
            timing: { inhale: 5, hold: 2, exhale: 5 }
        },
        grounding478: {
            title: "4-7-8 Somatic Grounding",
            tagline: "Acute Mental Anxiety & Cognitive Reset",
            totalTime: 75,
            advice: "True Advice: Extended breath retention increases arterial carbon dioxide slightly, triggering cerebral vasodilation and rapid mental calming.",
            timing: { inhale: 4, hold: 7, exhale: 8 }
        }
    },

    init() {
        this.renderInterface();
    },

    renderInterface() {
        let container = document.getElementById('bio-pacing-module');
        if (!container) {
            const parent = document.getElementById('tracker') || document.getElementById('dashboard');
            if (!parent) return;

            container = document.createElement('div');
            container.id = 'bio-pacing-module';
            container.style.cssText = `
                background: rgba(21, 201, 186, 0.04);
                border: 1px solid rgba(21, 201, 186, 0.25);
                border-radius: 16px;
                padding: 1.5rem;
                margin-top: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                backdrop-filter: blur(8px);
                color: var(--text-primary, #ffffff);
            `;
            parent.appendChild(container);
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="color: #15c9ba; margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
                    ⚡ Neuro-Somatic Bio-Pacing Engine
                </h3>
                <span style="font-size: 0.75rem; background: rgba(21, 201, 186, 0.15); color: #15c9ba; padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 600; border: 1px solid rgba(21, 201, 186, 0.3);">
                    Interactive Clinical Pacing
                </span>
            </div>
            
            <p style="font-size: 0.85rem; color: var(--text-tertiary, #b2bec3); margin-bottom: 1.2rem;">
                Select a clinical exercise to regulate somatic strain and restore balance in real time:
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
                <button onclick="BioPacingEngine.startBreathExercise('vagus')" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">🫁 Vagus Nerve Reset</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Autonomic & Stress Relief</span>
                </button>

                <button onclick="BioPacingEngine.startOculomotorProtocol()" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">👁️ Oculomotor Shift</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Eye Strain & Fatigue</span>
                </button>

                <button onclick="BioPacingEngine.startInstructionExercise('energy')" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">🔋 Orthostatic Pacing</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Physical Crash Rest</span>
                </button>

                <button onclick="BioPacingEngine.startInstructionExercise('bilateral')" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">🧠 Bilateral Tapping</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Mental Synchronization</span>
                </button>

                <button onclick="BioPacingEngine.startBreathExercise('ribExpansion')" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">🫀 Rib Expansion</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Physical Oxygenation</span>
                </button>

                <button onclick="BioPacingEngine.startBreathExercise('grounding478')" style="padding: 0.75rem; background: rgba(21, 201, 186, 0.08); border: 1px solid rgba(21, 201, 186, 0.3); color: #fff; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong style="display:block; color: #15c9ba; font-size: 0.9rem;">4-7-8 Grounding</strong>
                    <span style="font-size:0.75rem; opacity:0.8; color: #111c20a8;">Mental Anxiety Pacing</span>
                </button>
            </div>

            <div id="pacing-display" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(21, 201, 186, 0.35); border-radius: 12px; padding: 1.5rem; text-align: center; min-height: 140px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                <span style="color: #15c9ba; font-weight: 500; font-size: 0.9rem;">Select any neuro-somatic exercise above to launch live timer & clinical pacing.</span>
            </div>
        `;
    },

    startBreathExercise(key) {
        this.stop();
        const proto = this.protocols[key];
        if (!proto) return;

        this.timeRemaining = proto.totalTime;
        let phase = 'Inhale';
        let phaseCount = proto.timing.inhale;

        const display = document.getElementById('pacing-display');

        display.innerHTML = `
            <div style="display: flex; gap: 1.5rem; align-items: center; justify-content: center; width: 100%; max-width: 520px; margin-bottom: 0.75rem;">
                <div id="pacing-ring" style="width: 85px; height: 85px; border-radius: 50%; background: rgba(21, 201, 186, 0.15); border: 3px solid #15c9ba; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: transform 1s ease-in-out; box-shadow: 0 0 15px rgba(21, 201, 186, 0.3);">
                    <span id="phase-timer" style="font-size: 1.4rem; font-weight: 700; color: #ffffff;">${phaseCount}</span>
                    <span id="phase-label" style="font-size: 0.65rem; color: #15c9ba; text-transform: uppercase; font-weight: 600;">${phase}</span>
                </div>
                <div style="text-align: left; flex: 1;">
                    <div style="font-size: 0.75rem; color: #15c9ba; font-weight: 700;">TIME REMAINING: <span id="total-timer">${this.timeRemaining}</span>s</div>
                    <strong style="color: #ffffff; font-size: 1.1rem; display: block; margin-top: 0.2rem;">${proto.title}</strong>
                    <span style="font-size: 0.8rem; color: #b2bec3;">${proto.tagline}</span>
                </div>
            </div>
            
            <div style="background: rgba(21, 201, 186, 0.1); border-left: 3px solid #15c9ba; padding: 0.68rem 0.85rem; border-radius: 6px; text-align: left; font-size: 0.82rem; line-height: 1.4; color: #ffffff; margin-bottom: 0.8rem;">
                💡 <strong>Clinical Guidance:</strong> ${proto.advice}
            </div>

            <button onclick="BioPacingEngine.stop()" style="padding: 0.35rem 1rem; background: rgba(255,118,117,0.2); border: 1px solid #ff7675; color:#ffffff; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Stop Session</button>
        `;

        const ring = document.getElementById('pacing-ring');
        const phaseTimer = document.getElementById('phase-timer');
        const phaseLabel = document.getElementById('phase-label');
        const totalTimer = document.getElementById('total-timer');

        this.activeInterval = setInterval(() => {
            this.timeRemaining--;
            phaseCount--;

            if (totalTimer) totalTimer.textContent = this.timeRemaining;
            if (phaseTimer) phaseTimer.textContent = phaseCount;

            if (phaseCount <= 0) {
                if (phase === 'Inhale') {
                    if (proto.timing.hold) {
                        phase = 'Hold';
                        phaseCount = proto.timing.hold;
                        if (ring) ring.style.transform = "scale(1.2)";
                    } else {
                        phase = 'Exhale';
                        phaseCount = proto.timing.exhale;
                        if (ring) ring.style.transform = "scale(0.85)";
                    }
                } else if (phase === 'Hold') {
                    phase = 'Exhale';
                    phaseCount = proto.timing.exhale;
                    if (ring) ring.style.transform = "scale(0.85)";
                } else {
                    phase = 'Inhale';
                    phaseCount = proto.timing.inhale;
                    if (ring) ring.style.transform = "scale(1.05)";
                }

                if (phaseLabel) phaseLabel.textContent = phase;
            }

            if (this.timeRemaining <= 0) {
                this.completeSession(proto.title);
            }
        }, 1000);
    },

    startOculomotorProtocol() {
        this.stop();
        const proto = this.protocols.oculomotor;
        this.timeRemaining = proto.totalTime;
        let stepIdx = 0;
        let stepTime = proto.stepDuration;

        const display = document.getElementById('pacing-display');

        const updateUI = () => {
            display.innerHTML = `
                <div style="width: 100%; max-width: 520px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong style="color: #ffffff; font-size: 1.1rem;">${proto.title}</strong>
                        <span style="font-size: 0.8rem; color: #15c9ba; font-weight: 700;">EXERCISE TIMER: <span id="total-timer">${this.timeRemaining}</span>s</span>
                    </div>

                    <div style="background: rgba(21, 201, 186, 0.12); border: 1px solid rgba(21, 201, 186, 0.4); padding: 1rem; border-radius: 10px; margin-bottom: 0.75rem;">
                        <span style="font-size: 0.75rem; color: #15c9ba; text-transform: uppercase; font-weight: 700;">Current Movement (${stepTime}s remaining)</span>
                        <h4 style="margin: 0.3rem 0 0 0; font-size: 1.3rem; color: #ffffff;">${proto.steps[stepIdx]}</h4>
                    </div>

                    <div style="background: rgba(21, 201, 186, 0.1); border-left: 3px solid #15c9ba; padding: 0.68rem 0.85rem; border-radius: 6px; text-align: left; font-size: 0.82rem; line-height: 1.4; color: #ffffff; margin-bottom: 0.8rem;">
                        💡 <strong>Clinical Guidance:</strong> ${proto.advice}
                    </div>

                    <button onclick="BioPacingEngine.stop()" style="padding: 0.35rem 1rem; background: rgba(255,118,117,0.2); border: 1px solid #ff7675; color:#ffffff; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Stop Session</button>
                </div>
            `;
        };

        updateUI();

        this.activeInterval = setInterval(() => {
            this.timeRemaining--;
            stepTime--;

            const totalTimer = document.getElementById('total-timer');
            if (totalTimer) totalTimer.textContent = this.timeRemaining;

            if (stepTime <= 0) {
                stepIdx = (stepIdx + 1) % proto.steps.length;
                stepTime = proto.stepDuration;
                updateUI();
            }

            if (this.timeRemaining <= 0) {
                this.completeSession(proto.title);
            }
        }, 1000);
    },

    startInstructionExercise(key) {
        this.stop();
        const proto = this.protocols[key];
        if (!proto) return;

        this.timeRemaining = proto.totalTime;
        const display = document.getElementById('pacing-display');

        display.innerHTML = `
            <div style="width: 100%; max-width: 520px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: #ffffff; font-size: 1.1rem;">${proto.title}</strong>
                    <span style="font-size: 0.8rem; color: #15c9ba; font-weight: 700;">SESSION TIMER: <span id="total-timer">${this.timeRemaining}</span>s</span>
                </div>

                <p style="font-size: 0.9rem; color: #ffffff; margin: 0.5rem 0 0.8rem 0; line-height: 1.4;">${proto.instructions}</p>

                <div style="background: rgba(21, 201, 186, 0.1); border-left: 3px solid #15c9ba; padding: 0.68rem 0.85rem; border-radius: 6px; text-align: left; font-size: 0.82rem; line-height: 1.4; color: #f1f2f6; margin-bottom: 0.8rem;">
                    💡 <strong>Clinical Guidance:</strong> ${proto.advice}
                </div>

                <button onclick="BioPacingEngine.stop()" style="padding: 0.35rem 1rem; background: rgba(255,118,117,0.2); border: 1px solid #ff7675; color:#ffffff; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Stop Session</button>
            </div>
        `;

        const totalTimer = document.getElementById('total-timer');

        this.activeInterval = setInterval(() => {
            this.timeRemaining--;
            if (totalTimer) totalTimer.textContent = this.timeRemaining;

            if (this.timeRemaining <= 0) {
                this.completeSession(proto.title);
            }
        }, 1000);
    },

    completeSession(title) {
        this.stop();
        if (window.UIUtils && window.UIUtils.showToast) {
            window.UIUtils.showToast(`Completed ${title}!`, 'success');
        }
    },

    stop() {
        if (this.activeInterval) {
            clearInterval(this.activeInterval);
            this.activeInterval = null;
        }
        this.renderInterface();
    }
};

window.BioPacingEngine = BioPacingEngine;
// ========================================
// 7. THERAPY MANAGER
// ========================================

const TherapyManager = {
    timerInterval: null,
    secondsElapsed: 0,
    isRunning: false,

    init() {
        const startBtn = document.getElementById('therapy-start-btn');
        const stopBtn = document.getElementById('therapy-stop-btn');

        if (!startBtn || !stopBtn) {
            console.log('ℹ️ Therapy buttons not present on current DOM layout.');
            return;
        }

        startBtn.onclick = () => this.startExercise();
        stopBtn.onclick = () => this.stopExercise();
    },

    startExercise() {
        const startBtn = document.getElementById('therapy-start-btn');
        const stopBtn = document.getElementById('therapy-stop-btn');
        const timerDisplay = document.getElementById('timer-display') || document.getElementById('therapy-timer-display');

        this.isRunning = true;
        this.secondsElapsed = 0;

        if (startBtn) startBtn.classList.add('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');

        UIUtils.showToast('Therapy exercise started!', 'success');

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            if (timerDisplay) {
                timerDisplay.textContent = UIUtils.formatTime(this.secondsElapsed);
            }
        }, 1000);
    },

    stopExercise() {
        const startBtn = document.getElementById('therapy-start-btn');
        const stopBtn = document.getElementById('therapy-stop-btn');
        const timerDisplay = document.getElementById('timer-display') || document.getElementById('therapy-timer-display');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.isRunning = false;

        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');

        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        }

        UIUtils.showToast(`Exercise completed (${UIUtils.formatTime(this.secondsElapsed)})`, 'info');

        AppState.addTherapySession({
            exercise: 'Oculomotor Therapy',
            duration: this.secondsElapsed,
            completed: true
        });

        DashboardManager.updateStats();
    }
};

window.TherapyManager = TherapyManager;

// ========================================
// 8. DASHBOARD MANAGER (LIVE VISUAL KPIs)
// ========================================

const DashboardManager = {
    updateStats() {
        const stats = AppState.getTodayStats();

        const sessionsEl = document.getElementById('sessions-today');
        const screenTimeEl = document.getElementById('screen-time-today');
        const sleepQualityEl = document.getElementById('sleep-quality-today');

        if (sessionsEl) sessionsEl.textContent = stats.sessionCount;
        if (screenTimeEl) screenTimeEl.textContent = stats.avgScreenTime;
        if (sleepQualityEl) sleepQualityEl.textContent = stats.avgSleepQuality;

        this.renderExecutiveKPIs(stats);
    },

    renderExecutiveKPIs(stats) {
        let kpiContainer = document.getElementById('executive-kpi-container');

        if (!kpiContainer) {
            const dashboardSection = document.getElementById('dashboard');
            if (!dashboardSection) return;

            kpiContainer = document.createElement('div');
            kpiContainer.id = 'executive-kpi-container';
            kpiContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; width: 100%;';
            dashboardSection.insertBefore(kpiContainer, dashboardSection.firstChild);
        }

        kpiContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 0.85rem; border-radius: 8px; border-left: 4px solid #6c5ce7;">
                <span style="font-size: 0.75rem; color: var(--text-tertiary);">Total Logs</span>
                <h3 style="margin-top: 0.2rem; font-size: 1.2rem;">${stats.totalEntries}</h3>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 0.85rem; border-radius: 8px; border-left: 4px solid #ff7675;">
                <span style="font-size: 0.75rem; color: var(--text-tertiary);">Avg Symptom</span>
                <h3 style="margin-top: 0.2rem; font-size: 1.2rem;">${stats.avgSymptom} / 10</h3>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 0.85rem; border-radius: 8px; border-left: 4px solid #00cec9;">
                <span style="font-size: 0.75rem; color: var(--text-tertiary);">Avg Screen / Sleep</span>
                <h3 style="margin-top: 0.2rem; font-size: 1.1rem;">${stats.avgScreenTime}h / ${stats.avgSleepQuality}</h3>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 0.85rem; border-radius: 8px; border-left: 4px solid #fdcb6e;">
                <span style="font-size: 0.75rem; color: var(--text-tertiary);">Avg Hydration / Activity</span>
                <h3 style="margin-top: 0.2rem; font-size: 1.1rem;">${stats.avgHydration} / ${stats.avgActivity}</h3>
            </div>
        `;
    }
};

// ========================================
// 9. THEME MANAGER
// ========================================

const ThemeManager = {
    init() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
        this.applyTheme();
    },

    toggleTheme() {
        AppState.themeMode = AppState.themeMode === 'dark' ? 'light' : 'dark';
        AppState.saveToStorage();
        this.applyTheme();
        UIUtils.showToast(`Switched to ${AppState.themeMode} mode`, 'info', 2000);
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', AppState.themeMode);
    }
};

// ========================================
// 10. MAIN APPLICATION INITIALIZATION
// ========================================

const App = {
    init() {
        console.log('🧠 NeuroPace AI - Initializing Application...');

        AppState.init();
        this.setupNavigation();
        ThemeManager.init();
        TrackerManager.init();
        TherapyManager.init();
        BioPacingEngine.init();
        DashboardManager.updateStats();

        setTimeout(() => {
            TrackerManager.initChart();
            TrackerManager.updateHistoryDisplay();
        }, 300);

        AppState.initialized = true;
        console.log('✅ Application initialized successfully');
    },

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = btn.getAttribute('data-section');
                if (sectionId) {
                    NavigationManager.navigateTo(sectionId);
                }
            });
        });
    }
};

// ========================================
// 11. DOM READY INITIALIZATION
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Global exports
window.NeuroPaceAI = {
    AppState,
    UIUtils,
    NavigationManager,
    GeminiAIService,
    TrackerManager,
    BioPacingEngine,
    TherapyManager,
    DashboardManager,
    ThemeManager,
    App
};