// app.js - Network Calculator Suite
// Contains all calculator logic, UI interaction, and event initialization

// ============== IPv4 Utilities ==============
function ipToOctets(ip) {
  if (typeof ip !== "string") throw new Error("Invalid IPv4 format");
  const parts = ip.trim().split(".");
  if (parts.length !== 4) throw new Error("Invalid IPv4 format (must be 4 octets)");
  const vals = parts.map(p => {
    const trimmed = p.trim();
    if (!/^\d+$/.test(trimmed)) throw new Error("IPv4 must be numeric octets");
    const v = parseInt(trimmed, 10);
    if (v < 0 || v > 255) throw new Error("Octets must be 0–255");
    return v;
  });
  return vals;
}

function octetsToIP(a, b, c, d) {
  return [a, b, c, d].join(".");
}

function maskFromPrefix(prefix) {
  if (prefix < 0 || prefix > 32) throw new Error("Prefix must be 0–32");
  const bits = Array(32).fill(0).map((_, i) => i < prefix ? 1 : 0);
  const octets = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    let val = 0;
    for (let j = 0; j < 8; j++) {
      val = (val << 1) | bits[i * 8 + j];
    }
    octets[i] = val;
  }
  return octetsToIP(...octets);
}

function wildcardFromMask(mask) {
  const [a, b, c, d] = ipToOctets(mask);
  return octetsToIP(255 - a, 255 - b, 255 - c, 255 - d);
}

function classOfIP([a]) {
  if (a >= 1 && a <= 126) return "Class A";
  if (a === 127) return "Loopback";
  if (a >= 128 && a <= 191) return "Class B";
  if (a >= 192 && a <= 223) return "Class C";
  if (a >= 224 && a <= 239) return "Multicast (D)";
  if (a >= 240) return "Experimental (E)";
  return "Unknown";
}

function isPrivateIP([a, b]) {
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function toInt([a, b, c, d]) {
  return ((a << 24) >>> 0) + (b << 16) + (c << 8) + d;
}

function fromInt(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

function maskInt(prefix) {
  return prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0);
}

function bitsOfOctet(n) {
  return n.toString(2).padStart(8, "0");
}

function smallestPrefixForHosts(hosts) {
  if (hosts <= 0) return 32;
  const needed = hosts + 2;
  for (let p = 32; p >= 0; p--) {
    const available = Math.pow(2, 32 - p);
    if (available >= needed) return p;
  }
  return 0;
}

// ============== IPv4 Calculator ==============
function calculateIPv4() {
  const baseNetErr = document.getElementById("v4_baseNetErr");
  const baseNetEl = document.getElementById("v4_baseNet");
  const warn = document.getElementById("v4_warn");
  const outputs = document.getElementById("v4_outputs");
  
  if (baseNetErr) baseNetErr.style.display = "none";
  if (warn) warn.style.display = "none";

  const basePrefix = parseInt(document.getElementById("v4_basePrefix").value, 10);
  const desiredPrefix = parseInt(document.getElementById("v4_desiredPrefix").value, 10);

  let baseIp;
  try {
    baseIp = ipToOctets(baseNetEl.value);
  } catch (e) {
    if (baseNetErr) {
      baseNetErr.textContent = e.message;
      baseNetErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  if (desiredPrefix < basePrefix) {
    if (baseNetErr) {
      baseNetErr.textContent = "Desired prefix must be ≥ base prefix";
      baseNetErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  const baseInt = toInt(baseIp);
  const baseMask = maskInt(basePrefix);
  const baseNetInt = (baseInt & baseMask) >>> 0;
  const subnetSize = Math.pow(2, 32 - desiredPrefix) >>> 0;
  const subnetBits = desiredPrefix - basePrefix;
  const numSubnets = Math.pow(2, subnetBits);
  const hostBits = 32 - desiredPrefix;
  const usableHosts = hostBits <= 1 ? 0 : Math.pow(2, hostBits) - 2;

  document.getElementById("v4_hostBits").textContent = hostBits;
  document.getElementById("v4_usableHosts").textContent = usableHosts.toLocaleString();
  document.getElementById("v4_subnetBits").textContent = subnetBits;
  document.getElementById("v4_numSubnets").textContent = numSubnets.toLocaleString();

  const mask = maskFromPrefix(desiredPrefix);
  const wc = wildcardFromMask(mask);
  document.getElementById("v4_maskText").textContent = mask;
  document.getElementById("v4_wildcardText").textContent = wc;

  const cls = classOfIP(baseIp);
  const priv = isPrivateIP(baseIp) ? "Private (RFC 1918)" : "Public";
  document.getElementById("v4_ipClass").textContent = cls;
  document.getElementById("v4_ipPriv").textContent = priv;
  document.getElementById("v4_cidrText").textContent = octetsToIP(...fromInt(baseNetInt)) + "/" + basePrefix;

  const gatewayPref = document.getElementById("v4_gatewayPref").value;
  const tbody = document.querySelector("#v4_rangesTable tbody");
  tbody.innerHTML = "";

  const renderLimit = Math.min(numSubnets, 50);
  for (let i = 0; i < renderLimit; i++) {
    const networkInt = (baseNetInt + i * subnetSize) >>> 0;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;

    let firstText = octetsToIP(...fromInt(firstInt));
    let lastText = octetsToIP(...fromInt(lastInt));
    let gw = gatewayPref === "first" ? firstText : lastText;

    if (usableHosts <= 0) {
      firstText = "N/A";
      lastText = "N/A";
      gw = "N/A";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td class="mono">${octetsToIP(...fromInt(networkInt))}/${desiredPrefix}</td><td class="mono">${firstText}</td><td class="mono">${lastText}</td><td class="mono">${octetsToIP(...fromInt(broadcastInt))}</td><td class="mono">${gw}</td>`;
    tbody.appendChild(tr);
  }

  if (numSubnets > 50 && warn) {
    warn.textContent = `Showing first 50 of ${numSubnets.toLocaleString()} subnets. Adjust base or desired prefix for less detail.`;
    warn.style.display = "block";
  }

  const scope = usableHosts;
  const res = Math.ceil(scope * 0.1);
  document.getElementById("v4_dhcpScope").textContent = scope > 0 ? `${scope.toLocaleString()} addresses` : "0 (Not applicable)";
  document.getElementById("v4_dhcpRes").textContent = scope > 0 ? `${res.toLocaleString()} addresses (~10%)` : "N/A";

  if (outputs) outputs.style.display = "block";
}

function exportIPv4() {
  const rows = [["#", "Network", "First usable", "Last usable", "Broadcast", "Gateway"]];
  document.querySelectorAll("#v4_rangesTable tbody tr").forEach(tr => {
    rows.push(Array.from(tr.children).map(td => td.textContent));
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ipv4-subnetting.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function copyIPv4() {
  const mask = document.getElementById("v4_maskText").textContent;
  if (!mask) {
    alert("Please calculate subnets first.");
    return;
  }
  const lines = ["=== IPv4 Subnetting Summary ==="];
  lines.push("Base Network: " + document.getElementById("v4_cidrText").textContent);
  lines.push("Subnet Mask: " + mask);
  lines.push("Wildcard Mask: " + document.getElementById("v4_wildcardText").textContent);
  lines.push("Usable Hosts / Subnet: " + document.getElementById("v4_usableHosts").textContent);
  lines.push("Total Subnets: " + document.getElementById("v4_numSubnets").textContent);
  lines.push("IP Class: " + document.getElementById("v4_ipClass").textContent + " (" + document.getElementById("v4_ipPriv").textContent + ")");
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied IPv4 summary to clipboard."));
}

function calcAclWildcard() {
  const maskInput = document.getElementById("v4_aclMask");
  try {
    const wc = wildcardFromMask(maskInput.value);
    document.getElementById("v4_aclWildcard").value = wc;
    document.getElementById("v4_aclExample").textContent = `Example: access-list 100 permit ip 0.0.0.0 ${wc}`;
  } catch (e) {
    alert("Invalid subnet mask: " + e.message);
  }
}

// ============== IPv6 Utilities & Calculator ==============
function normalizeIPv6(ip) {
  if (typeof ip !== "string") throw new Error("Invalid IPv6 format");
  ip = ip.toLowerCase().replace(/\s/g, "");
  if (!ip) throw new Error("Enter an IPv6 address");
  
  if (ip.split("::").length > 2) {
    throw new Error("IPv6 address cannot contain multiple '::'");
  }
  
  if (ip.includes("::")) {
    const [left, right] = ip.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missing = 8 - leftParts.length - rightParts.length;
    if (missing < 1) throw new Error("Invalid IPv6 address (too many hextets)");
    const middle = Array(missing).fill("0000");
    const all = [...leftParts, ...middle, ...rightParts];
    if (all.length !== 8) throw new Error("Invalid IPv6 address");
    return all.map(p => {
      if (!/^[0-9a-f]{1,4}$/.test(p)) throw new Error("Invalid hex characters in IPv6");
      return p.padStart(4, "0");
    }).join(":");
  }
  
  const parts = ip.split(":");
  if (parts.length !== 8) throw new Error("Invalid IPv6 address (must have 8 hextets or use '::')");
  return parts.map(p => {
    if (!/^[0-9a-f]{1,4}$/.test(p)) throw new Error("Invalid hex characters in IPv6");
    return p.padStart(4, "0");
  }).join(":");
}

function compressIPv6(fullHex) {
  const hextets = fullHex.split(":").map(h => parseInt(h, 16).toString(16));
  let bestStart = -1, bestLen = 0;
  let curStart = -1, curLen = 0;

  for (let i = 0; i < hextets.length; i++) {
    if (hextets[i] === "0") {
      if (curStart === -1) {
        curStart = i;
        curLen = 1;
      } else {
        curLen++;
      }
      if (curLen > bestLen && curLen >= 2) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen >= 2) {
    const left = hextets.slice(0, bestStart).join(":");
    const right = hextets.slice(bestStart + bestLen).join(":");
    return `${left}::${right}`;
  }
  return hextets.join(":");
}

function ipv6Network(fullHex, prefix) {
  const hextets = fullHex.split(":").map(h => parseInt(h, 16));
  const netHextets = hextets.map((val, idx) => {
    const bitStart = idx * 16;
    const bitEnd = (idx + 1) * 16;
    if (prefix <= bitStart) return 0;
    if (prefix >= bitEnd) return val;
    const keepBits = prefix - bitStart;
    const mask = (0xFFFF << (16 - keepBits)) & 0xFFFF;
    return val & mask;
  });
  return netHextets.map(h => h.toString(16).padStart(4, "0")).join(":");
}

function calcIPv6() {
  const netErr = document.getElementById("v6_netErr");
  const outputs = document.getElementById("v6_outputs");
  if (netErr) netErr.style.display = "none";

  const netInput = document.getElementById("v6_net").value;
  try {
    const full = normalizeIPv6(netInput);
    const prefix = parseInt(document.getElementById("v6_prefix").value, 10);
    const netFull = ipv6Network(full, prefix);
    const netCompressed = compressIPv6(netFull);
    const inputCompressed = compressIPv6(full);

    document.getElementById("v6_network").textContent = `${netCompressed}/${prefix}`;
    document.getElementById("v6_prefixOut").textContent = prefix;
    document.getElementById("v6_full").textContent = full;
    document.getElementById("v6_compressed").textContent = inputCompressed;
    if (outputs) outputs.style.display = "block";
  } catch (e) {
    if (netErr) {
      netErr.textContent = e.message;
      netErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
  }
}

function copyIPv6() {
  const net = document.getElementById("v6_network").textContent;
  if (!net) {
    alert("Please calculate IPv6 first.");
    return;
  }
  const lines = ["=== IPv6 Summary ==="];
  lines.push("Network: " + net);
  lines.push("Prefix: /" + document.getElementById("v6_prefixOut").textContent);
  lines.push("Full Expanded: " + document.getElementById("v6_full").textContent);
  lines.push("Compressed: " + document.getElementById("v6_compressed").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied IPv6 summary to clipboard."));
}

// ============== VLSM Calculator ==============
function calcVLSM() {
  const baseErr = document.getElementById("vlsm_baseErr");
  const hostsErr = document.getElementById("vlsm_hostsErr");
  const warn = document.getElementById("vlsm_warn");
  const outputs = document.getElementById("vlsm_outputs");

  if (baseErr) baseErr.style.display = "none";
  if (hostsErr) hostsErr.style.display = "none";
  if (warn) warn.style.display = "none";

  const base = document.getElementById("vlsm_base").value;
  const basePrefix = parseInt(document.getElementById("vlsm_prefix").value, 10);

  let baseIp;
  try {
    baseIp = ipToOctets(base);
  } catch (e) {
    if (baseErr) {
      baseErr.textContent = e.message;
      baseErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  const rawHosts = document.getElementById("vlsm_hosts").value;
  const hostList = rawHosts
    .split(",")
    .map(x => parseInt(x.trim(), 10))
    .filter(x => !isNaN(x) && x > 0)
    .sort((a, b) => b - a);

  if (hostList.length === 0) {
    if (hostsErr) {
      hostsErr.textContent = "Please enter one or more comma-separated host requirements (e.g., 100, 50, 25)";
      hostsErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  const tbody = document.querySelector("#vlsm_table tbody");
  tbody.innerHTML = "";

  const baseInt = toInt(baseIp);
  const baseNetInt = (baseInt & maskInt(basePrefix)) >>> 0;
  const baseBlockSize = Math.pow(2, 32 - basePrefix);
  let currentNetInt = baseNetInt;
  const gwPref = document.getElementById("vlsm_gateway").value;

  const warnings = [];

  for (let i = 0; i < hostList.length; i++) {
    const h = hostList[i];
    const pref = smallestPrefixForHosts(h);
    if (pref < basePrefix) {
      warnings.push(`Subnet #${i + 1} (${h} hosts) requires /${pref}, which exceeds the base block (/${basePrefix}).`);
    }

    const subnetSize = Math.pow(2, 32 - pref) >>> 0;
    const networkInt = currentNetInt;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;
    const gw = gwPref === "first" ? octetsToIP(...fromInt(firstInt)) : octetsToIP(...fromInt(lastInt));

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${h}</td><td>/${pref}</td><td class="mono">${octetsToIP(...fromInt(networkInt))}/${pref}</td><td class="mono">${octetsToIP(...fromInt(firstInt))}</td><td class="mono">${octetsToIP(...fromInt(lastInt))}</td><td class="mono">${octetsToIP(...fromInt(broadcastInt))}</td><td class="mono">${gw}</td>`;
    tbody.appendChild(tr);

    currentNetInt = (networkInt + subnetSize) >>> 0;
  }

  const totalAllocated = currentNetInt - baseNetInt;
  if (totalAllocated > baseBlockSize) {
    warnings.push(`Total allocation (${totalAllocated.toLocaleString()} addresses) exceeds available base block capacity (${baseBlockSize.toLocaleString()} addresses).`);
  }

  if (warnings.length > 0 && warn) {
    warn.innerHTML = warnings.join("<br>");
    warn.style.display = "block";
  }

  if (outputs) outputs.style.display = "block";
}

function exportVLSM() {
  const rows = [["#", "Hosts req.", "Prefix", "Network", "First usable", "Last usable", "Broadcast", "Gateway"]];
  document.querySelectorAll("#vlsm_table tbody tr").forEach(tr => {
    rows.push(Array.from(tr.children).map(td => td.textContent));
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vlsm-plan.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function copyVLSM() {
  const rows = document.querySelectorAll("#vlsm_table tbody tr");
  if (rows.length === 0) {
    alert("Please calculate VLSM plan first.");
    return;
  }
  const lines = ["#\tHosts\tPrefix\tNetwork\tFirst Usable\tLast Usable\tBroadcast\tGateway"];
  rows.forEach(tr => {
    lines.push(Array.from(tr.children).map(td => td.textContent).join("\t"));
  });
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied VLSM plan to clipboard."));
}

// ============== Supernet Calculator ==============
function parseCIDR(cidr) {
  const trimmed = cidr.trim();
  const parts = trimmed.split("/");
  if (parts.length !== 2) throw new Error(`Invalid CIDR notation "${cidr}": expected IP/prefix`);
  const ip = ipToOctets(parts[0]);
  const prefix = parseInt(parts[1].trim(), 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error(`Invalid prefix in "${cidr}": must be 0–32`);
  return { ip, prefix };
}

function summarizeRoutes(nets) {
  if (!nets || nets.length === 0) throw new Error("No networks provided");

  let minStart = 0xFFFFFFFF;
  let maxEnd = 0;

  for (const net of nets) {
    const netInt = toInt(net.ip);
    const mask = maskInt(net.prefix);
    const startInt = (netInt & mask) >>> 0;
    const size = Math.pow(2, 32 - net.prefix);
    const endInt = (startInt + size - 1) >>> 0;

    if (startInt < minStart) minStart = startInt;
    if (endInt > maxEnd) maxEnd = endInt;
  }

  let common = 0;
  for (let i = 31; i >= 0; i--) {
    const bitMin = (minStart >>> i) & 1;
    const bitMax = (maxEnd >>> i) & 1;
    if (bitMin === bitMax) common++;
    else break;
  }

  const summaryMask = maskInt(common);
  const summaryNetInt = (minStart & summaryMask) >>> 0;
  const summaryIP = octetsToIP(...fromInt(summaryNetInt));

  return {
    summary: `${summaryIP}/${common}`,
    prefix: common,
    startIP: octetsToIP(...fromInt(minStart)),
    endIP: octetsToIP(...fromInt(maxEnd))
  };
}

function calcSupernet() {
  const errEl = document.getElementById("supernet_err");
  const outputs = document.getElementById("supernet_outputs");
  if (errEl) errEl.style.display = "none";

  const raw = document.getElementById("agg_list").value;
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    if (errEl) {
      errEl.textContent = "Please add one or more CIDR networks to summarize (one per line).";
      errEl.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  try {
    const nets = lines.map(parseCIDR);
    const result = summarizeRoutes(nets);
    document.getElementById("agg_result").value =
      `Summary Route: ${result.summary}\nAddress Range: ${result.startIP} - ${result.endIP}\nTotal Inputs: ${nets.length} route(s)`;
    if (outputs) outputs.style.display = "block";
  } catch (e) {
    if (errEl) {
      errEl.textContent = e.message;
      errEl.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
  }
}

function copySupernet() {
  const t = document.getElementById("agg_result").value;
  if (!t) {
    alert("Please summarize routes first.");
    return;
  }
  navigator.clipboard.writeText(t).then(() => alert("Copied summary route to clipboard."));
}

// ============== Binary Calculator ==============
function calcBinary() {
  const ipErr = document.getElementById("bin_ipErr");
  const outputs = document.getElementById("bin_outputs");
  if (ipErr) ipErr.style.display = "none";

  let ip;
  try {
    ip = ipToOctets(document.getElementById("bin_ip").value);
  } catch (e) {
    if (ipErr) {
      ipErr.textContent = e.message;
      ipErr.style.display = "block";
    }
    if (outputs) outputs.style.display = "none";
    return;
  }

  const prefix = parseInt(document.getElementById("bin_prefix").value, 10);
  const mask = maskFromPrefix(prefix);
  const wc = wildcardFromMask(mask);
  const ipInt = toInt(ip);
  const maskI = maskInt(prefix);
  const netInt = (ipInt & maskI) >>> 0;
  const net = fromInt(netInt);

  document.getElementById("bin_mask").textContent = mask;
  document.getElementById("bin_wc").textContent = wc;
  document.getElementById("bin_network").textContent = octetsToIP(...net) + "/" + prefix;

  const bits = ip.map(bitsOfOctet);
  const maskBits = fromInt(maskI).map(bitsOfOctet);

  function decorate(octBits, maskOctBits) {
    let out = "";
    for (let i = 0; i < 8; i++) {
      const isNet = maskOctBits[i] === "1";
      out += isNet
        ? `<span class="netbit">${octBits[i]}</span>`
        : `<span class="hostbit">${octBits[i]}</span>`;
    }
    return out;
  }

  document.getElementById("bin_oct1").innerHTML = `Octet 1: ${decorate(bits[0], maskBits[0])}`;
  document.getElementById("bin_oct2").innerHTML = `Octet 2: ${decorate(bits[1], maskBits[1])}`;
  document.getElementById("bin_oct3").innerHTML = `Octet 3: ${decorate(bits[2], maskBits[2])}`;
  document.getElementById("bin_oct4").innerHTML = `Octet 4: ${decorate(bits[3], maskBits[3])}`;

  if (outputs) outputs.style.display = "block";
}

function copyBinary() {
  const net = document.getElementById("bin_network").textContent;
  if (!net) {
    alert("Please calculate binary visualization first.");
    return;
  }
  const lines = ["=== Binary Breakdown ==="];
  lines.push("Network: " + net);
  lines.push("Mask: " + document.getElementById("bin_mask").textContent);
  lines.push("Wildcard: " + document.getElementById("bin_wc").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied binary summary to clipboard."));
}

// ============== Tab & Modal Initialization ==============
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
  const titleMap = {
    home: "Home",
    ipv4: "IPv4 Subnetting",
    ipv6: "IPv6 Calculator",
    vlsm: "VLSM Planning",
    supernet: "Route Aggregation",
    binary: "Binary Visualization"
  };

  function switchTab(tabName) {
    document.querySelectorAll(".sidebar-item").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tabName);
    });

    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      pageTitle.textContent = titleMap[tabName] || "Calculator";
    }

    document.querySelectorAll(".tabpane").forEach(pane => {
      pane.style.display = pane.id === tabName ? "block" : "none";
    });

    const topBar = document.querySelector(".top-bar");
    if (topBar) {
      if (tabName === "home") {
        topBar.classList.add("home-hidden");
      } else {
        topBar.classList.remove("home-hidden");
      }
    }
  }

  // Sidebar navigation
  document.querySelectorAll(".sidebar-item").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Feature cards on home page
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("click", () => {
      const tabName = card.dataset.tab;
      const sidebarBtn = document.querySelector(`.sidebar-item[data-tab="${tabName}"]`);
      if (sidebarBtn) sidebarBtn.click();
    });
  });

  // Synchronize basePrefix and desiredPrefix options for IPv4
  const v4BaseSel = document.getElementById("v4_basePrefix");
  const v4DesSel = document.getElementById("v4_desiredPrefix");
  if (v4BaseSel && v4DesSel) {
    v4BaseSel.addEventListener("change", () => {
      const baseVal = parseInt(v4BaseSel.value, 10);
      const desVal = parseInt(v4DesSel.value, 10);
      if (desVal < baseVal) {
        // Automatically adjust desired prefix to baseVal or baseVal + 2
        const nextVal = Math.min(30, baseVal + 2);
        v4DesSel.value = String(nextVal >= baseVal ? nextVal : baseVal);
      }
    });
  }

  // Web Search functionality
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchEngine = document.getElementById("searchEngine");

  if (searchForm && searchInput && searchEngine) {
    const searchWrapper = document.querySelector(".search-input-wrapper");
    if (searchWrapper) {
      searchWrapper.addEventListener("click", (e) => {
        if (e.target !== searchInput) searchInput.focus();
      });
    }

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) {
        alert("Please enter a search query");
        return;
      }

      const engines = {
        google: "https://www.google.com/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        yahoo: "https://search.yahoo.com/search?p="
      };

      const selectedEngine = searchEngine.value;
      const searchUrl = (engines[selectedEngine] || engines.google) + encodeURIComponent(query);
      window.open(searchUrl, "_blank");
      searchInput.value = "";
    });

    const searchBtn = document.querySelector(".search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        searchForm.dispatchEvent(new Event("submit"));
      });
    }
  }

  // Modal handlers
  const aboutLink = document.getElementById("aboutLink");
  const helpBtn = document.getElementById("helpBtn");
  const backdrop = document.getElementById("helpBackdrop") || document.querySelector(".modal-backdrop");
  const modalClose = document.getElementById("helpClose") || document.querySelector(".modal-close");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.querySelector(".modal-header h2");
  const modalBody = document.querySelector(".modal-body");

  const quickHelpHTML = `
    <h3>Quick Start</h3>
    <p>Select a calculator from the sidebar to begin. Each tool provides instant subnetting, routing, and network visualization.</p>
    
    <h3>Tools</h3>
    <dl>
      <dt><strong>IPv4</strong></dt>
      <dd>Classical subnetting with DHCP planning and ACL helper.</dd>
      <dt><strong>IPv6</strong></dt>
      <dd>IPv6 address compression, expansion, and network prefix calculation.</dd>
      <dt><strong>VLSM</strong></dt>
      <dd>Variable-length subnetting for efficient address allocation across networks.</dd>
      <dt><strong>Supernet</strong></dt>
      <dd>Route aggregation and summarization for optimizing routing tables.</dd>
      <dt><strong>Binary</strong></dt>
      <dd>Bit-level breakdown distinguishing network bits from host bits.</dd>
    </dl>

    <h3>Tips</h3>
    <ul>
      <li>Use RFC1918 ranges for lab networks: 10/8, 172.16/12, 192.168/16.</li>
      <li>Base prefix must be ≤ desired prefix for subnetting to work.</li>
      <li>VLSM plans sort host requirements from largest to smallest automatically.</li>
      <li>All results can be copied to clipboard or exported as CSV.</li>
    </ul>

    <hr style="border:none;border-top:1px solid var(--border-light);margin:16px 0;" />
    <div class="sm" style="margin-top:10px;">
      <p>&copy; 2025 <strong>Network Calculator Suite</strong></p>
      <p>Developer: <strong>Md Walidur Rahman</strong> — IT Expert, Network Engineer, AWS Cloud and Web tools developer.</p>
    </div>
  `;

  const aboutHTML = `
    <div class="about-panel">
      <div class="about-logo">
        <img src="logo.svg" alt="Network Calculator Suite Logo" />
      </div>
      <h3>Network Calculator Suite</h3>
      <p class="version">v1.0.0</p>
      <p class="description">A professional subnetting calculator suite with advanced networking tools for IPv4, IPv6, VLSM, Supernetting, and Binary calculations.</p>
      <div class="about-features">
        <h4>Features:</h4>
        <ul>
          <li>IPv4 Subnetting Calculator with DHCP Planning</li>
          <li>IPv6 Calculator with Address Compression & Normalization</li>
          <li>VLSM (Variable Length Subnet Mask) Planning</li>
          <li>Route Aggregation (Supernetting)</li>
          <li>Binary Visualization</li>
        </ul>
      </div>
      <div class="about-developer">
        <h4>Developer</h4>
        <p><strong>Md Walidur Rahman</strong> — IT Expert, Network Engineer, AWS Cloud and Web tools developer.</p>
      </div>
      <p class="copyright">© 2025 Network Calculator Suite</p>
    </div>
  `;

  function openModal(title, bodyHTML) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = bodyHTML;
    if (backdrop) backdrop.classList.add("show");
  }

  function closeModal() {
    if (backdrop) backdrop.classList.remove("show");
  }

  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("About Network Calculator Suite", aboutHTML);
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("Quick Help & Guide", quickHelpHTML);
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Set initial top bar state
  const initialActive = document.querySelector(".sidebar-item.active")?.dataset.tab || "home";
  switchTab(initialActive);

  // Global activeCalc helper for header buttons
  window.activeCalc = function() {
    const active = document.querySelector(".sidebar-item.active")?.dataset.tab || "ipv4";
    if (active === "ipv4") return { calculate: calculateIPv4, export: exportIPv4, copy: copyIPv4 };
    if (active === "ipv6") return { calculate: calcIPv6, export: () => {}, copy: copyIPv6 };
    if (active === "vlsm") return { calculate: calcVLSM, export: exportVLSM, copy: copyVLSM };
    if (active === "supernet") return { calculate: calcSupernet, export: () => {}, copy: copySupernet };
    if (active === "binary") return { calculate: calcBinary, export: () => {}, copy: copyBinary };
    return { calculate: () => {}, export: () => {}, copy: () => {} };
  };
  });
}

// Export calculation functions for unit testing in Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ipToOctets,
    octetsToIP,
    maskFromPrefix,
    wildcardFromMask,
    classOfIP,
    isPrivateIP,
    toInt,
    fromInt,
    maskInt,
    bitsOfOctet,
    smallestPrefixForHosts,
    normalizeIPv6,
    compressIPv6,
    ipv6Network,
    parseCIDR,
    summarizeRoutes
  };
}
