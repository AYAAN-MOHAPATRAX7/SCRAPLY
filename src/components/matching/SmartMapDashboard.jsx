import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";

/* =========================================================
   HARVESTGUARD → DESTINATION
   ========================================================= */

const recommendationCategory = {
  DONATE: "NGO",
  SELL: "BUYER",
  DISCOUNT: "BUYER",
};

/* =========================================================
   ONLY NGOs + BUYERS
   ========================================================= */

const destinations = [
  {
    id: 1,
    name: "Hope Foundation",
    type: "NGO",
    latitude: 20.63,
    longitude: 78.98,
    capacityKg: 500,
    demand: "HIGH",
    priority: 9,
    available: true,
    acceptedFoods: ["Basmati Rice", "Rice", "Wheat"],
  },
  {
    id: 2,
    name: "Helping Hands NGO",
    type: "NGO",
    latitude: 20.57,
    longitude: 78.94,
    capacityKg: 300,
    demand: "MEDIUM",
    priority: 7,
    available: true,
    acceptedFoods: ["Rice", "Basmati Rice"],
  },
  {
    id: 3,
    name: "Food Care Foundation",
    type: "NGO",
    latitude: 20.61,
    longitude: 79.02,
    capacityKg: 800,
    demand: "HIGH",
    priority: 8,
    available: true,
    acceptedFoods: ["Basmati Rice", "Rice"],
  },
  {
    id: 4,
    name: "FreshMart",
    type: "BUYER",
    latitude: 20.67,
    longitude: 79.01,
    capacityKg: 1000,
    demand: "HIGH",
    priority: 8,
    available: true,
    acceptedFoods: ["Basmati Rice", "Rice", "Wheat"],
  },
  {
    id: 5,
    name: "Green Grocery",
    type: "BUYER",
    latitude: 20.55,
    longitude: 78.91,
    capacityKg: 600,
    demand: "MEDIUM",
    priority: 6,
    available: true,
    acceptedFoods: ["Basmati Rice", "Rice"],
  },
];

/* =========================================================
   CATEGORIES
   ========================================================= */

const categories = [
  {
    key: "NGO",
    label: "🤝 NGOs",
  },
  {
    key: "BUYER",
    label: "🏪 Buyers",
  },
];

/* =========================================================
   HAVERSINE DISTANCE
   ========================================================= */

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

/* =========================================================
   MAP FOCUS
   ========================================================= */

function MapFocus({ foodSource, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!foodSource || !destination) return;

    map.fitBounds(
      [
        [foodSource.latitude, foodSource.longitude],
        [destination.latitude, destination.longitude],
      ],
      {
        padding: [70, 70],
        maxZoom: 12,
        animate: true,
        duration: 1,
      }
    );
  }, [foodSource, destination, map]);

  return null;
}

/* =========================================================
   MARKER COLORS
   ========================================================= */

function getMarkerColor(type) {
  if (type === "NGO") return "#557A5A";
  if (type === "BUYER") return "#B88A44";

  return "#64748B";
}

/* =========================================================
   SCORE ROW
   ========================================================= */

function ScoreRow({
  icon,
  label,
  value,
  score,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "30px 1fr auto",
        gap: "10px",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #E7E2D6",
      }}
    >
      <span style={{ fontSize: "16px" }}>
        {icon}
      </span>

      <div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#183B2A",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#7A8279",
            marginTop: "3px",
          }}
        >
          {value}
        </div>
      </div>

      <strong
        style={{
          color: "#1D5A3B",
          fontSize: "13px",
        }}
      >
        +{score}
      </strong>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [showInput, setShowInput] = useState(true);

  const [foodData, setFoodData] = useState(null);

  const [form, setForm] = useState({
    food: "Basmati Rice",
    quantity: "10",
    shelfLife: "15",
    urgency: "HIGH",
    action: "DONATE",
  });

  const [activeCategory, setActiveCategory] =
    useState("NGO");

  const [selectedDestination, setSelectedDestination] =
    useState(null);

  /* =====================================================
     FOOD SOURCE
     ===================================================== */

  const foodSource = useMemo(() => {
    if (!foodData) return null;

    return {
      name: "Food Source",
      latitude: 20.5937,
      longitude: 78.9629,
      food: foodData.food,
      quantityKg: foodData.quantityKg,
      urgency: foodData.urgency,
      recommendedAction:
        foodData.recommendedAction,
    };
  }, [foodData]);

  /* =====================================================
     SMART MATCHING
     ===================================================== */

  const matchedDestinations = useMemo(() => {
    if (!foodData || !foodSource) return [];

    return destinations
      .filter(
        (destination) =>
          destination.type === activeCategory
      )
      .map((destination) => {
        const distance = calculateDistance(
          foodSource.latitude,
          foodSource.longitude,
          destination.latitude,
          destination.longitude
        );

        const foodCompatible =
          destination.acceptedFoods.some(
            (food) =>
              food.toLowerCase() ===
              foodData.food.toLowerCase()
          );

        const hasCapacity =
          destination.capacityKg >=
          foodData.quantityKg;

        const distanceScore = Math.max(
          0,
          30 - distance * 5
        );

        const capacityScore = hasCapacity
          ? 20
          : 0;

        const compatibilityScore =
          foodCompatible ? 25 : 0;

        const priorityScore =
          destination.priority * 2;

        let urgencyBonus = 0;

        if (foodData.urgency === "CRITICAL") {
          urgencyBonus = 10;
        } else if (
          foodData.urgency === "HIGH"
        ) {
          urgencyBonus = 7;
        } else if (
          foodData.urgency === "MEDIUM"
        ) {
          urgencyBonus = 4;
        }

        const matchScore = Math.round(
          distanceScore +
            capacityScore +
            compatibilityScore +
            priorityScore +
            urgencyBonus
        );

        return {
          ...destination,
          distance,
          foodCompatible,
          hasCapacity,
          distanceScore: Math.round(
            distanceScore
          ),
          capacityScore,
          compatibilityScore,
          priorityScore,
          urgencyBonus,
          matchScore,
        };
      })
      .filter(
        (destination) =>
          destination.available &&
          destination.hasCapacity &&
          destination.foodCompatible
      )
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );
  }, [
    foodData,
    foodSource,
    activeCategory,
  ]);

  /* =====================================================
     BEST DESTINATION
     ===================================================== */

  const bestDestination =
    matchedDestinations.length > 0
      ? matchedDestinations[0]
      : null;

  const currentDestination =
    selectedDestination || bestDestination;

  const routePoints = currentDestination
    ? [
        [
          foodSource.latitude,
          foodSource.longitude,
        ],
        [
          currentDestination.latitude,
          currentDestination.longitude,
        ],
      ]
    : [];

  /* =====================================================
     FIND DESTINATION
     ===================================================== */

  function handleFindDestination() {
    const newFood = {
      food: form.food,
      quantityKg: Number(form.quantity),
      urgency: form.urgency,
      recommendedAction: form.action,
      remainingShelfLife: Number(form.shelfLife),
    };

    setFoodData(newFood);

    const category =
      recommendationCategory[form.action] ||
      "NGO";

    setActiveCategory(category);
    setSelectedDestination(null);
    setShowInput(false);
  }

  /* =====================================================
     INPUT SCREEN
     ===================================================== */

  if (showInput) {
    return (
      <div style={pageStyle}>
        <style>{globalStyles}</style>

        <div style={inputContainer}>

          <div style={brandBlock}>
            <div style={brandLogo}>
              🌿
            </div>

            <div>
              <div style={brandName}>
                SCRAPLY
              </div>

              <div style={brandSub}>
                FOOD INTELLIGENCE
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "35px",
              marginBottom: "8px",
              color: "#7B6B45",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "2px",
            }}
          >
            FOOD ANALYSIS
          </div>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "38px",
              lineHeight: 1.05,
              color: "#173D2B",
              margin: "0 0 24px",
            }}
          >
            Find the best
            <br />
            <em style={{ color: "#4F7C5B" }}>
              next destination.
            </em>
          </h1>

          <div style={inputCard}>

            <div
              style={{
                fontSize: "12px",
                color: "#7D806F",
                fontWeight: "800",
                letterSpacing: "1.5px",
              }}
            >
              HARVESTGUARD INPUT
            </div>

            <div
              style={{
                fontSize: "21px",
                fontWeight: "800",
                color: "#173D2B",
                marginTop: "8px",
              }}
            >
              Show SCRAPLY your food
            </div>

            <div style={fakeUpload}>
              <div style={cameraCircle}>
                📷
              </div>

              <strong
                style={{
                  color: "#365B43",
                }}
              >
                Food details
              </strong>

              <span
                style={{
                  fontSize: "12px",
                  color: "#8A8E83",
                }}
              >
                Enter the analysis details below
              </span>
            </div>

            <label style={labelStyle}>
              Food Name
            </label>

            <input
              value={form.food}
              onChange={(e) =>
                setForm({
                  ...form,
                  food: e.target.value,
                })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>
              Quantity (kg)
            </label>

            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value,
                })
              }
              style={inputStyle}
            />

            <label style={labelStyle}>
              Remaining Shelf Life (days)
            </label>

            <input
              type="number"
              min="1"
              value={form.shelfLife}
              onChange={(e) =>
                setForm({
                  ...form,
                  shelfLife: e.target.value,
                })
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >

              <div>
                <label style={labelStyle}>
                  Urgency
                </label>

                <select
                  value={form.urgency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      urgency: e.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="CRITICAL">
                    CRITICAL
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  HarvestGuard Recommendation
                </label>

                <select
                  value={form.action}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      action: e.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="DONATE">
                    DONATE → NGO
                  </option>

                  <option value="SELL">
                    SELL → BUYER
                  </option>

                  <option value="DISCOUNT">
                    DISCOUNT → BUYER
                  </option>
                </select>
              </div>

            </div>

            <button
              onClick={handleFindDestination}
              style={primaryButton}
            >
              🧠 Find Best Destination
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD
     ===================================================== */

  return (
    <div style={dashboardPage}>
      <style>{globalStyles}</style>

      {/* NAVBAR */}

      <div style={navbar}>

        <div style={brandBlock}>

          <div style={brandLogoSmall}>
            🌿
          </div>

          <div>
            <div style={brandNameSmall}>
              SCRAPLY
            </div>

            <div style={brandSub}>
              SMART FOOD INTELLIGENCE
            </div>
          </div>

        </div>

        <button
          onClick={() => setShowInput(true)}
          style={tryButton}
        >
          Try SCRAPLY
        </button>

      </div>

      {/* HERO */}

      <div style={heroSection}>

        <div style={{ flex: 1 }}>

          <div style={eyebrow}>
            ✨ SMART DESTINATION ENGINE
          </div>

          <h1 style={heroTitle}>
            Give surplus food
            <br />
            <em>its next destination.</em>
          </h1>

          <p style={heroText}>
            SCRAPLY combines distance,
            capacity, compatibility, demand
            and urgency to find the most
            suitable destination for every
            food listing.
          </p>

        </div>

        <div style={foodSummary}>

          <div style={summaryLabel}>
            FOOD SOURCE
          </div>

          <div style={foodName}>
            🌾 {foodSource.food}
          </div>

          <div style={foodMeta}>
            <span>
              {foodSource.quantityKg} kg
            </span>

            <span>•</span>

            <span>
              {foodSource.urgency}
            </span>

            <span>•</span>

            <span>
              {foodSource.recommendedAction}
            </span>
          </div>

        </div>

      </div>

      {/* AI STRIP */}

      <div style={recommendationBanner}>

        <div>
          ✨{" "}
          <strong>
            HarvestGuard recommends{" "}
            {foodSource.recommendedAction}
          </strong>
        </div>

        <div style={bannerRight}>
          → Prioritizing{" "}
          {activeCategory === "NGO"
            ? "NGOs"
            : "Buyers"}
        </div>

      </div>

      {/* CATEGORY BUTTONS */}

      <div style={categoryRow}>

        {categories.map((category) => {

          const active =
            activeCategory === category.key;

          const recommended =
            recommendationCategory[
              foodSource.recommendedAction
            ] === category.key;

          return (
            <button
              key={category.key}
              onClick={() => {
                setActiveCategory(
                  category.key
                );
                setSelectedDestination(null);
              }}
              style={{
                ...categoryButton,
                ...(active
                  ? activeCategoryButton
                  : {}),
              }}
            >
              {category.label}

              {recommended && (
                <span style={aiBadge}>
                  AI
                </span>
              )}
            </button>
          );
        })}

      </div>

      {/* MAIN GRID */}

      <div style={mainGrid}>

        {/* MAP */}

        <div style={mapCard}>

          <div style={mapHeader}>

            <div>
              <div style={sectionTitle}>
                Smart Matching Map
              </div>

              <div style={sectionSubtitle}>
                Recommended destinations near
                the food source
              </div>
            </div>

            <div style={legend}>

              <span>
                <i
                  style={{
                    ...legendDot,
                    background: "#1D5A3B",
                  }}
                />
                Food
              </span>

              <span>
                <i
                  style={{
                    ...legendDot,
                    background: "#B88A44",
                  }}
                />
                Destination
              </span>

            </div>

          </div>

          <div style={mapWrapper}>

            <MapContainer
              center={[
                foodSource.latitude,
                foodSource.longitude,
              ]}
              zoom={6}
              style={{
                width: "100%",
                height: "100%",
              }}
              scrollWheelZoom={true}
            >

              <TileLayer
                className="scraply-map-tiles"
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus
                foodSource={foodSource}
                destination={
                  currentDestination
                }
              />

              {/* FOOD SOURCE */}

              <CircleMarker
                center={[
                  foodSource.latitude,
                  foodSource.longitude,
                ]}
                radius={14}
                pathOptions={{
                  color: "#17452F",
                  fillColor: "#1D5A3B",
                  fillOpacity: 1,
                  weight: 4,
                }}
              >
                <Popup>
                  <strong>
                    🌾 Food Source
                  </strong>

                  <br />

                  {foodSource.food}

                  <br />

                  {foodSource.quantityKg} kg
                </Popup>
              </CircleMarker>

              {/* ROUTE */}

              {currentDestination && (
                <Polyline
                  positions={routePoints}
                  pathOptions={{
                    color: "#1D5A3B",
                    weight: 4,
                    opacity: 0.75,
                    dashArray: "9 9",
                  }}
                />
              )}

              {/* DESTINATIONS */}

              {matchedDestinations.map(
                (destination) => {

                  const selected =
                    currentDestination?.id ===
                    destination.id;

                  const aiRecommended =
                    destination.id ===
                    bestDestination?.id;

                  return (
                    <CircleMarker
                      key={destination.id}
                      center={[
                        destination.latitude,
                        destination.longitude,
                      ]}
                      radius={
                        aiRecommended
                          ? 17
                          : selected
                          ? 14
                          : 8
                      }
                      pathOptions={{
                        color:
                          aiRecommended ||
                          selected
                            ? "#1D5A3B"
                            : getMarkerColor(
                                destination.type
                              ),

                        fillColor:
                          aiRecommended ||
                          selected
                            ? "#8DAA8C"
                            : getMarkerColor(
                                destination.type
                              ),

                        fillOpacity: 0.95,

                        weight:
                          aiRecommended
                            ? 5
                            : 2,
                      }}
                      eventHandlers={{
                        click: () =>
                          setSelectedDestination(
                            destination
                          ),
                      }}
                    >
                      <Popup>

                        <strong>
                          {destination.type ===
                          "NGO"
                            ? "🤝"
                            : "🏪"}{" "}
                          {destination.name}
                        </strong>

                        <br />

                        Distance:{" "}
                        {destination.distance.toFixed(
                          1
                        )}{" "}
                        km

                        <br />

                        Capacity:{" "}
                        {destination.capacityKg}{" "}
                        kg

                        <br />

                        Demand:{" "}
                        {destination.demand}

                        <br />

                        Match:{" "}
                        {destination.matchScore}

                        {aiRecommended && (
                          <>
                            <br />
                            <strong>
                              ⭐ AI Recommended
                            </strong>
                          </>
                        )}

                      </Popup>
                    </CircleMarker>
                  );
                }
              )}

            </MapContainer>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div style={sidePanel}>

          {/* BEST DESTINATION */}

          {bestDestination && (
            <div style={bestCard}>

              <div style={smallGoldLabel}>
                ✨ BEST DESTINATION
              </div>

              <div style={bestName}>
                {bestDestination.type ===
                "NGO"
                  ? "🤝"
                  : "🏪"}{" "}
                {bestDestination.name}
              </div>

              <div style={bestDescription}>
                Best destination for{" "}
                {foodSource.recommendedAction.toLowerCase()}{" "}
                based on distance, capacity,
                compatibility, demand and
                urgency.
              </div>

              <div style={statGrid}>

                <div style={statBox}>
                  <div style={statLabel}>
                    DISTANCE
                  </div>

                  <strong>
                    {bestDestination.distance.toFixed(
                      1
                    )}{" "}
                    km
                  </strong>
                </div>

                <div style={statBox}>
                  <div style={statLabel}>
                    MATCH
                  </div>

                  <strong>
                    {bestDestination.matchScore}
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* DESTINATION LIST */}

          <div style={listCard}>

            <div style={listHeader}>

              <div>
                <div style={sectionTitle}>
                  {activeCategory === "NGO"
                    ? "Nearby NGOs"
                    : "Nearby Buyers"}
                </div>

                <div style={sectionSubtitle}>
                  Ranked by smart matching
                </div>
              </div>

              <div style={countBadge}>
                {matchedDestinations.length}
              </div>

            </div>

            <div style={destinationList}>

              {matchedDestinations.map(
                (destination, index) => {

                  const isBest =
                    index === 0;

                  const isSelected =
                    selectedDestination?.id ===
                    destination.id;

                  return (
                    <button
                      key={destination.id}
                      onClick={() =>
                        setSelectedDestination(
                          destination
                        )
                      }
                      style={{
                        ...destinationCard,
                        ...(isSelected
                          ? selectedCard
                          : {}),
                      }}
                    >

                      <div style={destinationTop}>

                        <div
                          style={
                            destinationIcon
                          }
                        >
                          {destination.type ===
                          "NGO"
                            ? "🤝"
                            : "🏪"}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            textAlign:
                              "left",
                          }}
                        >

                          <div
                            style={
                              destinationName
                            }
                          >
                            {destination.name}
                          </div>

                          <div
                            style={
                              destinationType
                            }
                          >
                            {destination.type ===
                            "NGO"
                              ? "NGO"
                              : "BUYER"}
                          </div>

                        </div>

                        {isBest && (
                          <span
                            style={
                              recommendedBadge
                            }
                          >
                            AI
                          </span>
                        )}

                      </div>

                      <div
                        style={
                          destinationStats
                        }
                      >

                        <span>
                          📍{" "}
                          {destination.distance.toFixed(
                            1
                          )}{" "}
                          km
                        </span>

                        <span>
                          📦{" "}
                          {
                            destination.capacityKg
                          }{" "}
                          kg
                        </span>

                        <span>
                          🎯{" "}
                          {
                            destination.matchScore
                          }
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* MATCH BREAKDOWN */}

          {currentDestination && (
            <div style={breakdownCard}>

              <div style={smallGoldLabel}>
                MATCH INTELLIGENCE
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#173D2B",
                  marginTop: "7px",
                }}
              >
                Why this destination?
              </div>

              <ScoreRow
                icon="📍"
                label="Distance"
                value={`${currentDestination.distance.toFixed(
                  1
                )} km away`}
                score={
                  currentDestination.distanceScore
                }
              />

              <ScoreRow
                icon="📦"
                label="Capacity"
                value={
                  currentDestination.hasCapacity
                    ? "Enough capacity available"
                    : "Insufficient capacity"
                }
                score={
                  currentDestination.capacityScore
                }
              />

              <ScoreRow
                icon="🍚"
                label="Food Compatibility"
                value={
                  currentDestination.foodCompatible
                    ? "Food accepted"
                    : "Food not listed"
                }
                score={
                  currentDestination.compatibilityScore
                }
              />

              <ScoreRow
                icon="📈"
                label="Demand / Priority"
                value={`${currentDestination.demand} demand`}
                score={
                  currentDestination.priorityScore
                }
              />

              <ScoreRow
                icon="⏳"
                label="Urgency"
                value={`${foodSource.urgency} urgency`}
                score={
                  currentDestination.urgencyBonus
                }
              />

              <div
                style={{
                  marginTop: "14px",
                  padding: "15px",
                  background: "#E9F0E3",
                  borderRadius: "14px",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <strong
                  style={{
                    color: "#173D2B",
                  }}
                >
                  Total Match Score
                </strong>

                <strong
                  style={{
                    color: "#1D5A3B",
                    fontSize: "22px",
                  }}
                >
                  {currentDestination.matchScore}
                </strong>
              </div>

            </div>
          )}

          {/* SMART PATHWAY */}

          {currentDestination && (
            <div style={pathwayCard}>

              <div style={smallGoldLabel}>
                SMART PATHWAY
              </div>

              <div style={pathwayFlow}>

                <div style={pathNode}>
                  <span style={{ fontSize: "22px" }}>
                    🌾
                  </span>

                  <span>
                    Food Source
                  </span>
                </div>

                <div style={pathArrow}>
                  →
                </div>

                <div style={pathNode}>

                  <span style={{ fontSize: "22px" }}>
                    {currentDestination.type ===
                    "NGO"
                      ? "🤝"
                      : "🏪"}
                  </span>

                  <span>
                    {currentDestination.name}
                  </span>

                </div>

              </div>

              <div style={routeText}>
                📍{" "}
                {currentDestination.distance.toFixed(
                  1
                )}{" "}
                km connection
              </div>

            </div>
          )}

        </div>

      </div>

      <div style={footer}>
        SCRAPLY • SMART SURPLUS FOOD MATCHING
      </div>

    </div>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#F5F1E7,#E8EFE3)",
  padding: "40px 20px",
  boxSizing: "border-box",
};

const dashboardPage = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#F7F4EA,#EEF2E8)",
  color: "#173D2B",
  padding: "20px 30px 40px",
  boxSizing: "border-box",
};

const inputContainer = {
  maxWidth: "760px",
  margin: "0 auto",
};

const inputCard = {
  background:
    "rgba(255,255,255,0.86)",
  border: "1px solid #E0DED2",
  borderRadius: "28px",
  padding: "30px",
  boxShadow:
    "0 20px 50px rgba(34,61,45,0.08)",
};

const brandBlock = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const brandLogo = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  background: "#173D2B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
};

const brandLogoSmall = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  background: "#173D2B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
};

const brandName = {
  fontSize: "20px",
  fontWeight: "900",
  letterSpacing: "2px",
  color: "#173D2B",
};

const brandNameSmall = {
  fontSize: "17px",
  fontWeight: "900",
  letterSpacing: "2px",
  color: "#173D2B",
};

const brandSub = {
  fontSize: "8px",
  fontWeight: "800",
  letterSpacing: "2px",
  color: "#7A806F",
  marginTop: "2px",
};

const fakeUpload = {
  marginTop: "22px",
  marginBottom: "22px",
  padding: "18px",
  border: "1px dashed #BBC9B6",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#F4F7F0",
};

const cameraCircle = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#DCE8D6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "19px",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "800",
  color: "#5E6A5E",
  marginBottom: "6px",
  marginTop: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: "12px",
  border: "1px solid #D6DCCF",
  background: "#FBFCF8",
  color: "#173D2B",
  fontSize: "13px",
  outline: "none",
};

const primaryButton = {
  width: "100%",
  marginTop: "25px",
  padding: "15px",
  border: "none",
  borderRadius: "14px",
  background: "#173D2B",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
};

const navbar = {
  maxWidth: "1250px",
  margin: "0 auto 30px",
  padding: "13px 16px",
  background:
    "rgba(255,255,255,0.78)",
  border:
    "1px solid rgba(190,198,181,0.7)",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const tryButton = {
  border: "1px solid #C8D3C1",
  background: "#F7F9F2",
  color: "#315C43",
  borderRadius: "10px",
  padding: "9px 14px",
  fontWeight: "800",
  cursor: "pointer",
};

const heroSection = {
  maxWidth: "1250px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: "30px",
  padding: "10px 5px 25px",
};

const eyebrow = {
  display: "inline-block",
  padding: "8px 13px",
  borderRadius: "20px",
  border: "1px solid #D8CDAF",
  color: "#8B713F",
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "1.5px",
};

const heroTitle = {
  fontFamily: "Georgia, serif",
  fontSize: "48px",
  lineHeight: 1.05,
  fontWeight: "500",
  margin: "17px 0",
  color: "#173D2B",
};

const heroText = {
  maxWidth: "650px",
  fontSize: "13px",
  lineHeight: 1.7,
  color: "#697367",
  margin: 0,
};

const foodSummary = {
  minWidth: "280px",
  background:
    "rgba(255,255,255,0.8)",
  border: "1px solid #E0DDD1",
  borderRadius: "22px",
  padding: "25px",
  boxShadow:
    "0 12px 30px rgba(50,70,50,0.06)",
};

const summaryLabel = {
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "2px",
  color: "#7B806F",
};

const foodName = {
  fontSize: "21px",
  fontWeight: "900",
  color: "#173D2B",
  marginTop: "10px",
};

const foodMeta = {
  marginTop: "12px",
  display: "flex",
  gap: "8px",
  color: "#6B7468",
  fontSize: "12px",
};

const recommendationBanner = {
  maxWidth: "1250px",
  margin: "0 auto 15px",
  padding: "15px 20px",
  borderRadius: "15px",
  background: "#E7F0E1",
  border: "1px solid #D0DDC8",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "12px",
  color: "#234A32",
};

const bannerRight = {
  color: "#667260",
  fontSize: "11px",
};

const categoryRow = {
  maxWidth: "1250px",
  margin: "0 auto 18px",
  display: "flex",
  gap: "10px",
};

const categoryButton = {
  position: "relative",
  border: "1px solid #DDDCD2",
  background: "#FFFFFF",
  color: "#405044",
  borderRadius: "22px",
  padding: "10px 17px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const activeCategoryButton = {
  background: "#173D2B",
  color: "#FFFFFF",
  borderColor: "#173D2B",
  boxShadow:
    "0 8px 18px rgba(23,61,43,0.18)",
};

const aiBadge = {
  position: "absolute",
  top: "-8px",
  right: "-5px",
  background: "#C0934B",
  color: "#FFFFFF",
  fontSize: "7px",
  fontWeight: "900",
  padding: "3px 5px",
  borderRadius: "5px",
};

const mainGrid = {
  maxWidth: "1250px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1.55fr) minmax(340px,0.8fr)",
  gap: "18px",
  alignItems: "start",
};

const mapCard = {
  background: "#FFFFFF",
  border: "1px solid #E1DED3",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow:
    "0 12px 35px rgba(45,60,45,0.06)",
};

const mapHeader = {
  padding: "20px 22px 15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const sectionTitle = {
  fontSize: "17px",
  fontWeight: "900",
  color: "#173D2B",
};

const sectionSubtitle = {
  fontSize: "10px",
  color: "#858B80",
  marginTop: "4px",
};

const legend = {
  display: "flex",
  gap: "13px",
  fontSize: "9px",
  color: "#777E74",
};

const legendDot = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  marginRight: "5px",
};

const mapWrapper = {
  height: "570px",
};

const sidePanel = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const bestCard = {
  background:
    "linear-gradient(145deg,#EAF1E4,#F7F5EC)",
  border: "1px solid #D6DFCE",
  borderRadius: "22px",
  padding: "23px",
};

const smallGoldLabel = {
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "1.8px",
  color: "#927642",
};

const bestName = {
  fontFamily: "Georgia, serif",
  fontSize: "25px",
  color: "#173D2B",
  marginTop: "12px",
};

const bestDescription = {
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#737B70",
  marginTop: "7px",
};

const statGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "9px",
  marginTop: "17px",
};

const statBox = {
  background: "rgba(255,255,255,0.8)",
  borderRadius: "12px",
  padding: "12px",
  textAlign: "center",
};

const statLabel = {
  fontSize: "9px",
  color: "#798074",
  letterSpacing: "1px",
  marginBottom: "4px",
};

const listCard = {
  background: "#FFFFFF",
  border: "1px solid #E1DED3",
  borderRadius: "22px",
  padding: "18px",
};

const listHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const countBadge = {
  minWidth: "25px",
  height: "25px",
  borderRadius: "50%",
  background: "#EDF2E9",
  color: "#315C43",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px",
  fontWeight: "900",
};

const destinationList = {
  display: "flex",
  flexDirection: "column",
  gap: "9px",
};

const destinationCard = {
  width: "100%",
  border: "1px solid #E4E3DA",
  background: "#FCFCF9",
  borderRadius: "14px",
  padding: "13px",
  cursor: "pointer",
};

const selectedCard = {
  border: "1.5px solid #315C43",
  background: "#F0F5EC",
};

const destinationTop = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const destinationIcon = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  background: "#EEF2E9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const destinationName = {
  fontSize: "12px",
  fontWeight: "900",
  color: "#244532",
};

const destinationType = {
  fontSize: "8px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#8A9086",
  marginTop: "3px",
};

const recommendedBadge = {
  background: "#C0934B",
  color: "#FFFFFF",
  borderRadius: "5px",
  padding: "4px 6px",
  fontSize: "8px",
  fontWeight: "900",
};

const destinationStats = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "11px",
  paddingTop: "9px",
  borderTop: "1px solid #E8E7DE",
  color: "#747C71",
  fontSize: "9px",
};

const breakdownCard = {
  background: "#FFFFFF",
  border: "1px solid #E1DED3",
  borderRadius: "22px",
  padding: "20px",
};

const pathwayCard = {
  background: "#173D2B",
  color: "#FFFFFF",
  borderRadius: "22px",
  padding: "20px",
};

const pathwayFlow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "15px",
};

const pathNode = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "6px",
  fontSize: "12px",
};

const pathArrow = {
  fontSize: "20px",
  color: "#C8D8C2",
};

const routeText = {
  textAlign: "center",
  marginTop: "14px",
  fontSize: "10px",
  color: "#C7D4C3",
};

const footer = {
  maxWidth: "1250px",
  margin: "25px auto 0",
  textAlign: "center",
  color: "#92998F",
  fontSize: "8px",
  letterSpacing: "2px",
};

const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background: #F7F4EA;
  }

  button,
  input,
  select {
    font-family: inherit;
  }

  button {
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
  }

  button:hover {
    transform: translateY(-1px);
  }

  .leaflet-container {
    font-family: inherit;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 12px;
  }

  .leaflet-popup-content {
    font-size: 12px;
    line-height: 1.6;
  }

  .scraply-map-tiles {
    filter: sepia(12%) saturate(75%);
  }

  @media (max-width: 900px) {
    .heroSection {
      flex-direction: column;
    }

    .mainGrid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default App;