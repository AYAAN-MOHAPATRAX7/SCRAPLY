// State management
let currentBuyerId = "buyer_demo";
let currentUserRole = "BUYER";
let activeModalListing = null;
let isClaiming = false;
let filterDebounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    checkHealth();
    loadBuyerDashboard();
});

// Health check endpoint verification
async function checkHealth() {
    try {
        const res = await fetch("/health");
        const data = await res.json();
        const el = document.getElementById("system-status");
        if (data.status === "healthy") {
            if (data.api_key_configured) {
                el.textContent = "🟢 Gemma 4 & Buyer API Ready";
                el.style.color = "#10b981";
            } else {
                el.textContent = "🟡 Key Missing (Check .env)";
                el.style.color = "#eab308";
            }
        }
    } catch (e) {
        const el = document.getElementById("system-status");
        if (el) {
            el.textContent = "🔴 Service Offline";
            el.style.color = "#ef4444";
        }
    }
}

// View switcher (Buyer Marketplace vs HarvestGuard AI Engine)
function switchMainView(viewId) {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".main-view").forEach(v => v.classList.remove("active"));

    if (viewId === "buyer-view") {
        document.querySelectorAll(".nav-tab-btn")[0].classList.add("active");
        document.getElementById("buyer-view").classList.add("active");
        loadBuyerDashboard();
    } else {
        document.querySelectorAll(".nav-tab-btn")[1].classList.add("active");
        document.getElementById("harvestguard-view").classList.add("active");
    }
}

// User Role simulation change handler
function handleRoleChange(e) {
    currentUserRole = e.target.value;
    showToast(`Role switched to: ${currentUserRole}`, "info");
}

// Food Emojis helper
function getFoodEmoji(foodName) {
    if (!foodName) return "📦";
    const name = foodName.toLowerCase();
    if (name.includes("tomato")) return "🍅";
    if (name.includes("rice")) return "🌾";
    if (name.includes("apple")) return "🍎";
    if (name.includes("meal") || name.includes("food") || name.includes("box")) return "🍱";
    if (name.includes("mango")) return "🥭";
    if (name.includes("strawberr") || name.includes("fruit")) return "🍓";
    if (name.includes("potat")) return "🥔";
    if (name.includes("milk") || name.includes("dairy")) return "🥛";
    if (name.includes("banana")) return "🍌";
    return "🥦";
}

// Load Buyer Dashboard data
async function loadBuyerDashboard() {
    await Promise.all([
        fetchAvailableListings(),
        fetchBuyerClaims()
    ]);
}

function filterBuyerListings() {
    fetchAvailableListings();
}

function debounceFilterBuyerListings() {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => {
        fetchAvailableListings();
    }, 300);
}

function resetBuyerFilters() {
    document.getElementById("buyer-search-input").value = "";
    document.getElementById("filter-urgency").value = "";
    document.getElementById("filter-action").value = "";
    document.getElementById("sort-by").value = "latest";
    fetchAvailableListings();
}

// Fetch available food listings
async function fetchAvailableListings() {
    const grid = document.getElementById("available-food-grid");
    const loadingEl = document.getElementById("available-listings-loading");
    const emptyEl = document.getElementById("available-listings-empty");

    const q = document.getElementById("buyer-search-input")?.value.trim() || "";
    const urgency = document.getElementById("filter-urgency")?.value || "";
    const action = document.getElementById("filter-action")?.value || "";
    const sortBy = document.getElementById("sort-by")?.value || "latest";

    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (urgency) params.append("urgency", urgency);
    if (action) params.append("recommended_action", action);
    if (sortBy) params.append("sort_by", sortBy);

    loadingEl.classList.remove("hidden");
    emptyEl.classList.add("hidden");
    grid.innerHTML = "";

    try {
        const res = await fetch(`/api/buyer/listings?${params.toString()}`);
        const result = await res.json();

        loadingEl.classList.add("hidden");

        if (result.success && Array.isArray(result.data)) {
            const listings = result.data;
            document.getElementById("stat-available-count").textContent = listings.length;

            if (listings.length === 0) {
                emptyEl.classList.remove("hidden");
                return;
            }

            listings.forEach(listing => {
                grid.appendChild(createAvailableFoodCard(listing));
            });
        } else {
            emptyEl.classList.remove("hidden");
        }
    } catch (err) {
        loadingEl.classList.add("hidden");
        emptyEl.classList.remove("hidden");
        showToast("Failed to connect to Buyer API.", "error");
    }
}

// Fetch claims for logged in buyer
async function fetchBuyerClaims() {
    const grid = document.getElementById("my-claims-grid");
    const loadingEl = document.getElementById("my-claims-loading");
    const emptyEl = document.getElementById("my-claims-empty");

    loadingEl.classList.remove("hidden");
    emptyEl.classList.add("hidden");
    grid.innerHTML = "";

    try {
        const res = await fetch(`/api/buyer/claims?buyer_id=${encodeURIComponent(currentBuyerId)}`, {
            headers: {
                "X-Buyer-ID": currentBuyerId,
                "X-User-Role": currentUserRole
            }
        });
        const result = await res.json();

        loadingEl.classList.add("hidden");

        if (result.success && Array.isArray(result.data)) {
            const claims = result.data;
            document.getElementById("stat-claims-count").textContent = claims.length;

            if (claims.length === 0) {
                emptyEl.classList.remove("hidden");
                return;
            }

            claims.forEach(claimRecord => {
                grid.appendChild(createClaimedFoodCard(claimRecord));
            });
        } else {
            emptyEl.classList.remove("hidden");
        }
    } catch (err) {
        loadingEl.classList.add("hidden");
        emptyEl.classList.remove("hidden");
    }
}

// Create Card DOM element for AVAILABLE food
function createAvailableFoodCard(item) {
    const card = document.createElement("div");
    card.className = "food-card";

    const emoji = getFoodEmoji(item.food);
    const urgencyClass = (item.urgency || "medium").toLowerCase();
    const actionClass = (item.recommended_action || "sell").toLowerCase();

    // Distance display logic: ONLY show distance if available from map/location data
    let locationDistanceHtml = "";
    if (item.location) {
        locationDistanceHtml += `📍 ${item.location}`;
    }
    if (item.distance_km != null) {
        locationDistanceHtml += locationDistanceHtml ? ` • 🚗 <strong>${item.distance_km} km away</strong>` : `🚗 <strong>${item.distance_km} km away</strong>`;
    }

    const priceText = item.current_price != null ? `${item.currency || "INR"} ${item.current_price} / ${item.unit}` : "Price on request";
    const suggestedPriceText = item.suggested_price != null ? `Suggested: ${item.currency || "INR"} ${item.suggested_price}` : "";
    const discountText = item.suggested_discount_percent != null ? `${item.suggested_discount_percent}% OFF` : "";

    card.innerHTML = `
        <div>
            <div class="card-top">
                <div class="food-title-group">
                    <span class="food-icon">${emoji}</span>
                    <div class="food-title-text">
                        <h3>${escapeHtml(item.food)}</h3>
                        <span class="food-quantity">${item.quantity} ${escapeHtml(item.unit)}</span>
                    </div>
                </div>
                <div class="card-badges">
                    <span class="urgency-badge ${urgencyClass}">${item.urgency || "MEDIUM"}</span>
                    <span class="action-badge ${actionClass}">Rec: ${item.recommended_action || "SELL"}</span>
                </div>
            </div>

            <div class="card-middle">
                ${locationDistanceHtml ? `<div class="info-line">${locationDistanceHtml}</div>` : ""}
                <div class="price-row">
                    <span class="current-price">${priceText}</span>
                    ${discountText ? `<span class="discount-tag">${discountText}</span>` : ""}
                </div>
                ${suggestedPriceText ? `<div class="suggested-price">${suggestedPriceText}</div>` : ""}
                ${item.reason ? `<div class="card-reason">💡 ${escapeHtml(item.reason)}</div>` : ""}
            </div>
        </div>

        <div class="card-actions">
            <button class="btn-card-details" onclick="openListingModal('${item.id}')">View Details</button>
            <button class="btn-card-claim" id="claim-btn-${item.id}" onclick="claimListing('${item.id}')">Claim</button>
        </div>
    `;

    return card;
}

// Create Card DOM element for CLAIMED food
function createClaimedFoodCard(claimRecord) {
    const item = claimRecord.listing || {};
    const card = document.createElement("div");
    card.className = "food-card";
    card.style.borderColor = "#3b82f6";

    const emoji = getFoodEmoji(item.food);
    const urgencyClass = (item.urgency || "medium").toLowerCase();
    const claimedDateStr = claimRecord.claimed_at ? new Date(claimRecord.claimed_at).toLocaleDateString() : "Recently";

    card.innerHTML = `
        <div>
            <div class="card-top">
                <div class="food-title-group">
                    <span class="food-icon">${emoji}</span>
                    <div class="food-title-text">
                        <h3>${escapeHtml(item.food || "Claimed Item")}</h3>
                        <span class="food-quantity">${item.quantity || ""} ${escapeHtml(item.unit || "")}</span>
                    </div>
                </div>
                <div class="card-badges">
                    <span class="status-pill claimed">STATUS: CLAIMED</span>
                    <span class="urgency-badge ${urgencyClass}">${item.urgency || "MEDIUM"}</span>
                </div>
            </div>

            <div class="card-middle">
                ${item.location ? `<div class="info-line">📍 ${escapeHtml(item.location)}</div>` : ""}
                <div class="info-line">📅 Claimed on: <strong>${claimedDateStr}</strong></div>
                <div class="info-line">🆔 Claim ID: <code>${claimRecord.id}</code></div>
                ${item.reason ? `<div class="card-reason">💡 ${escapeHtml(item.reason)}</div>` : ""}
            </div>
        </div>

        <div class="card-actions">
            <button class="btn-card-details" style="width:100%" onclick="openListingModal('${item.id || claimRecord.listing_id}')">View Details</button>
        </div>
    `;

    return card;
}

// Claim API Call with prevention of duplicate clicks and role validation
async function claimListing(listingId) {
    if (isClaiming) return;

    const claimBtn = document.getElementById(`claim-btn-${listingId}`);
    const originalText = claimBtn ? claimBtn.innerHTML : "Claim";

    if (claimBtn) {
        claimBtn.disabled = true;
        claimBtn.innerHTML = "<span>Claiming...</span>";
    }

    if (activeModalListing && activeModalListing.id === listingId) {
        const modalBtn = document.getElementById("modal-claim-btn");
        if (modalBtn) {
            modalBtn.disabled = true;
            modalBtn.innerHTML = "<span>Claiming...</span>";
        }
    }

    isClaiming = true;

    try {
        const res = await fetch(`/api/buyer/listings/${listingId}/claim`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Role": currentUserRole,
                "X-Buyer-ID": currentBuyerId
            }
        });

        const result = await res.json();
        isClaiming = false;

        if (result.success) {
            showToast("🎉 Food listing successfully claimed!", "success");
            closeListingModal();
            loadBuyerDashboard();
        } else {
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.innerHTML = originalText;
            }
            if (activeModalListing && activeModalListing.id === listingId) {
                const modalBtn = document.getElementById("modal-claim-btn");
                if (modalBtn) {
                    modalBtn.disabled = false;
                    modalBtn.innerHTML = "<span>🛒 Claim Food Listing</span>";
                }
            }
            showToast(result.error?.message || "Failed to claim listing.", "error");
        }
    } catch (err) {
        isClaiming = false;
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.innerHTML = originalText;
        }
        showToast("Network error while claiming food listing.", "error");
    }
}

// Open Listing Modal details
async function openListingModal(listingId) {
    try {
        const res = await fetch(`/api/buyer/listings/${listingId}`);
        const result = await res.json();

        if (result.success && result.data) {
            activeModalListing = result.data;
            renderListingModal(activeModalListing);
        } else {
            showToast("Listing details could not be loaded.", "error");
        }
    } catch (err) {
        showToast("Error loading listing details.", "error");
    }
}

function renderListingModal(item) {
    document.getElementById("modal-icon").textContent = getFoodEmoji(item.food);
    document.getElementById("modal-food-name").textContent = item.food;
    document.getElementById("modal-quantity").textContent = `${item.quantity} ${item.unit}`;

    const actionBadge = document.getElementById("modal-action-badge");
    actionBadge.textContent = item.recommended_action || "SELL";
    actionBadge.className = `action-badge ${(item.recommended_action || "sell").toLowerCase()}`;

    const urgencyBadge = document.getElementById("modal-urgency-badge");
    urgencyBadge.textContent = `${item.urgency || "MEDIUM"} URGENCY`;
    urgencyBadge.className = `urgency-badge ${(item.urgency || "medium").toLowerCase()}`;

    const statusPill = document.getElementById("modal-status-pill");
    statusPill.textContent = item.status;
    statusPill.className = `status-pill ${item.status.toLowerCase()}`;

    document.getElementById("modal-current-price").textContent = item.current_price != null ? `${item.currency || "INR"} ${item.current_price} / ${item.unit}` : "N/A";
    
    const suggestedPriceRow = document.getElementById("modal-suggested-price-row");
    if (item.suggested_price != null) {
        suggestedPriceRow.style.display = "flex";
        document.getElementById("modal-suggested-price").textContent = `${item.currency || "INR"} ${item.suggested_price} / ${item.unit}`;
    } else {
        suggestedPriceRow.style.display = "none";
    }

    const discountBadge = document.getElementById("modal-discount-badge");
    if (item.suggested_discount_percent != null) {
        discountBadge.style.display = "block";
        discountBadge.textContent = `${item.suggested_discount_percent}% OFF`;
    } else {
        discountBadge.style.display = "none";
    }

    document.getElementById("modal-location").textContent = item.location || "Location not specified";

    const distanceRow = document.getElementById("modal-distance-row");
    if (item.distance_km != null) {
        distanceRow.style.display = "block";
        document.getElementById("modal-distance").textContent = `${item.distance_km} km away`;
    } else {
        distanceRow.style.display = "none";
    }

    const harvestRow = document.getElementById("modal-harvest-row");
    if (item.harvest_date) {
        harvestRow.style.display = "block";
        document.getElementById("modal-harvest-date").textContent = item.harvest_date;
    } else {
        harvestRow.style.display = "none";
    }

    const expiryRow = document.getElementById("modal-expiry-row");
    if (item.expiry_date) {
        expiryRow.style.display = "block";
        document.getElementById("modal-expiry-date").textContent = item.expiry_date;
    } else {
        expiryRow.style.display = "none";
    }

    document.getElementById("modal-confidence").textContent = item.confidence != null ? `Confidence: ${Math.round(item.confidence * 100)}%` : "";
    document.getElementById("modal-ai-reason").textContent = item.reason || "No additional AI recommendations provided.";

    const claimBtn = document.getElementById("modal-claim-btn");
    if (item.status === "AVAILABLE") {
        claimBtn.disabled = false;
        claimBtn.innerHTML = "<span>🛒 Claim Food Listing</span>";
        claimBtn.style.display = "block";
    } else {
        claimBtn.disabled = true;
        claimBtn.innerHTML = "<span>✅ Food Already Claimed</span>";
        claimBtn.style.display = "block";
    }

    document.getElementById("listing-modal").classList.remove("hidden");
}

function handleModalClaimClick() {
    if (activeModalListing && activeModalListing.id) {
        claimListing(activeModalListing.id);
    }
}

function closeListingModal() {
    document.getElementById("listing-modal").classList.add("hidden");
    activeModalListing = null;
}

function handleModalOverlayClick(e) {
    if (e.target.id === "listing-modal") {
        closeListingModal();
    }
}

// Toast Notification Helper
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️"}</span>
        <span class="toast-msg">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   HARVESTGUARD ENGINE TAB HANDLERS (EXISTING PRESERVED LOGIC)
   ========================================================= */

function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    
    if (tabId === "analysis-tab") {
        document.querySelectorAll(".tab-btn")[0].classList.add("active");
    } else {
        document.querySelectorAll(".tab-btn")[1].classList.add("active");
    }
    document.getElementById(tabId).classList.add("active");
}

const PRESETS = {
    sell: {
        food: "Tomatoes",
        quantity: 100,
        unit: "kg",
        harvest_date: getOffsetDate(-1),
        current_price: 40,
        currency: "INR",
        location: "Chennai, Tamil Nadu",
        description: "Harvested yesterday morning. Excellent grade A fresh crop, need to sell quickly before local market closes.",
        voice_transcript: "",
        expiry_date: ""
    },
    discount: {
        food: "Basmati Rice",
        quantity: 10,
        unit: "kg",
        expiry_date: getOffsetDate(15),
        current_price: 600,
        currency: "INR",
        location: "Coimbatore, Tamil Nadu",
        description: "Demand is slow this week. 15 days left before best before date.",
        voice_transcript: "I have 10 kg rice with 15 days left before best before date.",
        harvest_date: ""
    },
    store: {
        food: "Potatoes",
        quantity: 500,
        unit: "kg",
        harvest_date: getOffsetDate(-3),
        current_price: 25,
        currency: "INR",
        location: "Cold Storage Unit 4, Salem",
        description: "Freshly harvested potatoes, cold storage space is available on site. No urgent buyer today.",
        voice_transcript: "",
        expiry_date: ""
    },
    donate: {
        food: "Cooked Surplus Meals",
        quantity: 40,
        unit: "boxes",
        production_date: getOffsetDate(0),
        expiry_date: getOffsetDate(0),
        current_price: 0,
        currency: "INR",
        location: "Madurai, Tamil Nadu",
        description: "Surplus event catering meals, packed safely 2 hours ago. Seeking immediate distribution to nearby shelter.",
        voice_transcript: "",
        harvest_date: ""
    },
    process: {
        food: "Overripe Surplus Strawberries",
        quantity: 80,
        unit: "kg",
        harvest_date: getOffsetDate(-4),
        location: "Ooty, Tamil Nadu",
        description: "Too soft for direct retail shelf sale, but perfectly sweet for jam or juice processing.",
        voice_transcript: "",
        current_price: 30
    },
    recover: {
        food: "Damaged Vegetable Trimmings",
        quantity: 200,
        unit: "kg",
        description: "Non-edible market scraps and stem trimmings from sorting line. Suitable for organic compost or livestock feed.",
        voice_transcript: "",
        location: "Trichy Wholesale Market"
    },
    vague: {
        food: "Vegetables",
        description: "I have some surplus vegetables.",
        quantity: "",
        unit: "",
        harvest_date: "",
        current_price: ""
    }
};

function getOffsetDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split("T")[0];
}

function loadPreset(key) {
    const p = PRESETS[key];
    if (!p) return;

    document.getElementById("food").value = p.food || "";
    document.getElementById("quantity").value = p.quantity || "";
    document.getElementById("unit").value = p.unit || "";
    document.getElementById("harvest_date").value = p.harvest_date || "";
    document.getElementById("expiry_date").value = p.expiry_date || "";
    document.getElementById("current_price").value = p.current_price || "";
    document.getElementById("currency").value = p.currency || "INR";
    document.getElementById("location").value = p.location || "";
    document.getElementById("description").value = p.description || "";
    document.getElementById("voice_transcript").value = p.voice_transcript || "";

    switchTab("analysis-tab");
}

async function handleAnalyzeSubmit(e) {
    e.preventDefault();

    const form = document.getElementById("harvest-form");
    const formData = new FormData(form);

    showLoading(true);
    hideError();

    try {
        const res = await fetch("/api/harvestguard/analyze", {
            method: "POST",
            body: formData
        });

        const result = await res.json();
        showLoading(false);

        if (result.success && result.data) {
            renderResultCard(result.data);
        } else {
            showError(
                result.error?.code || "ERROR",
                result.error?.message || "Analysis request failed."
            );
        }
    } catch (err) {
        showLoading(false);
        showError("NETWORK_ERROR", "Failed to connect to HarvestGuard API service.");
    }
}

function renderResultCard(data) {
    document.getElementById("empty-state").classList.add("hidden");
    document.getElementById("result-card").classList.remove("hidden");

    document.getElementById("res-food").textContent = data.food || "Unspecified Surplus";
    document.getElementById("res-quantity").textContent = (data.quantity && data.unit) ? `${data.quantity} ${data.unit}` : (data.quantity || "Quantity Not Specified");

    const actionBadge = document.getElementById("res-action");
    actionBadge.textContent = data.recommended_action || "UNKNOWN";
    actionBadge.style.backgroundColor = `var(--action-${(data.recommended_action || "sell").toLowerCase()})`;

    const urgencyBadge = document.getElementById("res-urgency");
    urgencyBadge.textContent = `${data.urgency || "MEDIUM"} URGENCY`;
    urgencyBadge.style.backgroundColor = `var(--urgency-${(data.urgency || "medium").toLowerCase()})`;

    document.getElementById("res-reason").textContent = data.reason || "No explanation provided.";

    document.getElementById("res-discount").textContent = data.suggested_discount_percent != null ? `${data.suggested_discount_percent}%` : "N/A";
    document.getElementById("res-price").textContent = data.suggested_price != null ? `${data.currency || "INR"} ${data.suggested_price}` : "N/A";
    document.getElementById("res-shelf-life").textContent = data.remaining_shelf_life_days != null ? `${data.remaining_shelf_life_days} Days` : "Unspecified";
    document.getElementById("res-confidence").textContent = data.confidence != null ? `${Math.round(data.confidence * 100)}%` : "N/A";

    const missingBlock = document.getElementById("missing-info-block");
    const missingList = document.getElementById("res-missing-list");
    missingList.innerHTML = "";
    if (data.missing_information && data.missing_information.length > 0) {
        missingBlock.classList.remove("hidden");
        data.missing_information.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            missingList.appendChild(li);
        });
    } else {
        missingBlock.classList.add("hidden");
    }

    const notesList = document.getElementById("res-notes-list");
    notesList.innerHTML = "";
    const notes = data.additional_notes || [];
    if (notes.length === 0) {
        notes.push("Ensure standard food storage and transport guidelines are followed.");
    }
    notes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = note;
        notesList.appendChild(li);
    });
}

async function handleAskSubmit(e) {
    e.preventDefault();
    const queryInput = document.getElementById("ask_query");
    const queryText = queryInput.value.trim();
    if (!queryText) return;

    appendChatMessage("user", queryText);
    queryInput.value = "";

    try {
        const res = await fetch("/api/harvestguard/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: queryText, language: "en" })
        });

        const result = await res.json();
        if (result.success && result.data) {
            appendChatMessage("ai", result.data.response);
        } else {
            appendChatMessage("ai", `⚠️ Error: ${result.error?.message || "Failed to answer."}`);
        }
    } catch (e) {
        appendChatMessage("ai", "⚠️ Connection error occurred.");
    }
}

function appendChatMessage(sender, text) {
    const chatContainer = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${sender === "user" ? "user-msg" : "ai-msg"}`;
    msgDiv.innerHTML = `<strong>${sender === "user" ? "You" : "HarvestGuard AI"}:</strong> ${text}`;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoading(val) {
    const el = document.getElementById("loading-state");
    if (val) {
        el.classList.remove("hidden");
        document.getElementById("empty-state").classList.add("hidden");
        document.getElementById("result-card").classList.add("hidden");
    } else {
        el.classList.add("hidden");
    }
}

function showError(code, message) {
    document.getElementById("error-state").classList.remove("hidden");
    document.getElementById("error-code").textContent = code;
    document.getElementById("error-message").textContent = message;
}

function hideError() {
    document.getElementById("error-state").classList.add("hidden");
}
