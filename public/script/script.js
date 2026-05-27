// State variables
let databaseBundle = null; // Stores both languages {en: [...], th: [...]} if available
let currentData = [];      // Contains the active list of theorems for the currently chosen language
let viewMode = 'dashboard';
let showOnlyBookmarks = false;
let currentLang = localStorage.getItem('app-lang') || 'en'; // English as default baseline
let localizationData = null;

// Storage Keys
const storageKey = 'set_theory_reader_progress_v4_vanilla';
const bookmarkKey = 'set_theory_reader_bookmarks_v4_vanilla';
let completedTheorems = JSON.parse(localStorage.getItem(storageKey)) || [];
let bookmarkedTheorems = JSON.parse(localStorage.getItem(bookmarkKey)) || [];

// On Page Load
window.onload = function () {
    // Apply Dark/Light System Settings
    if (localStorage.getItem('dark-mode') === 'true' ||
        (!('dark-mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateDarkModeUI(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateDarkModeUI(false);
    }

    // Fetch languages.json Dictionary and Initialize App UI
    fetch('languages.json')
        .then(response => response.json())
        .then(data => {
            localizationData = data;
            applyLocalizationUI();

            // Try loading default mathematical dataset (01_Set.json) as the initial demo
            loadDataset('../knowledge_db/01_Set.json');
        })
        .catch(err => {
            console.error("Critical: Could not load localization system keys", err);
        });
};

// Attempt to fetch 01_Set.json on startup to provide immediate feedback
function loadDataset(db) {
    fetch(db)
        .then(response => response.json())
        .then(data => {
            executeLoader(500);
            processParsedData(data);
            renderAll();
        })
        .catch(err => {
            executeLoader(500);
            console.warn("Initial automatic load of ", db, " failed. Standing by for manual user upload.", err);
            renderAll(); // Fallback to empty state waiting for manual drop
        });
}

// Process parsed JSON to handle both standard single arrays and 2-language bundled formats like 01_Set.json
function processParsedData(parsed) {
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // Format has explicit language packs (e.g., {"en": [...], "th": [...]})
        databaseBundle = parsed;

        // Pick language subset or fallback
        const selectedList = databaseBundle[currentLang] || databaseBundle['en'] || databaseBundle['th'] || [];
        currentData = sanitizeAndMapList(selectedList);
    } else if (Array.isArray(parsed)) {
        // Format is a single-language fallback array
        databaseBundle = null; // Clear bundle
        currentData = sanitizeAndMapList(parsed);
    } else {
        throw new Error("Invalid format");
    }
}

// Map uploaded data properties carefully to prevent undefined issues
function sanitizeAndMapList(list) {
    return list.map((item, i) => ({
        id: item.id || `theorem-${i + 1}`,
        index: item.index || (i + 1),
        title: item.title || 'Untitled Theorem',
        how: item.how || '',
        useTo: item.useTo || '',
        ex: item.ex || ''
    }));
}

// Apply UI texts globally according to active language state
function applyLocalizationUI() {
    if (!localizationData) return;
    const langPack = localizationData.ui[currentLang];

    // HTML Lang Attr updates
    document.documentElement.lang = currentLang;

    // Direct string mappings
    document.getElementById('lblAppSubTitle').textContent = langPack.appSubTitle;
    document.getElementById('lblUploadBtn').textContent = langPack.uploadBtn;
    document.getElementById('lblDragBoxMain').textContent = langPack.dragBoxMain;
    document.getElementById('lblDragBoxSub').textContent = langPack.dragBoxSub;
    document.getElementById('lblProgressTitle').textContent = langPack.progressTitle;
    document.getElementById('lblResetProgress').textContent = langPack.resetProgress;
    document.getElementById('lblSearchTitle').textContent = langPack.searchTitle;
    document.getElementById('searchInput').placeholder = langPack.searchPlaceholder;
    document.getElementById('lblDisplayModeTitle').textContent = langPack.displayModeTitle;
    document.getElementById('lblViewDashboard').textContent = langPack.viewDashboard;
    document.getElementById('lblViewJson').textContent = langPack.viewJson;
    document.getElementById('lblFilterFavorite').textContent = langPack.filterFavorite;
    document.getElementById('lblQuickJumpTitle').textContent = langPack.quickJumpTitle;
    document.getElementById('docTitle').textContent = langPack.heroTitle;
    document.getElementById('docDesc').textContent = langPack.heroDesc;
    document.getElementById('lblJsonHeader').textContent = langPack.jsonHeader;
    document.getElementById('lblJsonCopyBtn').textContent = langPack.jsonCopyBtn;
    document.getElementById('lblFooterSafe').textContent = langPack.footerSafe;
    document.getElementById('lblFooterMathJax').textContent = langPack.footerMathJax;

    // Toggle language trigger badge look
    document.getElementById('langIcon').textContent = currentLang === 'en' ? 'TH' : 'EN';
}

// Language Switching Module
function toggleLanguage() {
    executeLoader(350);
    currentLang = currentLang === 'en' ? 'th' : 'en';
    localStorage.setItem('app-lang', currentLang);
    applyLocalizationUI();

    // Re-localize from databaseBundle if active
    if (databaseBundle) {
        const selectedList = databaseBundle[currentLang] || databaseBundle['en'] || databaseBundle['th'] || [];
        currentData = sanitizeAndMapList(selectedList);
    }

    renderAll();
}

// Dark/Light Theme Switching
function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dark-mode', isDark);
    updateDarkModeUI(isDark);
}

function updateDarkModeUI(isDark) {
    const icon = document.getElementById('darkModeIcon');
    if (isDark) {
        icon.className = 'fa-solid fa-sun text-lg';
        icon.style.color = 'var(--color-amber)';
    } else {
        icon.className = 'fa-solid fa-moon text-lg';
        icon.style.color = 'var(--color-text-muted)';
    }
}

// Sanitizer Function to prevent Math `<` and `>` characters from being parsed as invalid HTML elements
function sanitizeMathText(text) {
    if (!text) return '';

    const validTags = [];
    let placeholderIndex = 0;

    // 1. Temporarily replace valid design HTML tags to protect them from escaping
    let processed = text.replace(/<(br|strong|em|span|div|p|ul|li|code)([^>]*)>|<\/(br|strong|em|span|div|p|ul|li|code)>/gi, (match) => {
        validTags.push(match);
        return `__VALID_HTML_TAG_HOLDER_${placeholderIndex++}__`;
    });

    // 2. Safely escape remaining math-conflicting symbols (< and >)
    processed = processed.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 3. Restore preserved design tags back to life
    processed = processed.replace(/__VALID_HTML_TAG_HOLDER_(\d+)__/g, (match, index) => {
        return validTags[parseInt(index)];
    });

    return processed;
}

// 1 FUNCTION TO BUILD 1 BOX (3-Row Stacked Card Construction in Vanilla CSS)
function createTheoremCard(t) {
    const isCompleted = completedTheorems.includes(t.id);
    const isBookmarked = bookmarkedTheorems.includes(t.id);
    const langPack = localizationData ? localizationData.ui[currentLang] : { howLabel: 'How', useToLabel: 'Use to', exLabel: 'Example' };

    // Container building
    const card = document.createElement('section');
    card.id = `card-${t.id}`;
    card.className = 'card';
    if (isCompleted) {
        card.style.borderColor = 'var(--color-emerald)';
        card.style.boxShadow = '0 0 8px #10b98126';
    }

    // Card Header Bar
    const header = document.createElement('div');
    header.className = 'card-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'card-header-left';

    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = t.index;

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = t.title;

    headerLeft.appendChild(badge);
    headerLeft.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.onclick = () => toggleBookmark(t.id);
    bookmarkBtn.className = `bookmark-btn ${isBookmarked ? 'active' : ''}`;
    bookmarkBtn.innerHTML = `<i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;

    const completeBtn = document.createElement('button');
    completeBtn.onclick = () => toggleCompleted(t.id);
    completeBtn.className = `complete-btn ${isCompleted ? 'active' : ''}`;
    completeBtn.innerHTML = `
                <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i>
                <span>${isCompleted ? (currentLang === 'en' ? 'Learned' : 'เข้าใจแล้ว') : (currentLang === 'en' ? 'Mark Read' : 'ติ๊กเข้าใจแล้ว')}</span>
            `;

    actions.appendChild(bookmarkBtn);
    actions.appendChild(completeBtn);
    header.appendChild(headerLeft);
    header.appendChild(actions);
    card.appendChild(header);

    // Card Body (3-Row Layout Stacked Vertically)
    const body = document.createElement('div');
    body.className = 'card-body';

    // Row 1: HOW (Statement/Theory)
    const rowHow = document.createElement('div');
    rowHow.className = 'card-row';

    const headerHow = document.createElement('div');
    headerHow.className = 'row-header row-header-how';
    headerHow.innerHTML = ` <span class="row-header-badge highlight-how">
                                <span class="row-bullet"></span>
                                ${langPack.howLabel}
                            </span>`;

    const contentHow = document.createElement('div');
    contentHow.className = 'row-content-box content-box-how math-scroll-wrapper';
    contentHow.innerHTML = sanitizeMathText(t.how) || `<span style="color: var(--color-text-muted);">${currentLang === 'en' ? 'No information provided' : 'ไม่มีข้อมูลระบุไว้'}</span>`;

    rowHow.appendChild(headerHow);
    rowHow.appendChild(contentHow);

    // Row 2: USE TO (Applications)
    const rowUse = document.createElement('div');
    rowUse.className = 'card-row';

    const headerUse = document.createElement('div');
    headerUse.className = 'row-header row-header-use';
    headerUse.innerHTML = ` <span class="row-header-badge highlight-use">
                                <span class="row-bullet"></span>
                                ${langPack.useToLabel}
                            </span>`;

    const contentUse = document.createElement('div');
    contentUse.className = 'row-content-box content-box-use';
    contentUse.innerHTML = sanitizeMathText(t.useTo) || `<span style="color: var(--color-text-muted);">${currentLang === 'en' ? 'No information provided' : 'ไม่มีข้อมูลระบุไว้'}</span>`;

    rowUse.appendChild(headerUse);
    rowUse.appendChild(contentUse);

    // Row 3: EXAMPLE (Example mathematical proof)
    const rowEx = document.createElement('div');
    rowEx.className = 'card-row';

    const headerEx = document.createElement('div');
    headerEx.className = 'row-header row-header-ex';
    headerEx.innerHTML = `  <span class="row-header-badge highlight-ex">
                                <span class="row-bullet"></span>
                                ${langPack.exLabel}
                            </span>`;

    const contentEx = document.createElement('div');
    contentEx.className = 'row-content-box content-box-ex math-scroll-wrapper';
    contentEx.innerHTML = sanitizeMathText(t.ex) || `<span style="color: var(--color-text-muted);">${currentLang === 'en' ? 'No practical examples provided' : 'ไม่มีแนวคำตอบจำลอง'}</span>`;

    rowEx.appendChild(headerEx);
    rowEx.appendChild(contentEx);

    body.appendChild(rowHow);
    body.appendChild(rowUse);
    body.appendChild(rowEx);
    card.appendChild(body);

    return card;
}

// Render Dashboard Manager
function renderDashboard() {
    const container = document.getElementById('dashboardView');
    container.innerHTML = "";
    if (!localizationData) return;

    const langPack = localizationData.ui[currentLang];

    if (currentData.length === 0) {
        const emptyBox = document.createElement('div');
        emptyBox.className = "empty-state";
        emptyBox.innerHTML = `
                    <div class="empty-icon">
                        <i class="fa-solid fa-folder-open"></i>
                    </div>
                    <h3 class="empty-title">${langPack.emptyTitle}</h3>
                    <p class="empty-desc">${langPack.emptyDesc}</p>
                    <button onclick="loadDataset('../knowledge_db/01_Set.json');" class="btn btn-primary" style="margin-top: 16px;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>${langPack.emptyBtn}</span>
                    </button>
                `;
        container.appendChild(emptyBox);
        return;
    }

    const filtered = getFilteredTheorems();

    if (filtered.length === 0) {
        const noResultBox = document.createElement('div');
        noResultBox.className = "empty-state";
        noResultBox.innerHTML = `
                    <div class="empty-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <h3 class="empty-title">${langPack.noResultTitle}</h3>
                    <p class="empty-desc">${langPack.noResultDesc}</p>
                `;
        container.appendChild(noResultBox);
        return;
    }

    filtered.forEach(t => {
        const cardNode = createTheoremCard(t);
        container.appendChild(cardNode);
    });
}

// Sidebar Index Generator
function renderSidebarIndex() {
    const container = document.getElementById('fastJumpList');
    container.innerHTML = "";
    if (!localizationData) return;

    if (currentData.length === 0) {
        container.innerHTML = `<span style="font-size: 12px; color: var(--color-text-muted); display: block; padding: 4px;">${localizationData.ui[currentLang].noIndex}</span>`;
        return;
    }

    currentData.forEach(t => {
        const isCompleted = completedTheorems.includes(t.id);
        const isBookmarked = bookmarkedTheorems.includes(t.id);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'index-item';

        const button = document.createElement('button');
        button.onclick = () => scrollToTheorem(t.id);
        button.className = 'index-link-btn';

        const badge = document.createElement('span');
        badge.className = `index-badge ${isCompleted ? 'checked' : ''}`;
        badge.innerHTML = isCompleted ? '<i class="fa-solid fa-check"></i>' : t.index;

        const textSpan = document.createElement('span');
        textSpan.className = "truncate block w-full break-all";
        textSpan.textContent = t.title;

        button.appendChild(badge);
        button.appendChild(textSpan);
        itemDiv.appendChild(button);

        if (isBookmarked) {
            const star = document.createElement('i');
            star.className = "fa-solid fa-star";
            star.style.color = "var(--color-amber)";
            star.style.fontSize = "11px";
            star.style.marginLeft = "4px";
            itemDiv.appendChild(star);
        }

        container.appendChild(itemDiv);
    });
}

// Unified rendering coordinator
function renderAll() {
    renderDashboard();
    renderSidebarIndex();
    updateProgress();
    renderRawJsonView();
    triggerMathJax();
}

// Render Raw JSON
function renderRawJsonView() {
    const container = document.getElementById('jsonRawDisplay');
    // If we have loaded a complete bilingual bundle, show the whole parsed bundle in the code tab
    const dataToDisplay = databaseBundle ? databaseBundle : currentData;
    container.textContent = JSON.stringify(dataToDisplay, null, 4);
}

// Copy raw JSON code to user clipboard
function copyCurrentJson() {
    if (!localizationData) return;
    const langPack = localizationData.ui[currentLang];

    if (currentData.length === 0) {
        showToast(langPack.toastCopyError, "error");
        return;
    }
    const dataToCopy = databaseBundle ? databaseBundle : currentData;
    const jsonText = JSON.stringify(dataToCopy, null, 4);
    const textarea = document.createElement('textarea');
    textarea.value = jsonText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(langPack.toastCopySuccess, "success");
    } catch (err) {
        console.error("Could not copy code", err);
    }
    document.body.removeChild(textarea);
}

// Scroll smoothly to card
function scrollToTheorem(id) {
    switchViewMode('dashboard');

    setTimeout(() => {
        const element = document.getElementById(`card-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.outline = '4px solid #0e90e94d';
            setTimeout(() => {
                element.style.outline = 'none';
            }, 1500);
        }
    }, 100);
}

// MathJax Force Trigger
function triggerMathJax() {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(function (err) {
            console.error("MathJax rendering failed: " + err.message);
        });
    }
}

// Bookmark Toggle logic
function toggleBookmark(id) {
    const idx = bookmarkedTheorems.indexOf(id);
    if (idx > -1) {
        bookmarkedTheorems.splice(idx, 1);
    } else {
        bookmarkedTheorems.push(id);
    }
    localStorage.setItem(bookmarkKey, JSON.stringify(bookmarkedTheorems));
    renderAll();
}

// Completion Toggle logic
function toggleCompleted(id) {
    const idx = completedTheorems.indexOf(id);
    if (idx > -1) {
        completedTheorems.splice(idx, 1);
    } else {
        completedTheorems.push(id);
    }
    localStorage.setItem(storageKey, JSON.stringify(completedTheorems));
    renderAll();
}

// Progress Calculation
function updateProgress() {
    const total = currentData.length;
    const completedCount = completedTheorems.filter(id => currentData.some(t => t.id === id)).length;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    document.getElementById('progressPercent').innerText = `${percent}%`;

    if (localizationData) {
        let ratioTemplate = localizationData.ui[currentLang].progressRatio;
        document.getElementById('progressRatio').innerText = ratioTemplate
            .replace('{completed}', completedCount)
            .replace('{total}', total);
    }

    document.getElementById('progressBar').style.width = `${percent}%`;
}

// Reset All Progress keys
function resetProgress() {
    completedTheorems = [];
    localStorage.setItem(storageKey, JSON.stringify(completedTheorems));
    renderAll();
}

// Change View Modes
function switchViewMode(mode) {
    viewMode = mode;
    const dash = document.getElementById('dashboardView');
    const jView = document.getElementById('jsonViewContainer');

    const btnDash = document.getElementById('btnViewDashboard');
    const btnJson = document.getElementById('btnViewJson');

    if (mode === 'dashboard') {
        dash.classList.remove('hidden');
        jView.classList.add('hidden');
        btnDash.classList.add('active');
        btnJson.classList.remove('active');
    } else {
        dash.classList.add('hidden');
        jView.classList.remove('hidden');
        btnJson.classList.add('active');
        btnDash.classList.remove('active');
    }
    triggerMathJax();
}

// Bookmark Filter switch
function toggleBookmarkFilter() {
    showOnlyBookmarks = !showOnlyBookmarks;
    const sw = document.getElementById('bookmarkSwitch');
    const btn = document.getElementById('btnFilterBookmark');

    if (showOnlyBookmarks) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
    renderDashboard();
    triggerMathJax();
}

// Search trigger
function filterTheorems() {
    renderDashboard();
    triggerMathJax();
}

function getFilteredTheorems() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    return currentData.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(query) ||
            t.how.toLowerCase().includes(query) ||
            t.useTo.toLowerCase().includes(query) ||
            t.ex.toLowerCase().includes(query);

        const matchesBookmark = !showOnlyBookmarks || bookmarkedTheorems.includes(t.id);

        return matchesSearch && matchesBookmark;
    });
}

// File system triggerers
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        readFile(file);
    }
}

// Drag and Drop implementation
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.add('active');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.remove('active');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file) {
        readFile(file);
    }
}

// Read and decode uploaded file JSON content
function readFile(file) {
    executeLoader(800);
    const reader = new FileReader();
    const langPack = localizationData ? localizationData.ui[currentLang] : null;
    reader.onload = function (e) {
        try {
            const parsed = JSON.parse(e.target.result);

            // Attempt parsing sequence
            processParsedData(parsed);
            renderAll();

            if (langPack) {
                showToast(langPack.toastUploadSuccess.replace('{name}', file.name), "success");
                const db_selector = document.getElementById('db_selector');
                db_selector.value = "upload";
            }
        } catch (err) {
            console.error("Upload process error", err);
            if (langPack) {
                showToast(langPack.toastUploadFormatError, "error");
            }
        }
    };
    reader.readAsText(file);
}

// Pure Vanilla CSS Alert Toast System
function showToast(msg, type = "success") {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast-box toast-${type}`;

    const icon = document.createElement('i');
    if (type === "success") {
        icon.className = "fa-solid fa-circle-check";
    } else {
        icon.className = "fa-solid fa-triangle-exclamation";
    }

    const text = document.createElement('span');
    text.textContent = msg;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Automatically clean up toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4000);
}

function handleDatabaseChange() {
    const langPack = localizationData ? localizationData.ui[currentLang] : null;
    const db_selector_value = document.getElementById('db_selector').value;
    const path = "../knowledge_db/" + db_selector_value;
    if (db_selector_value == "upload") {
        showToast(langPack.toastUploadFormatError, "error");
    } else {
        loadDataset(path);
        showToast(langPack.toastUploadSuccess.replace('{name}', db_selector_value), "success");
    }
}

function executeLoader(duration) {
    document.body.classList.add('loading-active');
    const screen = document.getElementById('loading-screen');
    screen.classList.remove('fade-out');
    const title = document.getElementById('loading-title');
    const number = document.getElementById('loading-number');
    const indicator = document.getElementById('progress-indicator');

    const startTimestamp = Date.now();

    const interval = setInterval(() => {
        const elapsed = Date.now() - startTimestamp;
        let progress = Math.min((elapsed / duration) * 100, 100);
        let currentPercent = Math.floor(progress);

        indicator.style.width = `${currentPercent}%`;
        number.textContent = `${currentPercent}%`;

        if (progress >= 100) {
            clearInterval(interval);
            title.textContent = 'Done!';

            setTimeout(() => {
                screen.classList.add('fade-out');
                document.body.classList.remove('loading-active');
            }, 200);
        }
    }, 25);
}