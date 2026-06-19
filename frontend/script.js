
// ==========================================================================
// CONSTANTS & CONFIG
// ==========================================================================
const API_BASE_URL = "http://127.0.0.1:5000";

// State to track upload file
let uploadedLeafFile = null;

// ==========================================================================
// INITIALIZATION ON LOAD
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Start Real-Time Date & Time Clock
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // Initialize SPA Tab Navigation
    initNavigation();

    // Check Backend Connection Status
    checkBackendConnection();
    // Periodically check API connection every 15 seconds
    setInterval(checkBackendConnection, 15000);

    // Initialize Drag & Drop listeners
    initDragAndDrop();
});

// ==========================================================================
// REAL-TIME CLOCK UTILITY
// ==========================================================================
function updateDateTime() {
    const dateEl = document.getElementById("topbar-date");
    if (!dateEl) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// ==========================================================================
// BACKEND API STATUS CHECK
// ==========================================================================
async function checkBackendConnection() {
    const dot = document.getElementById("api-status-dot");
    const text = document.getElementById("api-status-text");
    const pill = document.getElementById("connection-pill");
    const pillText = document.getElementById("connection-pill-text");

    try {
        const response = await fetch(API_BASE_URL + "/");
        if (response.ok) {
            // Online status update
            updateStatusUI(true, "API Online", dot, text, pill, pillText);
        } else {
            // Server error status update
            updateStatusUI(false, "API Error 500", dot, text, pill, pillText);
        }
    } catch (error) {
        // Offline status update
        updateStatusUI(false, "API Offline", dot, text, pill, pillText);
    }
}

function updateStatusUI(isOnline, statusMsg, dot, text, pill, pillText) {
    if (isOnline) {
        dot.className = "status-dot online";
        text.textContent = "Backend Service: Online";
        pill.className = "connection-pill online";
        pillText.textContent = "API Active";
    } else {
        dot.className = "status-dot offline";
        text.textContent = "Backend Service: Offline";
        pill.className = "connection-pill offline";
        pillText.textContent = statusMsg;
    }
}

// ==========================================================================
// SPA TAB NAVIGATION
// ==========================================================================
function initNavigation() {
    const menuLinks = document.querySelectorAll(".menu-item");
    const mobileToggle = document.getElementById("mobile-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const topTitle = document.getElementById("topbar-title");

    // Click handler for tab switching
    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetTab = link.getAttribute("data-tab");
            
            // Close mobile menu if open
            sidebar.classList.remove("open");
            overlay.classList.remove("open");

            if (targetTab === "placeholder") {
                e.preventDefault();
                // Handle Placeholder custom render
                const pName = link.getAttribute("data-placeholder-name");
                const pIcon = link.getAttribute("data-placeholder-icon");
                setupPlaceholderScreen(pName, pIcon);
                
                // Update navigation visual states
                menuLinks.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                topTitle.textContent = pName;
                
                // Toggle active section
                toggleActiveTabSection("placeholder-tab");
            } else {
                // Standard routing
                switchTab(targetTab);
            }
        });
    });

    // Mobile Hamburger Toggle
    if (mobileToggle) {
        mobileToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("open");
        });
    }

    // Mobile Overlay click
    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("open");
        });
    }
}

function switchTab(tabId) {
    const menuLinks = document.querySelectorAll(".menu-item");
    const topTitle = document.getElementById("topbar-title");
   
    // Find matching link
    const targetLink = Array.from(menuLinks).find(l => l.getAttribute("data-tab") === tabId);
    if (!targetLink) return;

    // Update active nav state
    menuLinks.forEach(l => l.classList.remove("active"));
    targetLink.classList.add("active");

    // Update Topbar Title
    let pageTitle = "Dashboard";
    if (tabId === "yield") pageTitle = "Crop Yield Predictor";
    if (tabId === "disease") pageTitle = "Leaf Disease Scanner";
    if (tabId === "crop") pageTitle = "Crop Recommendation";
    if (tabId === "fertilizer") pageTitle = "Fertilizer Advisor";
    if (tabId === "market") pageTitle = "Market Prices";
    if (tabId === "chatbot") pageTitle = "Farmer Chatbot";
    topTitle.textContent = pageTitle;

    // Toggle active section view
    toggleActiveTabSection(tabId + "-tab");
}

function toggleActiveTabSection(activeSectionId) {
    const sections = document.querySelectorAll(".tab-content");
    sections.forEach(sec => {
        if (sec.id === activeSectionId) {
            sec.classList.add("active");
        } else {
            sec.classList.remove("active");
        }
    });
}

function setupPlaceholderScreen(name, iconName) {
    const titleEl = document.getElementById("placeholder-title");
    const iconEl = document.getElementById("placeholder-icon");
    
    titleEl.textContent = name;
    iconEl.setAttribute("data-lucide", iconName);
    lucide.createIcons();
}

// ==========================================================================
// CROP YIELD REGRESSION DISPATCHER
// ==========================================================================
async function handleYieldSubmit(event) {
    event.preventDefault();

    // DOM Elements
    const emptyState = document.getElementById("yield-empty-state");
    const loadingState = document.getElementById("yield-loading-state");
    const resultDisplay = document.getElementById("yield-result-display");

    // Inputs values
    const area = document.getElementById("area").value.trim();
    const item = document.getElementById("item").value.trim();
    const year = parseInt(document.getElementById("year").value);
    const rainfall = parseFloat(document.getElementById("rainfall").value);
    const pesticides = parseFloat(document.getElementById("pesticides").value);
    const temperature = parseFloat(document.getElementById("temperature").value);

    // Validation checks
    if (!area || !item || isNaN(year) || isNaN(rainfall) || isNaN(pesticides) || isNaN(temperature)) {
        alert("Please fill in all environmental parameters with valid numbers.");
        return;
    }

    // Toggle UI States to Loading
    emptyState.classList.add("hidden");
    resultDisplay.classList.add("hidden");
    loadingState.classList.remove("hidden");

    try {
        const response = await fetch(`${API_BASE_URL}/predict_yield`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ area, item, year, rainfall, pesticides, temperature })
        });

        const data = await response.json();

        if (data.success) {
            // Process prediction value
            const predRawVal = data.predicted_yield;
            
            // hg/ha to Tonnes/ha = divide by 10,000
            const tonnesHa = (predRawVal / 10000).toFixed(4);
            // hg/ha to kg/ha = divide by 10
            const kgHa = (predRawVal / 10).toFixed(2);

            // Populate Results UI
            document.getElementById("yield-val-hg-ha").textContent = predRawVal.toLocaleString(undefined, { maximumFractionDigits: 2 });
            document.getElementById("yield-val-tonnes-ha").textContent = parseFloat(tonnesHa).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
            document.getElementById("yield-val-kg-ha").textContent = parseFloat(kgHa).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // Populate summary values
            document.getElementById("summary-area").textContent = area;
            document.getElementById("summary-item").textContent = item;
            document.getElementById("summary-year").textContent = year;
            document.getElementById("summary-rainfall").textContent = rainfall;
            document.getElementById("summary-pesticides").textContent = pesticides;
            document.getElementById("summary-temp").textContent = temperature;

            // Render Results Card
            loadingState.classList.add("hidden");
            resultDisplay.classList.remove("hidden");
        } else {
            showYieldError(data.error || "Model failed to compute prediction.");
        }

    } catch (error) {
        console.error("Yield Predictor Error:", error);
        showYieldError("Connection to backend agricultural model failed.");
    }
}

function showYieldError(message) {
    const emptyState = document.getElementById("yield-empty-state");
    const loadingState = document.getElementById("yield-loading-state");
    const resultDisplay = document.getElementById("yield-result-display");

    loadingState.classList.add("hidden");
    resultDisplay.classList.add("hidden");
    emptyState.classList.remove("hidden");

    // Alert simple error
    alert("Yield Model Error: " + message);
}

// ==========================================================================
// LEAF IMAGE SELECTORS & PREVIEW
// ==========================================================================
function initDragAndDrop() {
    const uploadZone = document.getElementById("upload-zone");
    if (!uploadZone) return;

    // Trigger file input click
    uploadZone.addEventListener("click", () => {
        if (!uploadedLeafFile) {
            document.getElementById("leafImage").click();
        }
    });

    // Drag-over styling
    uploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadZone.classList.add("dragover");
    });

    uploadZone.addEventListener("dragleave", () => {
        uploadZone.classList.remove("dragover");
    });

    // Drop handler
    uploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadZone.classList.remove("dragover");
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processSelectedImage(files[0]);
        }
    });
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processSelectedImage(file);
    }
}

function processSelectedImage(file) {
    // Basic format validation
    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid leaf image file (PNG/JPG).");
        return;
    }

    uploadedLeafFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById("preview");
        const previewWrapper = document.getElementById("preview-wrapper");
        const uploadPrompt = document.getElementById("upload-prompt");

        preview.src = e.target.result;
        uploadPrompt.classList.add("hidden");
        previewWrapper.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
}

function clearLeafImage(event) {
    if (event) {
        event.stopPropagation(); // Avoid triggering parent upload click
    }
    
    uploadedLeafFile = null;
    document.getElementById("leafImage").value = "";
    
    const preview = document.getElementById("preview");
    const previewWrapper = document.getElementById("preview-wrapper");
    const uploadPrompt = document.getElementById("upload-prompt");
    
    preview.src = "";
    previewWrapper.classList.add("hidden");
    uploadPrompt.classList.remove("hidden");

    // Also reset results section back to empty state
    resetDiseaseResults();
}

function resetDiseaseResults() {
    document.getElementById("disease-empty-state").classList.remove("hidden");
    document.getElementById("disease-loading-state").classList.add("hidden");
    document.getElementById("disease-result-display").classList.add("hidden");
    document.getElementById("upload-zone").classList.remove("scanning");
}

// ==========================================================================
// DISEASE DETECTION COMPUTER VISION DISPATCHER
// ==========================================================================
async function runDiseaseDetection() {
    if (!uploadedLeafFile) {
        alert("Please select or drag a crop leaf image first.");
        return;
    }

    // DOM Elements
    const uploadZone = document.getElementById("upload-zone");
    const emptyState = document.getElementById("disease-empty-state");
    const loadingState = document.getElementById("disease-loading-state");
    const resultDisplay = document.getElementById("disease-result-display");
    const submitBtn = document.getElementById("disease-submit-btn");

    // Toggle UI States to Processing / Scanning
    emptyState.classList.add("hidden");
    resultDisplay.classList.add("hidden");
    loadingState.classList.remove("hidden");
    uploadZone.classList.add("scanning");
    submitBtn.disabled = true;

    // Create payload
    const formData = new FormData();
    formData.append("image", uploadedLeafFile);

    try {
        const response = await fetch(`${API_BASE_URL}/predict_disease`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // Turn off loading animation
        loadingState.classList.add("hidden");
        uploadZone.classList.remove("scanning");
        submitBtn.disabled = false;

        if (data.success) {
            // Render results
            const isHealthy = data.disease.toLowerCase().includes("healthy");
            const badge = document.getElementById("disease-status-badge");
            
            // Format status badge based on disease diagnosis
            if (isHealthy) {
                badge.className = "result-badge success";
                badge.innerHTML = `<i data-lucide="check-circle-2"></i> Plant Leaf Healthy`;
            } else {
                badge.className = "result-badge alert";
                badge.innerHTML = `<i data-lucide="alert-triangle"></i> Disease Infection Detected`;
            }

            // Populate Disease details
            document.getElementById("disease-detected-name").textContent = data.disease;
            document.getElementById("treatment-recommendation").textContent = data.treatment;
            
            // Animate confidence bar progress meter
            const confVal = parseFloat(data.confidence).toFixed(2);
            document.getElementById("confidence-percentage").textContent = `${confVal}%`;
            
            const confFillBar = document.getElementById("confidence-bar-fill");
            confFillBar.style.width = "0%"; // reset first
            
            setTimeout(() => {
                confFillBar.style.width = `${confVal}%`;
                // Color code the progress bar based on confidence / health
                if (isHealthy) {
                    confFillBar.style.background = "linear-gradient(90deg, #10b981 0%, #34d399 100%)";
                } else {
                    confFillBar.style.background = "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)";
                }
            }, 100);

            // Re-render Lucide icons inserted dynamically
            lucide.createIcons();

            // Display result
            resultDisplay.classList.remove("hidden");
        } else {
            resetDiseaseResults();
            alert("Disease Scanner Error: " + (data.error || "Diagnostic failure."));
        }

    } catch (error) {
        console.error("Disease Diagnostic Error:", error);
        resetDiseaseResults();
        submitBtn.disabled = false;
        alert("Disease Scanner Error: Connection to backend image model failed.");
    }
}
// ==========================================================================
// CROP RECOMMENDATION
// ==========================================================================

async function recommendCrop() {

    const N = parseFloat(document.getElementById("cropN").value);
    const P = parseFloat(document.getElementById("cropP").value);
    const K = parseFloat(document.getElementById("cropK").value);

    const temperature = parseFloat(
        document.getElementById("cropTemp").value
    );

    const humidity = parseFloat(
        document.getElementById("cropHumidity").value
    );

    const ph = parseFloat(
        document.getElementById("cropPh").value
    );

    const rainfall = parseFloat(
        document.getElementById("cropRainfall").value
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}/recommend_crop`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    N,
                    P,
                    K,
                    temperature,
                    humidity,
                    ph,
                    rainfall
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            document.getElementById(
                "cropResult"
            ).innerText = data.recommended_crop;

        } else {

            alert(data.error);

        }

    } catch (error) {

        console.error(error);

        alert(
            "Failed to connect to Crop Recommendation API"
        );

    }

}

// ==========================================================================
// FERTILIZER ADVISOR
// ==========================================================================

async function getFertilizer() {

    const N = parseFloat(
        document.getElementById("fertN").value
    );

    const P = parseFloat(
        document.getElementById("fertP").value
    );

    const K = parseFloat(
        document.getElementById("fertK").value
    );

    try {

        const response = await fetch(
            `${API_BASE_URL}/fertilizer_advisor`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    N,
                    P,
                    K
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            document.getElementById(
                "fertilizerResult"
            ).innerText = data.fertilizer;

            document.getElementById(
                "fertilizerReason"
            ).innerText = data.reason;

        } else {

            alert(data.error);

        }

    } catch (error) {

        console.error(error);

        alert(
            "Failed to connect to Fertilizer Advisor API"
        );

    }

}


// ==========================================================================
// MARKET PRICES
// ==========================================================================

async function getMarketPrice() {

    const crop = document.getElementById(
        "marketCrop"
    ).value;

    try {

        const response = await fetch(
            `${API_BASE_URL}/market_price`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    crop
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            document.getElementById(
                "marketPrice"
            ).innerText = data.price;

            document.getElementById(
                "marketTrend"
            ).innerText =
                "Trend: " + data.trend;

            document.getElementById(
                "marketRecommendation"
            ).innerText =
                "Recommendation: " +
                data.recommendation;

        } else {

            alert(data.error);

        }

    } catch (error) {

        console.error(error);

        alert(
            "Failed to connect to Market Price API"
        );

    }

}

// ==========================================================================
// CHATBOT
// ==========================================================================

async function askChatbot() {

  

    const message = document.getElementById(
        "chatMessage"
    ).value;

    if (!message) {
        alert("Please enter a question.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/chatbot`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message
                })
            }
        );

       const data = await response.json();



       if (data.success) {

    document.getElementById(
        "chatbotResponse"
    ).innerHTML =
        data.response.replace(/\n/g, "<br>");

} else {

    document.getElementById(
        "chatbotResponse"
    ).innerText = data.error;

}

    } catch (error) {

        console.error(error);

        document.getElementById(
            "chatbotResponse"
        ).innerText =
            "Failed to connect to chatbot.";

    }

}
