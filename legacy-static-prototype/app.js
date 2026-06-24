const STORAGE_KEY = "ekibridge-prototype-reports";
const MAX_RECORDING_SECONDS = 60;
const EKITI_CENTER = [7.6711, 5.2519];
const EKITI_RADIUS_METERS = 52000;
const EMPTY_VIDEO_MESSAGE =
  "<p>No video captured yet. Use the record button when ready.</p>";

const appFrame = document.querySelector(".app-frame");
const bottomSheet = document.querySelector("#bottomSheet");
const form = document.querySelector("#reportForm");
const installButton = document.querySelector("#installButton");
const menuButton = document.querySelector("#menuButton");
const alertsButton = document.querySelector("#alertsButton");
const accountButton = document.querySelector("#accountButton");
const sheetToggleButton = document.querySelector("#sheetToggleButton");
const identityModeInput = document.querySelector("#identityModeInput");
const identityTabs = document.querySelectorAll(".identity-tab");
const authPanel = document.querySelector("#authPanel");
const authModeText = document.querySelector("#authModeText");
const nameInput = document.querySelector("#nameInput");
const emailInput = document.querySelector("#emailInput");
const phoneInput = document.querySelector("#phoneInput");
const passwordInput = document.querySelector("#passwordInput");
const navItems = document.querySelectorAll(".nav-item");
const homeNavButton = document.querySelector("#homeNavButton");
const reportNavButton = document.querySelector("#reportNavButton");
const trackNavButton = document.querySelector("#trackNavButton");
const navAccountButton = document.querySelector("#navAccountButton");
const locationPillText = document.querySelector("#locationPillText");
const issueTypeSelect = document.querySelector("#issueTypeSelect");
const issueChips = document.querySelectorAll(".issue-chip");
const routePreview = document.querySelector("#routePreview");
const lgaSelect = document.querySelector("#lgaSelect");
const communitySelect = document.querySelector("#communitySelect");
const wardSelect = document.querySelector("#wardSelect");
const landmarkInput = document.querySelector("#landmarkInput");
const preciseLocationToggle = document.querySelector("#preciseLocationToggle");
const locationButton = document.querySelector("#locationButton");
const clearMapButton = document.querySelector("#clearMapButton");
const locationStatus = document.querySelector("#locationStatus");
const locationSummaryPill = document.querySelector("#locationSummaryPill");
const mapStatus = document.querySelector("#mapStatus");
const attachmentInput = document.querySelector("#attachmentInput");
const nativeVideoCapture = document.querySelector("#nativeVideoCapture");
const startRecordingButton = document.querySelector("#startRecordingButton");
const stopRecordingButton = document.querySelector("#stopRecordingButton");
const resetRecordingButton = document.querySelector("#resetRecordingButton");
const evidenceStatus = document.querySelector("#evidenceStatus");
const livePreview = document.querySelector("#livePreview");
const recordedPreview = document.querySelector("#recordedPreview");
const videoOverlay = document.querySelector("#videoOverlay");
const recordIndicator = document.querySelector("#recordIndicator");
const recordStateText = document.querySelector("#recordStateText");
const recordingTime = document.querySelector("#recordingTime");
const submitButton = document.querySelector("#submitButton");
const successPanel = document.querySelector("#successPanel");
const successMessage = document.querySelector("#successMessage");
const ledgerList = document.querySelector("#ledgerList");
const historyList = document.querySelector("#historyList");
const ledgerItemTemplate = document.querySelector("#ledgerItemTemplate");
const modalLayer = document.querySelector("#modalLayer");
const modalBackdrop = document.querySelector("#modalBackdrop");
const popupSheets = document.querySelectorAll(".popup-sheet");
const popupCloseButtons = document.querySelectorAll("[data-close-popup]");
const popupActionButtons = document.querySelectorAll("[data-popup-action]");
const accountModeCards = document.querySelectorAll(".account-mode-card");
const menuPopup = document.querySelector("#menuPopup");
const alertsPopup = document.querySelector("#alertsPopup");
const accountPopup = document.querySelector("#accountPopup");
const historyPopup = document.querySelector("#historyPopup");
const detailPopup = document.querySelector("#detailPopup");
const detailTitle = document.querySelector("#detailTitle");
const detailTrackingId = document.querySelector("#detailTrackingId");
const detailStatus = document.querySelector("#detailStatus");
const detailDesk = document.querySelector("#detailDesk");
const detailLocation = document.querySelector("#detailLocation");
const detailSummary = document.querySelector("#detailSummary");
const toast = document.querySelector("#toast");

const routingTable = {
  "Road and drainage": "Ministry of Works Desk",
  "Water and sanitation": "Water and Sanitation Desk",
  Electricity: "Power Response Desk",
  "Health and emergency": "Emergency Health Desk",
  "Security incident": "Public Safety Desk",
  "Corruption or misconduct": "Integrity and Whistleblowing Unit",
  "Other public complaint": "Citizen Relations Desk",
};

const popupRegistry = {
  menu: menuPopup,
  alerts: alertsPopup,
  account: accountPopup,
  history: historyPopup,
  detail: detailPopup,
};

const reportState = {
  location: null,
  rawLocation: null,
  locationSource: null,
  stream: null,
  recorder: null,
  recordedBlob: null,
  capturedVideoFile: null,
  recordingSeconds: 0,
  recordingIntervalId: null,
  recordingTimeoutId: null,
  deferredInstallPrompt: null,
  map: null,
  marker: null,
  accuracyCircle: null,
  toastTimeoutId: null,
  activePopup: null,
  sheetCollapsed: false,
  discardNextRecording: false,
};

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getLgaData(name) {
  return window.EKITI_DATA.lgas.find((item) => item.name === name) ?? null;
}

function setSelectOptions(select, options, placeholder, disabled = false) {
  select.innerHTML = "";

  const initialOption = document.createElement("option");
  initialOption.value = "";
  initialOption.textContent = placeholder;
  select.append(initialOption);

  for (const option of options) {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    select.append(element);
  }

  select.disabled = disabled;
}

function populateLgas() {
  setSelectOptions(
    lgaSelect,
    window.EKITI_DATA.lgas.map((item) => item.name),
    "Select local government"
  );
  setSelectOptions(communitySelect, [], "Select town or community", true);
  setSelectOptions(wardSelect, [], "Select ward", true);
}

function populateCommunities() {
  const lga = getLgaData(lgaSelect.value);

  if (!lga) {
    setSelectOptions(communitySelect, [], "Select town or community", true);
    setSelectOptions(wardSelect, [], "Select ward", true);
    locationPillText.textContent = "Ekiti, Nigeria";
    return;
  }

  setSelectOptions(communitySelect, lga.communities, "Select town or community");
  populateWards();
  locationPillText.textContent = `${lga.name}, Ekiti`;

  if (!reportState.location) {
    mapStatus.textContent = `Tap the map to pin the issue inside ${lga.name}.`;
  }
}

function populateWards() {
  const lga = getLgaData(lgaSelect.value);

  if (!lga) {
    setSelectOptions(wardSelect, [], "Select ward", true);
    return;
  }

  const communityKey = normalizeText(communitySelect.value)
    .replace(/\bekiti\b/g, "")
    .trim();
  const matchingWards =
    communityKey.length > 0
      ? lga.wards.filter((ward) => normalizeText(ward).includes(communityKey))
      : [];
  const wards = matchingWards.length > 0 ? matchingWards : lga.wards;

  setSelectOptions(wardSelect, wards, "Select ward");

  if (communitySelect.value) {
    locationPillText.textContent = `${communitySelect.value}, Ekiti`;
  }
}

function determineRoute(issueType) {
  return routingTable[issueType] ?? routingTable["Other public complaint"];
}

function updateRoutePreview() {
  routePreview.textContent = `Routing preview: ${determineRoute(issueTypeSelect.value)}`;

  for (const chip of issueChips) {
    chip.classList.toggle("active", chip.dataset.issueType === issueTypeSelect.value);
  }
}

function setActiveNav(mode) {
  for (const item of navItems) {
    item.classList.remove("active");
  }

  if (mode === "home") {
    homeNavButton.classList.add("active");
    return;
  }

  if (mode === "track") {
    trackNavButton.classList.add("active");
    return;
  }

  if (mode === "account") {
    navAccountButton.classList.add("active");
    return;
  }

  reportNavButton.classList.add("active");
}

function showToast(message, tone = "default") {
  if (reportState.toastTimeoutId) {
    window.clearTimeout(reportState.toastTimeoutId);
  }

  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.hidden = false;

  reportState.toastTimeoutId = window.setTimeout(() => {
    toast.hidden = true;
    delete toast.dataset.tone;
    reportState.toastTimeoutId = null;
  }, 2800);
}

function setSheetCollapsed(collapsed) {
  reportState.sheetCollapsed = collapsed;
  bottomSheet.classList.toggle("collapsed", collapsed);
  sheetToggleButton.setAttribute(
    "aria-label",
    collapsed ? "Expand report sheet" : "Collapse report sheet"
  );
  sheetToggleButton.setAttribute("aria-expanded", String(!collapsed));

  if (!reportState.activePopup) {
    setActiveNav(collapsed ? "home" : "report");
  }
}

function expandSheet(options = {}) {
  const { scrollToTop = false } = options;
  setSheetCollapsed(false);

  if (scrollToTop) {
    bottomSheet.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

function closeAllPopups() {
  reportState.activePopup = null;
  modalLayer.hidden = true;
  appFrame.classList.remove("modal-active");

  for (const popup of popupSheets) {
    popup.hidden = true;
  }

  setActiveNav(reportState.sheetCollapsed ? "home" : "report");
}

function openPopup(name) {
  const popup = popupRegistry[name];

  if (!popup) {
    return;
  }

  modalLayer.hidden = false;
  appFrame.classList.add("modal-active");
  reportState.activePopup = name;

  for (const item of popupSheets) {
    item.hidden = item !== popup;
  }

  popup.hidden = false;

  if (name === "history") {
    setActiveNav("track");
  } else if (name === "account") {
    setActiveNav("account");
  } else {
    setActiveNav("report");
  }
}

function focusAccountMode(mode = "login") {
  closeAllPopups();
  expandSheet();
  setIdentityMode(mode);
  setActiveNav("account");

  const target = mode === "anonymous" ? identityTabs[0] : authPanel;
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setIdentityMode(mode) {
  identityModeInput.value = mode;

  for (const tab of identityTabs) {
    tab.classList.toggle("active", tab.dataset.identityMode === mode);
  }

  if (mode === "anonymous") {
    authPanel.hidden = true;
    authModeText.textContent =
      "Continue anonymously, or switch to log in / create account for follow-up.";
    submitButton.textContent = "Submit anonymously";
    nameInput.required = false;
    emailInput.required = false;
    passwordInput.required = false;
    phoneInput.required = false;
  } else if (mode === "login") {
    authPanel.hidden = false;
    authModeText.textContent =
      "Log in to tie your report to an account and follow updates from one place.";
    submitButton.textContent = "Log in and submit";
    nameInput.required = false;
    emailInput.required = true;
    passwordInput.required = true;
    phoneInput.required = false;
  } else {
    authPanel.hidden = false;
    authModeText.textContent =
      "Create an account if you want saved reports, updates, and a history of actions taken.";
    submitButton.textContent = "Create account and submit";
    nameInput.required = true;
    emailInput.required = true;
    passwordInput.required = true;
    phoneInput.required = false;
  }

  for (const field of document.querySelectorAll("[data-auth-visibility]")) {
    field.hidden = field.dataset.authVisibility !== mode;
  }
}

function sanitizeLocation(coords, isPrecise) {
  const precision = isPrecise ? 6 : 3;
  return {
    latitude: Number(coords.latitude.toFixed(precision)),
    longitude: Number(coords.longitude.toFixed(precision)),
    accuracyMeters: Math.round(coords.accuracy ?? 25),
    precise: isPrecise,
  };
}

function updateLocationUi() {
  if (!reportState.location) {
    locationSummaryPill.textContent = "No map pin yet";
    locationStatus.textContent =
      "Your structured Ekiti location is enough to route the report. The map pin is optional but helpful.";

    if (!lgaSelect.value && !communitySelect.value) {
      mapStatus.textContent = "Tap anywhere on the map to pin the exact spot of the issue.";
      locationPillText.textContent = "Ado-Ekiti, Nigeria";
    }
    return;
  }

  const label =
    reportState.locationSource === "gps"
      ? reportState.location.precise
        ? "Live GPS attached"
        : "Approximate GPS attached"
      : "Map pin attached";

  locationSummaryPill.textContent = label;
  locationStatus.textContent = `${label}: ${reportState.location.latitude}, ${reportState.location.longitude}.`;
  mapStatus.textContent =
    reportState.locationSource === "gps"
      ? "Current position added. Tap another point on the map if you want to adjust it."
      : "Map pin added. Tap anywhere else on the map to move it.";
}

function drawMapMarker(rawLocation) {
  if (!reportState.map || !window.L) {
    return;
  }

  const latLng = [rawLocation.latitude, rawLocation.longitude];

  if (!reportState.marker) {
    reportState.marker = window.L.circleMarker(latLng, {
      radius: 10,
      color: "#ffffff",
      weight: 3,
      fillColor: "#0f67ff",
      fillOpacity: 1,
    }).addTo(reportState.map);
  } else {
    reportState.marker.setLatLng(latLng);
  }

  if (reportState.locationSource === "gps") {
    const radius = Math.max(20, rawLocation.accuracy ?? 20);

    if (!reportState.accuracyCircle) {
      reportState.accuracyCircle = window.L.circle(latLng, {
        radius,
        color: "rgba(15, 103, 255, 0.65)",
        weight: 1,
        fillColor: "rgba(15, 103, 255, 0.12)",
        fillOpacity: 0.22,
      }).addTo(reportState.map);
    } else {
      reportState.accuracyCircle.setLatLng(latLng);
      reportState.accuracyCircle.setRadius(radius);
    }
  } else if (reportState.accuracyCircle) {
    reportState.map.removeLayer(reportState.accuracyCircle);
    reportState.accuracyCircle = null;
  }

  reportState.map.flyTo(latLng, Math.max(reportState.map.getZoom(), 15), {
    animate: true,
    duration: 0.45,
  });
}

function setLocation(rawLocation, source) {
  reportState.rawLocation = rawLocation;
  reportState.locationSource = source;
  reportState.location = sanitizeLocation(rawLocation, preciseLocationToggle.checked);
  drawMapMarker(rawLocation);
  updateLocationUi();
}

function clearLocation() {
  reportState.location = null;
  reportState.rawLocation = null;
  reportState.locationSource = null;

  if (reportState.map && reportState.marker) {
    reportState.map.removeLayer(reportState.marker);
    reportState.marker = null;
  }

  if (reportState.map && reportState.accuracyCircle) {
    reportState.map.removeLayer(reportState.accuracyCircle);
    reportState.accuracyCircle = null;
  }

  if (reportState.map) {
    reportState.map.flyTo(EKITI_CENTER, 12, {
      animate: true,
      duration: 0.45,
    });
  }

  updateLocationUi();
}

function initializeMap() {
  if (!window.L) {
    mapStatus.textContent = "The live map failed to load. Reload the page and try again.";
    return;
  }

  const map = window.L.map("liveMap", {
    zoomControl: false,
    attributionControl: true,
  }).setView(EKITI_CENTER, 12);

  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  window.L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  window.L.circle(EKITI_CENTER, {
    radius: EKITI_RADIUS_METERS,
    color: "rgba(15, 59, 46, 0.32)",
    weight: 1.2,
    fillColor: "rgba(15, 59, 46, 0.04)",
    fillOpacity: 0.16,
  }).addTo(map);

  map.on("click", (event) => {
    setLocation(
      {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        accuracy: 25,
      },
      "map"
    );
    expandSheet();
    setActiveNav("report");
  });

  reportState.map = map;
  window.setTimeout(() => map.invalidateSize(), 0);
}

function requestLocation() {
  if (!window.isSecureContext || !navigator.geolocation) {
    mapStatus.textContent =
      "Live GPS needs HTTPS or localhost on this phone. You can still tap the map to place a pin.";
    locationStatus.textContent =
      "Live GPS is blocked here because the page is not in a secure context. Map pinning still works.";
    showToast("Live GPS needs HTTPS. Tap the map to pin the issue instead.", "warning");
    return;
  }

  locationButton.disabled = true;
  mapStatus.textContent = "Requesting live location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        "gps"
      );
      locationButton.disabled = false;
      showToast("Live location attached.");
    },
    (error) => {
      locationButton.disabled = false;
      mapStatus.textContent =
        error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. You can still tap the map to place a pin."
          : "We could not fetch your location right now. Tap the map to place a pin instead.";
      showToast("Location was not granted. You can still pin the map manually.", "warning");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

function handleLocationPrecisionChange() {
  if (!reportState.rawLocation) {
    return;
  }

  reportState.location = sanitizeLocation(
    reportState.rawLocation,
    preciseLocationToggle.checked
  );
  updateLocationUi();
}

function supportsLiveBrowserRecording() {
  return (
    window.isSecureContext &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    "MediaRecorder" in window
  );
}

function getRecorderOptions() {
  if (!window.MediaRecorder || typeof window.MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }

  const mimeTypes = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mimeType of mimeTypes) {
    if (window.MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType };
    }
  }

  return undefined;
}

function clearRecordingTimers() {
  if (reportState.recordingIntervalId) {
    window.clearInterval(reportState.recordingIntervalId);
    reportState.recordingIntervalId = null;
  }

  if (reportState.recordingTimeoutId) {
    window.clearTimeout(reportState.recordingTimeoutId);
    reportState.recordingTimeoutId = null;
  }
}

function stopCameraStream() {
  if (!reportState.stream) {
    return;
  }

  for (const track of reportState.stream.getTracks()) {
    track.stop();
  }

  reportState.stream = null;
  livePreview.srcObject = null;
}

function formatDuration(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function resetRecordingUi() {
  livePreview.hidden = false;
  recordedPreview.hidden = true;
  recordedPreview.removeAttribute("src");
  videoOverlay.hidden = false;
  videoOverlay.innerHTML = EMPTY_VIDEO_MESSAGE;
  recordIndicator.classList.remove("recording");
  recordStateText.textContent = "Ready";
  recordingTime.textContent = `00:00 / ${formatDuration(MAX_RECORDING_SECONDS)}`;
  startRecordingButton.disabled = false;
  stopRecordingButton.disabled = true;
  resetRecordingButton.disabled =
    reportState.recordedBlob === null && reportState.capturedVideoFile === null;
}

function resetRecordedPreviewUrl() {
  if (recordedPreview.src && recordedPreview.src.startsWith("blob:")) {
    URL.revokeObjectURL(recordedPreview.src);
  }
}

function showCapturedVideo(fileOrBlob, labelText) {
  resetRecordedPreviewUrl();
  recordedPreview.src = URL.createObjectURL(fileOrBlob);
  recordedPreview.hidden = false;
  livePreview.hidden = true;
  videoOverlay.hidden = true;
  recordIndicator.classList.remove("recording");
  recordStateText.textContent = "Captured";
  evidenceStatus.textContent = labelText;
  resetRecordingButton.disabled = false;
}

function startRecordingTimer() {
  reportState.recordingSeconds = 0;
  recordingTime.textContent = `${formatDuration(0)} / ${formatDuration(
    MAX_RECORDING_SECONDS
  )}`;

  reportState.recordingIntervalId = window.setInterval(() => {
    reportState.recordingSeconds += 1;
    recordingTime.textContent = `${formatDuration(
      reportState.recordingSeconds
    )} / ${formatDuration(MAX_RECORDING_SECONDS)}`;
  }, 1000);

  reportState.recordingTimeoutId = window.setTimeout(() => {
    if (reportState.recorder && reportState.recorder.state === "recording") {
      reportState.recorder.stop();
    }
  }, MAX_RECORDING_SECONDS * 1000);
}

function resetRecordingState() {
  clearRecordingTimers();
  reportState.recordingSeconds = 0;
  reportState.recorder = null;
  reportState.discardNextRecording = false;
  stopCameraStream();
  resetRecordingUi();
}

async function startRecording() {
  if (!supportsLiveBrowserRecording()) {
    recordStateText.textContent = "Phone camera";
    evidenceStatus.textContent =
      "Live browser recording is not available here. Opening your phone camera instead.";
    showToast("Using your phone camera because browser recording is blocked here.");
    nativeVideoCapture.click();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    });

    const recorderOptions = getRecorderOptions();
    const recorder = recorderOptions
      ? new MediaRecorder(stream, recorderOptions)
      : new MediaRecorder(stream);
    const chunks = [];

    reportState.stream = stream;
    reportState.recorder = recorder;
    reportState.recordedBlob = null;
    reportState.capturedVideoFile = null;
    reportState.discardNextRecording = false;
    livePreview.srcObject = stream;
    livePreview.muted = true;
    livePreview.play().catch(() => {});
    livePreview.hidden = false;
    recordedPreview.hidden = true;
    videoOverlay.hidden = true;
    recordIndicator.classList.add("recording");
    recordStateText.textContent = "Recording";
    evidenceStatus.textContent = "Recording inside the browser. Tap stop when you are done.";
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    resetRecordingButton.disabled = true;
    startRecordingTimer();

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", () => {
      clearRecordingTimers();
      const shouldDiscard = reportState.discardNextRecording;
      reportState.discardNextRecording = false;
      reportState.recorder = null;
      stopCameraStream();
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;

      if (shouldDiscard || chunks.length === 0) {
        reportState.recordedBlob = null;
        resetRecordingUi();
        evidenceStatus.textContent =
          "If live browser recording is unavailable on this phone, tapping record opens the native camera recorder instead.";
        return;
      }

      reportState.recordedBlob = new Blob(chunks, {
        type: recorder.mimeType || "video/webm",
      });
      showCapturedVideo(
        reportState.recordedBlob,
        "Live browser recording captured successfully."
      );
      showToast("Video evidence captured.");
    });

    recorder.start();
  } catch (error) {
    stopCameraStream();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
    recordStateText.textContent = "Permission blocked";
    evidenceStatus.textContent =
      "Camera or microphone permission was blocked. The phone camera fallback is still available.";
    showToast("Camera permission was blocked. Opening phone camera instead.", "warning");
    nativeVideoCapture.click();
  }
}

function stopRecording() {
  if (!reportState.recorder || reportState.recorder.state !== "recording") {
    return;
  }

  reportState.recorder.stop();
}

function clearRecording() {
  resetRecordedPreviewUrl();
  attachmentInput.value = "";
  nativeVideoCapture.value = "";
  reportState.recordedBlob = null;
  reportState.capturedVideoFile = null;

  if (reportState.recorder && reportState.recorder.state !== "inactive") {
    reportState.discardNextRecording = true;
    reportState.recorder.stop();
    return;
  }

  resetRecordingState();
  evidenceStatus.textContent =
    "If live browser recording is unavailable on this phone, tapping record opens the native camera recorder instead.";
}

function handleNativeVideoCapture() {
  const file = nativeVideoCapture.files[0];

  if (!file) {
    return;
  }

  reportState.capturedVideoFile = file;
  reportState.recordedBlob = null;
  startRecordingButton.disabled = false;
  stopRecordingButton.disabled = true;
  showCapturedVideo(file, `Captured with your phone camera: ${file.name || "video file"}.`);
  showToast("Video attached from your phone camera.");
}

function handleAttachmentSelection() {
  const file = attachmentInput.files[0];

  if (!file) {
    evidenceStatus.textContent =
      "If live browser recording is unavailable on this phone, tapping record opens the native camera recorder instead.";
    return;
  }

  evidenceStatus.textContent = `Attached evidence: ${file.name}.`;
  showToast("Attachment added.");
}

function getStoredReports() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch (error) {
    return [];
  }
}

function saveStoredReports(reports) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function generateTrackingId() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = window.crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(36)
    .slice(0, 6)
    .toUpperCase();
  return `EKB-${datePart}-${randomPart}`;
}

function buildReportPayload(formData) {
  const identityMode = formData.get("identityMode");
  const route = determineRoute(formData.get("issueType"));
  const evidenceFile = reportState.capturedVideoFile ?? attachmentInput.files[0] ?? null;
  const locationSummary = [
    "Ekiti State",
    formData.get("lga"),
    formData.get("community"),
    formData.get("ward"),
    formData.get("landmark")?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    id: generateTrackingId(),
    createdAt: new Date().toISOString(),
    identityMode,
    issueType: formData.get("issueType"),
    urgency: formData.get("urgency"),
    summary: formData.get("summary")?.trim(),
    contact:
      identityMode === "anonymous"
        ? null
        : {
            name: formData.get("name")?.trim(),
            email: formData.get("email")?.trim(),
            phone: formData.get("phone")?.trim(),
          },
    location: {
      state: window.EKITI_DATA.state,
      lga: formData.get("lga"),
      community: formData.get("community"),
      ward: formData.get("ward"),
      landmark: formData.get("landmark")?.trim(),
      gps: reportState.location,
      gpsSource: reportState.locationSource,
      summary: locationSummary,
    },
    evidence: {
      attachmentName: evidenceFile?.name ?? null,
      hasRecordedVideo: Boolean(reportState.recordedBlob || reportState.capturedVideoFile),
      recordingMode: reportState.recordedBlob
        ? "live-browser"
        : reportState.capturedVideoFile
          ? "native-phone"
          : null,
    },
    status: "Received",
    assignedDesk: route,
  };
}

function populateReportDetail(report) {
  detailTitle.textContent = `${report.issueType} • ${report.urgency}`;
  detailTrackingId.textContent = report.id;
  detailStatus.textContent = report.status;
  detailDesk.textContent = report.assignedDesk;
  detailLocation.textContent = report.location.gps
    ? `${report.location.summary} • Pin attached`
    : report.location.summary;
  detailSummary.textContent = report.summary;
}

function openReportDetail(reportId) {
  const report = getStoredReports().find((item) => item.id === reportId);

  if (!report) {
    showToast("That report could not be found on this device.", "warning");
    return;
  }

  populateReportDetail(report);
  openPopup("detail");
}

function renderLedgerList(container, reports) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (reports.length === 0) {
    container.innerHTML =
      '<p class="ledger-empty">No reports stored yet. Send one to preview the tracking flow.</p>';
    return;
  }

  for (const report of reports) {
    const item = ledgerItemTemplate.content.firstElementChild.cloneNode(true);
    item.dataset.reportId = report.id;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Open report ${report.id}`);
    item.querySelector(".ledger-id").textContent = report.id;
    item.querySelector(".ledger-status").textContent = report.status;
    item.querySelector(".ledger-title").textContent = report.issueType;
    item.querySelector(
      ".ledger-route"
    ).textContent = `${report.assignedDesk} • ${report.location.summary}`;
    item.querySelector(".ledger-meta").textContent = `${report.identityMode} • ${new Date(
      report.createdAt
    ).toLocaleString()}`;

    const openItem = () => openReportDetail(report.id);
    item.addEventListener("click", openItem);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openItem();
      }
    });

    container.append(item);
  }
}

function renderLedger() {
  const reports = getStoredReports().slice().reverse();
  renderLedgerList(ledgerList, reports);
  renderLedgerList(historyList, reports);
}

function persistReport(report) {
  const reports = getStoredReports();
  reports.push(report);
  saveStoredReports(reports);
  renderLedger();
}

function validateLocation(formData) {
  return Boolean(formData.get("lga") && formData.get("community"));
}

function resetSelectors() {
  lgaSelect.value = "";
  setSelectOptions(communitySelect, [], "Select town or community", true);
  setSelectOptions(wardSelect, [], "Select ward", true);
}

function resetSubmissionState() {
  form.reset();
  setIdentityMode("anonymous");
  resetSelectors();
  updateRoutePreview();
  clearLocation();
  clearRecording();
  landmarkInput.value = "";
  preciseLocationToggle.checked = true;
  locationPillText.textContent = "Ado-Ekiti, Nigeria";
}

function submitReport(event) {
  event.preventDefault();
  const formData = new FormData(form);

  if (!validateLocation(formData)) {
    locationStatus.textContent =
      "Select the Ekiti local government and town or community before you submit.";
    showToast("Choose the Ekiti local government and town before submitting.", "warning");
    expandSheet();
    return;
  }

  const report = buildReportPayload(formData);
  persistReport(report);
  successPanel.hidden = false;
  successMessage.textContent = `Tracking ID ${report.id} was created and routed to ${report.assignedDesk}. The analytics dashboard phase will later aggregate hotspots, loudest issues, and response performance.`;
  resetSubmissionState();
  expandSheet({ scrollToTop: true });
  showToast(`Report ${report.id} submitted.`);
  populateReportDetail(report);
  openPopup("detail");
}

function registerInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    reportState.deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!reportState.deferredInstallPrompt) {
      return;
    }

    reportState.deferredInstallPrompt.prompt();
    await reportState.deferredInstallPrompt.userChoice;
    reportState.deferredInstallPrompt = null;
    installButton.hidden = true;
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        // Prototype only.
      });
    });
  }
}

for (const tab of identityTabs) {
  tab.addEventListener("click", () => {
    setIdentityMode(tab.dataset.identityMode);
    expandSheet();
    setActiveNav(tab.dataset.identityMode === "anonymous" ? "report" : "account");
  });
}

for (const chip of issueChips) {
  chip.addEventListener("click", () => {
    issueTypeSelect.value = chip.dataset.issueType;
    updateRoutePreview();
    expandSheet();
    setActiveNav("report");
  });
}

for (const button of popupCloseButtons) {
  button.addEventListener("click", closeAllPopups);
}

for (const button of popupActionButtons) {
  button.addEventListener("click", () => {
    const action = button.dataset.popupAction;

    if (action === "open-history") {
      openPopup("history");
      return;
    }

    if (action === "open-account") {
      openPopup("account");
      return;
    }

    closeAllPopups();
    expandSheet({ scrollToTop: true });
    setActiveNav("report");
  });
}

for (const card of accountModeCards) {
  card.addEventListener("click", () => {
    focusAccountMode(card.dataset.accountMode);
    showToast(
      card.dataset.accountMode === "anonymous"
        ? "Anonymous reporting is ready."
        : "Account mode switched."
    );
  });
}

issueTypeSelect.addEventListener("change", updateRoutePreview);
lgaSelect.addEventListener("change", () => {
  populateCommunities();
  expandSheet();
});
communitySelect.addEventListener("change", populateWards);
locationButton.addEventListener("click", requestLocation);
clearMapButton.addEventListener("click", () => {
  clearLocation();
  showToast("Map pin cleared.");
});
preciseLocationToggle.addEventListener("change", handleLocationPrecisionChange);
attachmentInput.addEventListener("change", handleAttachmentSelection);
startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
resetRecordingButton.addEventListener("click", clearRecording);
nativeVideoCapture.addEventListener("change", handleNativeVideoCapture);
form.addEventListener("submit", submitReport);
form.addEventListener("input", () => {
  if (!successPanel.hidden) {
    successPanel.hidden = true;
  }
});

menuButton.addEventListener("click", () => openPopup("menu"));
alertsButton.addEventListener("click", () => openPopup("alerts"));
accountButton.addEventListener("click", () => openPopup("account"));
navAccountButton.addEventListener("click", () => openPopup("account"));
trackNavButton.addEventListener("click", () => openPopup("history"));
reportNavButton.addEventListener("click", () => {
  closeAllPopups();
  expandSheet({ scrollToTop: true });
  setActiveNav("report");
});
homeNavButton.addEventListener("click", () => {
  closeAllPopups();
  setSheetCollapsed(true);
  if (reportState.map) {
    reportState.map.flyTo(EKITI_CENTER, 12, {
      animate: true,
      duration: 0.45,
    });
  }
});

sheetToggleButton.addEventListener("click", () => {
  setSheetCollapsed(!reportState.sheetCollapsed);
});

modalBackdrop.addEventListener("click", closeAllPopups);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && reportState.activePopup) {
    closeAllPopups();
  }
});

populateLgas();
setIdentityMode("anonymous");
setActiveNav("report");
updateRoutePreview();
initializeMap();
updateLocationUi();
resetRecordingUi();
renderLedger();
registerInstallPrompt();
registerServiceWorker();
