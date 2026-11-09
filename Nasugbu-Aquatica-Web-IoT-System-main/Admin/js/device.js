const LIMITS = {
  ph:   { min: 0,  max: 14,  safe: [6.5, 8.0], danger: [6.0, 8.5] },
  hum:  { min: 0,  max: 100, safe: [40, 70],   danger: [30, 80] },
  temp: { min: 15, max: 40,  safe: [24, 28],   danger: [22, 30] }
};
const LABELS = { good: "Normal", warning: "Warning", danger: "Danger" };

function getStatus(v, l) {
  if (v < l.danger[0] || v > l.danger[1]) return "danger";
  if (v < l.safe[0]   || v > l.safe[1])   return "warning";
  return "good";
}

function updateCard(id, value, limits, decimals) {
  const valueEl  = document.getElementById(id + "-value");
  const statusEl = document.getElementById(id + "-status");
  const markerEl = document.getElementById(id + "-marker");

  if (value === null) {                       // sensor not connected
    valueEl.textContent = "--";
    statusEl.className = "reading-status status-offline";
    statusEl.innerHTML = "<span></span> No data";
    return;
  }

  value = parseFloat(value);
  const status = getStatus(value, limits);
  valueEl.textContent = value.toFixed(decimals);
  statusEl.className = "reading-status status-" + status;
  statusEl.innerHTML = "<span></span> " + LABELS[status];

  const pct = (value - limits.min) / (limits.max - limits.min) * 100;
  markerEl.style.left = Math.min(100, Math.max(0, pct)) + "%";
}

function setDeviceStatus(text, cls) {
  const el = document.getElementById("device-status");
  el.className = "device-status " + cls;
  el.innerHTML = "<span></span> " + text;
}

async function fetchLatest() {
  try {
    const res  = await fetch("../../api/latest.php", { cache: "no-store" });
    const data = await res.json();
    if (!data) throw new Error("No readings yet");

    updateCard("ph",   data.ph,          LIMITS.ph,   1);
    updateCard("hum",  data.humidity,    LIMITS.hum,  0);
    updateCard("temp", data.temperature, LIMITS.temp, 1);

    const online = Number(data.age_seconds) <= 15;
    if (online) setDeviceStatus("Live", "is-live");
    else        setDeviceStatus("Device offline", "is-offline");
  } catch (err) {
    setDeviceStatus("No connection", "is-offline");
  }
}

fetchLatest();                    // run once immediately
setInterval(fetchLatest, 3000);   // then every 3 seconds