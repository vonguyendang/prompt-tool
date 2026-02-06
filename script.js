// script.js

// --- CONFIG & STATE ---
const API_ENDPOINT = 'api.php';
let SYSTEM_PROMPT = '';
const DEFAULT_MODEL = 'sonar';

// State
let generatedPrompt = '';
let historyData = [];
let promptLang = 'VN'; // Default

// --- DOM ELEMENTS ---
const els = {
    ideaInput: document.getElementById('ideaInput'),
    autoFillBtn: document.getElementById('autoFillBtn'),
    loader: document.getElementById('loader'),

    // Form Fields
    fRole: document.getElementById('fRole'),
    fSituation: document.getElementById('fSituation'),
    fReason: document.getElementById('fReason'),
    fRules: document.getElementById('fRules'),
    fResult: document.getElementById('fResult'),
    fLength: document.getElementById('fLength'),
    fStrict: document.getElementById('fStrict'),
    fSteps: document.getElementById('fSteps'),

    generatePromptBtn: document.getElementById('generatePromptBtn'),
    previewArea: document.getElementById('previewArea'),
    promptPreview: document.getElementById('promptPreview'),

    // Perplexity Panel
    apiKey: document.getElementById('apiKey'),
    modelSelect: document.getElementById('modelSelect'),
    testBtn: document.getElementById('testBtn'),
    outputContent: document.getElementById('outputContent'),
    testLoader: document.getElementById('testLoader'),
    tokenUsage: document.getElementById('tokenUsage'),
    copyBtn: document.getElementById('copyBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    // Attachments
    fileInput: document.getElementById('fileInput'),
    attachmentPreview: document.getElementById('attachmentPreview'),
    previewImg: document.getElementById('previewImg'),
    fileName: document.getElementById('fileName'),
    clearAttachment: document.getElementById('clearAttachment'),

    // Lang
    langVN: document.getElementById('langVN'),
    langEN: document.getElementById('langEN'),
    copyPromptBtn: document.getElementById('copyPromptBtn'),

    // Labels
    lblRole: document.getElementById('lblRole'),
    lblSituation: document.getElementById('lblSituation'),
    lblReason: document.getElementById('lblReason'),
    lblRules: document.getElementById('lblRules'),
    lblResult: document.getElementById('lblResult'),
    lblLength: document.getElementById('lblLength'),
    lblStrict: document.getElementById('lblStrict'),

    // Global
    themeToggle: document.getElementById('themeToggle'),
    clearBtn: document.getElementById('clearBtn'),
    templateList: document.getElementById('templateList'),
    historyBar: document.getElementById('historyBar'),
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    loadHistory();
    await loadSystemPrompt();
    await loadTemplates();
    // Theme
    if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);

    // Quick Idea -> Auto Fill
    if (els.autoFillBtn) els.autoFillBtn.addEventListener('click', handleAutoFill);

    // Generate/Preview Prompt (on input change or button click)
    const formFields = [els.fRole, els.fSituation, els.fReason, els.fRules, els.fResult, els.fLength, els.fStrict, els.fSteps];
    formFields.forEach(el => {
        if (el) el.addEventListener('input', updatePromptPreview);
    });

    if (els.generatePromptBtn) {
        els.generatePromptBtn.addEventListener('click', () => {
            updatePromptPreview();
            if (els.previewArea) els.previewArea.classList.remove('hidden');
        });
    }

    // Test Prompt
    if (els.testBtn) els.testBtn.addEventListener('click', handleTestPrompt);

    // Clear
    if (els.clearBtn) els.clearBtn.addEventListener('click', clearAll);

    // Copy & Export
    if (els.copyBtn) els.copyBtn.addEventListener('click', copyOutput);
    if (els.exportJsonBtn) els.exportJsonBtn.addEventListener('click', exportJson);

    // Attachments
    if (els.fileInput) els.fileInput.addEventListener('change', handleFileSelect);
    if (els.clearAttachment) els.clearAttachment.addEventListener('click', clearFile);

    // Language - Re-query to be safe
    const btnVN = document.getElementById('langVN');
    const btnEN = document.getElementById('langEN');

    if (btnVN) {
        btnVN.onclick = () => setLang('VN');
        console.log("Attached VN listener");
    } else { console.error("VN Button not found"); }

    if (btnEN) {
        btnEN.onclick = () => setLang('EN');
        console.log("Attached EN listener");
    } else { console.error("EN Button not found"); }

    if (els.copyPromptBtn) {
        els.copyPromptBtn.addEventListener('click', copyFullPrompt);
    } else { console.error("Copy Prompt Button not found"); }
});

// Expose for debugging
window.setLang = setLang;

function setLang(lang, isAutoSwitch = false) {
    promptLang = lang;
    console.log("Language switched to:", lang);

    // Update UI Toggles - Simple manual link
    if (lang === 'VN') {
        if (els.langVN) els.langVN.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-gray-600 shadow-sm transition-all text-gray-900 dark:text-gray-100";
        if (els.langEN) els.langEN.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-transparent text-gray-500 hover:text-gray-900 transition-all";
    } else {
        if (els.langEN) els.langEN.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-gray-600 shadow-sm transition-all text-gray-900 dark:text-gray-100";
        if (els.langVN) els.langVN.className = "px-2 py-0.5 text-[10px] font-bold rounded bg-transparent text-gray-500 hover:text-gray-900 transition-all";
    }

    // Translate UI Labels
    if (lang === 'VN') {
        if (els.lblRole) els.lblRole.textContent = 'VAI TRÒ (ROLE)';
        if (els.lblSituation) els.lblSituation.textContent = 'BỐI CẢNH (SITUATION)';
        if (els.lblReason) els.lblReason.textContent = 'MỤC TIÊU (REASON)';
        if (els.lblRules) els.lblRules.textContent = 'QUY LUẬT (RULES)';
        if (els.lblResult) els.lblResult.textContent = 'KẾT QUẢ (RESULT)';
        if (els.lblLength) els.lblLength.textContent = 'ĐỘ DÀI';
        if (els.lblStrict) els.lblStrict.textContent = 'TUÂN THỦ';
    } else {
        if (els.lblRole) els.lblRole.textContent = 'ROLE';
        if (els.lblSituation) els.lblSituation.textContent = 'SITUATION';
        if (els.lblReason) els.lblReason.textContent = 'REASON (GOAL)';
        if (els.lblRules) els.lblRules.textContent = 'RULES (CONSTRAINTS)';
        if (els.lblResult) els.lblResult.textContent = 'RESULT (FORMAT)';
        if (els.lblLength) els.lblLength.textContent = 'LENGTH';
        if (els.lblStrict) els.lblStrict.textContent = 'STRICT';
    }

    // Auto-Translate Content if manual switch and content exists
    if (!isAutoSwitch) {
        translateContent(lang);
    }

    updatePromptPreview();
}

async function translateContent(targetLang) {
    const role = els.fRole.value.trim();
    if (!role) return; // Empty form, no need to translate

    setLoading(true, els.loader);
    console.log(`Translating content to ${targetLang}...`);

    try {
        const fields = {
            Role: els.fRole.value,
            Situation: els.fSituation.value,
            Reason: els.fReason.value,
            Rules: els.fRules.value,
            Result: els.fResult.value
        };

        const prompt = `Translate the values of the following JSON object to ${targetLang === 'VN' ? 'Vietnamese' : 'English'}. Keep keys unchanged. JSON ONLY.\n${JSON.stringify(fields)}`;

        const messages = [
            { role: "user", content: prompt }
        ];

        const data = await callPerplexityAPI(messages);
        let jsonStr = data.choices[0].message.content;
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const translated = JSON.parse(jsonStr);

        els.fRole.value = translated.Role || els.fRole.value;
        els.fSituation.value = translated.Situation || els.fSituation.value;
        els.fReason.value = translated.Reason || els.fReason.value;
        els.fRules.value = translated.Rules || els.fRules.value;
        els.fResult.value = translated.Result || els.fResult.value;

        updatePromptPreview();

    } catch (e) {
        console.error("Translation failed", e);
        // alert("Auto-translation failed. Please try again."); // Silent fail prefer
    } finally {
        setLoading(false, els.loader);
    }
}

function copyFullPrompt() {
    navigator.clipboard.writeText(generatedPrompt);
    const original = els.copyPromptBtn.textContent;
    els.copyPromptBtn.textContent = 'Copied!';
    setTimeout(() => els.copyPromptBtn.textContent = original, 2000);
}

let attachedImageBase64 = null;

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB approx for safety, API limit 50MB but PHP might limit)
    if (file.size > 10 * 1024 * 1024) return alert('File too large (Max 10MB)');

    const reader = new FileReader();
    reader.onload = (e) => {
        attachedImageBase64 = e.target.result;
        els.previewImg.src = attachedImageBase64;
        els.fileName.textContent = file.name;
        els.attachmentPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearFile() {
    els.fileInput.value = '';
    attachedImageBase64 = null;
    els.attachmentPreview.classList.add('hidden');
}

// --- LOGIC: THEME ---
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// --- LOGIC: DATA LOADING ---
async function loadSystemPrompt() {
    try {
        const res = await fetch('classify.php');
        const data = await res.json();
        SYSTEM_PROMPT = data.system_prompt;
    } catch (e) {
        console.warn('Failed to load system prompt, using fallback.', e);
        SYSTEM_PROMPT = "Analyze user idea. Output JSON: Role, Situation, Reason, Rules, Result... JSON ONLY.";
    }
}

async function loadTemplates() {
    try {
        const res = await fetch('templates.json');
        const templates = await res.json();

        els.templateList.innerHTML = templates.map(t => `
            <div class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors text-xs"
                 onclick="applyTemplate('${t.idea.replace(/'/g, "\\'")}')">
                <div class="font-bold text-gray-700 dark:text-gray-200">${t.name}</div>
                <div class="text-[10px] text-gray-500 truncate">${t.category}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Error loading templates", e);
    }
}

window.applyTemplate = (idea) => {
    els.ideaInput.value = idea;
    // Auto-trigger auto-fill for better UX? Or let user click? Let's let user click for now to save API calls.
    // els.autoFillBtn.click(); 
};

// --- LOGIC: AUTO-FILL (MAGIC) ---
async function handleAutoFill() {
    const idea = els.ideaInput.value.trim();
    if (!idea) return alert('Please enter an idea first!');

    setLoading(true, els.loader);

    try {
        // Classification Prompt construction
        // NOTE: We now ask the AI to detect language and output accordingly via SYSTEM_PROMPT in classify.php
        // So we don't need to force a language instruction here anymore, checking the result is enough.

        let messages = [];

        if (attachedImageBase64) {
            messages = [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Idea: "${idea}"\n(This idea includes an attached image context)` },
                        { type: "image_url", image_url: { url: attachedImageBase64 } }
                    ]
                }
            ];
        } else {
            messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Idea: "${idea}"` }
            ];
        }

        // Note: We use 'sonar-vision' or 'sonar-pro' for image analysis if the default small model doesn't support it.
        // Usually, standard sonar models are text-focused. Sonar Pro/Large is safer for vision.
        // We'll override the model for Auto-Fill if image is present to 'sonar-pro' (Large) just in case.
        const modelToUse = attachedImageBase64 ? 'sonar-pro' : 'sonar-pro'; // Use smarter model for classification anyway

        const data = await callPerplexityAPI(messages, modelToUse);

        // Parse JSON from response (handle potential markdown blocks)
        let jsonStr = data.choices[0].message.content;
        // Clean markdown ```json ... ```
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const result = JSON.parse(jsonStr);
        populateForm(result);

        // Auto-switch Language based on detection
        if (result.Language) {
            setLang(result.Language, true); // true = isAutoSwitch, don't re-translate
        }

        updatePromptPreview(); // Auto-generate prompt

    } catch (e) {
        console.error("Auto-Fill Error:", e);
        alert('Failed to auto-fill. See console for details.');
    } finally {
        setLoading(false, els.loader);
    }
}

function populateForm(data) {
    els.fRole.value = data.Role || '';
    els.fSituation.value = data.Situation || '';
    els.fReason.value = data.Reason || '';
    els.fRules.value = data.Rules || '';
    els.fResult.value = data.Result || '';
    els.fLength.value = data.Length || 150;
    els.fStrict.value = data.Strict || 'Medium';
    els.fSteps.checked = !!data.Steps;
}

// --- LOGIC: PROMPT GENERATION ---
function updatePromptPreview() {
    // 4R-4S Compilation
    const role = els.fRole.value.trim();
    const situation = els.fSituation.value.trim();
    const reason = els.fReason.value.trim();
    const rules = els.fRules.value.trim();
    const result = els.fResult.value.trim();
    const length = els.fLength.value;
    const strict = els.fStrict.value;
    const steps = els.fSteps.checked;

    const isVN = promptLang === 'VN';

    let p = `## ${isVN ? 'VAI TRÒ (ROLE)' : 'ROLE'}\n${role}\n\n`;
    p += `## ${isVN ? 'BỐI CẢNH (SITUATION)' : 'SITUATION'}\n${situation}\n\n`;
    p += `## ${isVN ? 'MỤC TIÊU (GOAL)' : 'REASON (GOAL)'}\n${reason}\n\n`;
    p += `## ${isVN ? 'QUY LUẬT (RULES)' : 'RULES (CONSTRAINTS)'}\n${rules}\n`;
    p += `- ${isVN ? 'Độ dài' : 'Length constraints'}: ~${length} ${isVN ? 'từ' : 'words'}\n`;
    p += `- ${isVN ? 'Mức độ tuân thủ' : 'Adherence Level'}: ${strict}\n\n`;
    p += `## ${isVN ? 'KẾT QUẢ (RESULT)' : 'RESULT (FORMAT)'}\n${result}\n\n`;

    if (steps) {
        p += `## ${isVN ? 'HƯỚNG DẪN' : 'INSTRUCTIONS'}\n${isVN ? 'Vui lòng thực hiện từng bước để đảm bảo chất lượng cao nhất.' : 'Please follow a step-by-step approach to ensure high quality.'}`;
    }

    generatedPrompt = p;
    els.promptPreview.textContent = p;
    Prism.highlightElement(els.promptPreview);
}

// --- LOGIC: TEST PROMPT ---
async function handleTestPrompt() {
    if (!generatedPrompt) updatePromptPreview();
    if (!generatedPrompt.trim()) return alert('Prompt is empty!');

    setLoading(true, els.testLoader);
    els.outputContent.innerHTML = ''; // Clear previous

    try {
        const model = els.modelSelect.value;
        let messages = [];

        if (attachedImageBase64) {
            messages = [{
                role: 'user',
                content: [
                    { type: 'text', text: generatedPrompt },
                    { type: 'image_url', image_url: { url: attachedImageBase64 } }
                ]
            }];
        } else {
            messages = [{ role: 'user', content: generatedPrompt }];
        }

        // Use user provided key if available, else standard backend flow
        // Note: The backend currently hardcodes a key, but for a real tool we'd pass it or rely on backend env.
        // If user enters key, we might need client-side call or pass it to backend.
        // For security in this specific MVP architecture (proxy), we'll stick to backend proxy.
        // If the user wants to use their OWN key, we would need to adjust api.php to accept it or call directly from JS (insecure for key storage but ok for user-provided).
        // Let's assume standard flow via api.php for now as per plan.

        const data = await callPerplexityAPI(messages, model);

        const content = data.choices[0].message.content;
        const citations = data.citations || [];

        renderOutput(content, citations);

        // Update Token Usage (Estimate or from usage field if available)
        const tokens = data.usage ? data.usage.total_tokens : 'N/A';
        els.tokenUsage.textContent = `Tokens: ${tokens}`;

        addToHistory(els.ideaInput.value || "Custom Prompt", generatedPrompt, content);

    } catch (e) {
        els.outputContent.innerHTML = `<div class="text-red-500 font-bold">Error: ${e.message}</div>`;
    } finally {
        setLoading(false, els.testLoader);
    }
}

async function callPerplexityAPI(messages, model = DEFAULT_MODEL) {
    const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model })
    });

    if (!res.ok) {
        const err = await res.json();
        const msg = err.error || 'API Request Failed';
        if (msg.includes("Invalid model")) {
            throw new Error(`Model not supported via API. Please try a "Sonar" model.`);
        }
        throw new Error(msg);
    }

    return await res.json();
}

function renderOutput(markdown, citations) {
    // Process Citations: [1] -> Link
    // Simple regex replacement for [n] to sup tags or links if we had URLs map
    // Perplexity returns 'citations' array of URLs. [1] corresponds to citations[0].

    let html = marked.parse(markdown);

    // Replace [1], [2] etc with links
    html = html.replace(/\[(\d+)\]/g, (match, num) => {
        const index = parseInt(num) - 1;
        if (citations[index]) {
            return `<a href="${citations[index]}" target="_blank" class="text-blue-500 hover:underline sup">[${num}]</a>`;
        }
        return match;
    });

    els.outputContent.innerHTML = html;

    // Add citations footer
    if (citations.length > 0) {
        const footerInfo = citations.map((url, i) => `
            <div class="truncate text-xs text-gray-400">
                <span class="font-bold">[${i + 1}]</span> <a href="${url}" target="_blank" class="hover:text-blue-500">${new URL(url).hostname}</a>
            </div>
        `).join('');
        els.outputContent.innerHTML += `<div class="mt-8 pt-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded">${footerInfo}</div>`;
    }
}

// --- UTILS ---
function setLoading(isLoading, element) {
    if (isLoading) element.classList.remove('hidden');
    else element.classList.add('hidden');
}

function clearAll() {
    if (confirm('Clear all fields?')) {
        els.ideaInput.value = '';
        els.fRole.value = '';
        els.fSituation.value = '';
        els.fReason.value = '';
        els.fRules.value = '';
        els.fResult.value = '';
        els.outputContent.innerHTML = '<div class="text-center text-gray-400 mt-10"><p class="text-2xl mb-2">👋</p><p>Ready to test.</p></div>';
        generatedPrompt = '';
        els.promptPreview.textContent = '';
        els.previewArea.classList.add('hidden');
    }
}

function copyOutput() {
    const text = els.outputContent.innerText; // Get text without HTML
    navigator.clipboard.writeText(text).then(() => {
        const originalText = els.copyBtn.innerText;
        els.copyBtn.innerText = "Copied!";
        setTimeout(() => els.copyBtn.innerText = originalText, 2000);
    });
}

function exportJson() {
    const data = {
        idea: els.ideaInput.value,
        prompt: generatedPrompt,
        output: els.outputContent.innerHTML, // Exporting HTML for richness, or could use text
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4r4s-export-${Date.now()}.json`;
    a.click();
}

// --- HISTORY ---
// --- HISTORY SYSTEM (Server-Side) ---
async function loadHistory() {
    try {
        const res = await fetch('history.php');
        if (!res.ok) throw new Error("Failed to load history");
        historyData = await res.json();
    } catch (e) {
        console.error("History load error:", e);
        historyData = [];
    }
    renderHistory();
}

async function addToHistory(title, prompt, output) {
    const newItem = {
        id: Date.now(),
        title: title.substring(0, 30) + (title.length > 30 ? '...' : ''),
        prompt: prompt,
        output: output,
        timestamp: new Date().toLocaleString()
    };

    // Optimistic UI update
    historyData.unshift(newItem);
    if (historyData.length > 50) historyData.pop();
    renderHistory();

    // Sync to Server
    try {
        await fetch('history.php', {
            method: 'POST',
            body: JSON.stringify(newItem)
        });
    } catch (e) {
        console.error("History save error:", e);
    }
}

function renderHistory() {
    els.historyBar.innerHTML = '<span class="text-xs font-bold mr-2 sticky left-0 text-gray-500 z-10 py-1">RECENT:</span>';

    // Reverse needed? No, backend sends latest first usually, or we unshifted. 
    // If backend just appends, we need to sort. Our history.php unshifts, so it's good.

    historyData.forEach(item => {
        const chip = document.createElement('button');
        chip.className = "whitespace-nowrap px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white rounded-full text-[10px] transition-colors max-w-[150px] truncate";
        chip.textContent = item.title;
        chip.title = (item.timestamp || "") + "\n" + (item.prompt ? item.prompt.substring(0, 100) : "");

        chip.addEventListener('click', () => {
            // Restore
            if (item.prompt) {
                generatedPrompt = item.prompt;
                updatePromptPreview();
                els.promptPreview.textContent = item.prompt;
                Prism.highlightElement(els.promptPreview);
            }

            if (item.output && els.outputContent) {
                renderOutput(item.output, []);
            }
        });

        els.historyBar.appendChild(chip);
    });
}
