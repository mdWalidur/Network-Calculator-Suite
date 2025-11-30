// app.js - Network Calculator Suite
// Contains all calculator logic and event initialization

// ============== IPv4 Utilities ==============
function ipToOctets(ip) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) throw new Error("Invalid IPv4 format");
  const vals = parts.map(p => {
    if (!/^\d+$/.test(p)) throw new Error("IPv4 must be numeric octets");
    const v = parseInt(p, 10);
    if (v < 0 || v > 255) throw new Error("Octets must be 0–255");
    return v;
  });
  return vals;
}

function octetsToIP(a,b,c,d) { return [a,b,c,d].join("."); }

function maskFromPrefix(prefix) {
  const bits = Array(32).fill(0).map((_,i)=> i < prefix ? 1 : 0);
  const octets = [0,0,0,0];
  for(let i=0;i<4;i++){
    let val = 0;
    for(let j=0;j<8;j++){ val = (val << 1) | bits[i*8 + j]; }
    octets[i] = val;
  }
  return octetsToIP(...octets);
}

function wildcardFromMask(mask) {
  const [a,b,c,d] = ipToOctets(mask);
  return octetsToIP(255-a, 255-b, 255-c, 255-d);
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

function isPrivateIP([a,b]) {
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function toInt([a,b,c,d]) { return ((a<<24)>>>0) + (b<<16) + (c<<8) + d; }
function fromInt(n) { return [ (n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255 ]; }
function maskInt(prefix) { return prefix===0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0); }

function bitsOfOctet(n) { return n.toString(2).padStart(8,"0"); }

function smallestPrefixForHosts(hosts) {
  const needed = hosts + 2;
  for (let p=32; p>=0; p--) {
    const available = Math.pow(2, 32 - p);
    if (available >= needed) return p;
  }
  return 32;
}

// ============== IPv4 Calculator ==============
function calculateIPv4() {
  const baseNetErr = document.getElementById("v4_baseNetErr");
  const baseNetEl = document.getElementById("v4_baseNet");
  baseNetErr.style.display = "none";
  
  const basePrefix = parseInt(document.getElementById("v4_basePrefix").value, 10);
  const desiredPrefix = parseInt(document.getElementById("v4_desiredPrefix").value, 10);
  
  let baseIp;
  try { baseIp = ipToOctets(baseNetEl.value); }
  catch(e) { baseNetErr.textContent = e.message; baseNetErr.style.display = "block"; return; }
  
  if (desiredPrefix < basePrefix) { baseNetErr.textContent = "Desired prefix must be ≥ base prefix"; baseNetErr.style.display = "block"; return; }
  
  const baseInt = toInt(baseIp);
  const baseMask = maskInt(basePrefix);
  const baseNetInt = (baseInt & baseMask) >>> 0;
  const subnetSize = Math.pow(2, 32 - desiredPrefix) >>> 0;
  const subnetBits = desiredPrefix - basePrefix;
  const numSubnets = Math.pow(2, subnetBits);
  const hostBits = 32 - desiredPrefix;
  const usableHosts = hostBits <= 1 ? 0 : Math.pow(2, hostBits) - 2;
  
  document.getElementById("v4_hostBits").textContent = hostBits;
  document.getElementById("v4_usableHosts").textContent = usableHosts;
  document.getElementById("v4_subnetBits").textContent = subnetBits;
  document.getElementById("v4_numSubnets").textContent = numSubnets;
  
  const mask = maskFromPrefix(desiredPrefix);
  const wc = wildcardFromMask(mask);
  document.getElementById("v4_maskText").textContent = mask;
  document.getElementById("v4_wildcardText").textContent = wc;
  
  const cls = classOfIP(baseIp);
  const priv = isPrivateIP(baseIp) ? "Private" : "Public";
  document.getElementById("v4_ipClass").textContent = cls;
  document.getElementById("v4_ipPriv").textContent = priv;
  document.getElementById("v4_cidrText").textContent = octetsToIP(...fromInt(baseNetInt)) + "/" + basePrefix;
  
  const gatewayPref = document.getElementById("v4_gatewayPref").value;
  const tbody = document.querySelector("#v4_rangesTable tbody");
  tbody.innerHTML = "";
  
  for (let i = 0; i < Math.min(numSubnets, 50); i++) {
    const networkInt = (baseNetInt + i * subnetSize) >>> 0;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;
    const gw = gatewayPref === "first" ? octetsToIP(...fromInt(firstInt)) : octetsToIP(...fromInt(lastInt));
    
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td class="mono">${octetsToIP(...fromInt(networkInt))}/${desiredPrefix}</td><td class="mono">${octetsToIP(...fromInt(firstInt))}</td><td class="mono">${octetsToIP(...fromInt(lastInt))}</td><td class="mono">${octetsToIP(...fromInt(broadcastInt))}</td><td class="mono">${gw}</td>`;
    tbody.appendChild(tr);
  }
  
  if (numSubnets > 50) {
    const warn = document.getElementById("v4_warn");
    warn.textContent = `Showing first 50 of ${numSubnets} subnets. Adjust base/desired prefix for less detail.`;
    warn.style.display = "block";
  }
  
  const scope = usableHosts;
  const res = Math.ceil(scope * 0.1);
  document.getElementById("v4_dhcpScope").textContent = scope;
  document.getElementById("v4_dhcpRes").textContent = res + " addresses";
  
  document.getElementById("v4_outputs").style.display = "block";
}

function exportIPv4() {
  const rows = [["#","Network","First usable","Last usable","Broadcast","Gateway"]];
  document.querySelectorAll("#v4_rangesTable tbody tr").forEach(tr => {
    rows.push(Array.from(tr.children).map(td => td.textContent));
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ipv4-subnetting.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function copyIPv4() {
  const lines = ["IPv4 Subnetting Results"];
  lines.push("Mask: " + document.getElementById("v4_maskText").textContent);
  lines.push("Wildcard: " + document.getElementById("v4_wildcardText").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied IPv4 summary."));
}

function calcAclWildcard() {
  const maskErr = document.getElementById("v4_aclMask");
  try {
    const wc = wildcardFromMask(maskErr.value);
    document.getElementById("v4_aclWildcard").value = wc;
    document.getElementById("v4_aclExample").textContent = `Example: access-list 100 permit ip 0.0.0.0 ${wc}`;
  } catch(e) {
    alert("Invalid mask: " + e.message);
  }
}

// ============== IPv6 Calculator ==============
function normalizeIPv6(ip) {
  ip = ip.toLowerCase().replace(/\s/g, "");
  if (ip.includes("::")) {
    const [left, right] = ip.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missing = 8 - leftParts.length - rightParts.length;
    const middle = Array(Math.max(1, missing)).fill("0");
    return [...leftParts, ...middle, ...rightParts].join(":");
  }
  return ip;
}

function calcIPv6() {
  const netErr = document.getElementById("v6_netErr");
  netErr.style.display = "none";
  
  let net = document.getElementById("v6_net").value;
  if (!net) { netErr.textContent = "Enter IPv6 address"; netErr.style.display = "block"; return; }
  
  try {
    const full = normalizeIPv6(net);
    const parts = full.split(":");
    if (parts.length !== 8 || parts.some(p => !/^[0-9a-f]{0,4}$/.test(p))) throw new Error("Invalid IPv6");
    const prefix = parseInt(document.getElementById("v6_prefix").value, 10);
    document.getElementById("v6_network").textContent = net;
    document.getElementById("v6_prefixOut").textContent = prefix;
    document.getElementById("v6_full").textContent = full;
    document.getElementById("v6_compressed").textContent = net;
    document.getElementById("v6_outputs").style.display = "block";
  } catch(e) {
    netErr.textContent = e.message;
    netErr.style.display = "block";
  }
}

function copyIPv6() {
  const lines = ["IPv6 Info"];
  lines.push("Network: " + document.getElementById("v6_network").textContent);
  lines.push("Prefix: " + document.getElementById("v6_prefixOut").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied IPv6 summary."));
}

// ============== VLSM Calculator ==============
function calcVLSM() {
  const baseErr = document.getElementById("vlsm_baseErr");
  const hostsErr = document.getElementById("vlsm_hostsErr");
  baseErr.style.display = "none";
  hostsErr.style.display = "none";
  
  const base = document.getElementById("vlsm_base").value;
  const basePrefix = parseInt(document.getElementById("vlsm_prefix").value, 10);
  
  let baseIp;
  try { baseIp = ipToOctets(base); }
  catch(e) { baseErr.textContent = e.message; baseErr.style.display = "block"; return; }
  
  const hostList = document.getElementById("vlsm_hosts").value.split(",").map(x => parseInt(x.trim(),10)).filter(x => !isNaN(x) && x > 0).sort((a,b) => b-a);
  if (hostList.length === 0) { hostsErr.textContent = "Enter host requirements"; hostsErr.style.display = "block"; return; }
  
  const tbody = document.querySelector("#vlsm_table tbody");
  tbody.innerHTML = "";
  const warn = document.getElementById("vlsm_warn");
  warn.style.display = "none";
  
  const baseInt = toInt(baseIp);
  const baseNetInt = (baseInt & maskInt(basePrefix)) >>> 0;
  let currentNetInt = baseNetInt;
  const gwPref = document.getElementById("vlsm_gateway").value;
  
  for (let i = 0; i < hostList.length; i++) {
    const h = hostList[i];
    const pref = smallestPrefixForHosts(h);
    if (pref < basePrefix) {
      warn.textContent = `Warning: Host requirement ${h} exceeds base block granularity.`;
      warn.style.display = "block";
    }
    const subnetSize = Math.pow(2, 32 - pref) >>> 0;
    const networkInt = currentNetInt;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;
    const gw = gwPref === "first" ? octetsToIP(...fromInt(firstInt)) : octetsToIP(...fromInt(lastInt));
    
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${h}</td><td>/${pref}</td><td class="mono">${octetsToIP(...fromInt(networkInt))}/${pref}</td><td class="mono">${octetsToIP(...fromInt(firstInt))}</td><td class="mono">${octetsToIP(...fromInt(lastInt))}</td><td class="mono">${octetsToIP(...fromInt(broadcastInt))}</td><td class="mono">${gw}</td>`;
    tbody.appendChild(tr);
    
    currentNetInt = (networkInt + subnetSize) >>> 0;
  }
  document.getElementById("vlsm_outputs").style.display = "block";
}

function exportVLSM() {
  const rows = [["#","Hosts req.","Prefix","Network","First usable","Last usable","Broadcast","Gateway"]];
  document.querySelectorAll("#vlsm_table tbody tr").forEach(tr => {
    rows.push(Array.from(tr.children).map(td => td.textContent));
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vlsm-plan.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function copyVLSM() {
  const lines = ["VLSM Plan","#,Hosts,Prefix,Network,First,Last,Broadcast,Gateway"];
  document.querySelectorAll("#vlsm_table tbody tr").forEach(tr => {
    lines.push(Array.from(tr.children).map(td => td.textContent).join(","));
  });
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied VLSM plan."));
}

// ============== Supernet Calculator ==============
function parseCIDR(cidr) {
  const [ip, prefStr] = cidr.split("/");
  const prefix = parseInt(prefStr, 10);
  return { ip: ipToOctets(ip), prefix };
}

function calcSupernet() {
  const lines = document.getElementById("agg_list").value.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) { alert("Add networks first."); return; }
  
  const nets = lines.map(parseCIDR).sort((a,b) => toInt(a.ip) - toInt(b.ip) || a.prefix - b.prefix);
  const first = nets[0], last = nets[nets.length-1];
  const firstInt = toInt(first.ip), lastInt = toInt(last.ip);
  
  let common = 0;
  for (let i = 31; i >= 0; i--) {
    const bitF = (firstInt >>> i) & 1;
    const bitL = (lastInt >>> i) & 1;
    if (bitF === bitL) common++;
    else break;
  }
  
  const summaryPrefix = common;
  const summaryMask = maskInt(summaryPrefix);
  const summaryNetInt = firstInt & summaryMask;
  const summaryNet = fromInt(summaryNetInt);
  const result = `${octetsToIP(...summaryNet)}/${summaryPrefix}`;
  document.getElementById("agg_result").value = result + "\n(Note: ensure inputs are contiguous for accuracy.)";
}

function copySupernet() {
  const t = document.getElementById("agg_result").value;
  if (!t) { alert("Summarize first."); return; }
  navigator.clipboard.writeText(t).then(() => alert("Copied summary route."));
}

// ============== Binary Calculator ==============
function calcBinary() {
  const ipErr = document.getElementById("bin_ipErr");
  ipErr.style.display = "none";
  
  let ip;
  try { ip = ipToOctets(document.getElementById("bin_ip").value); }
  catch(e) { ipErr.textContent = e.message; ipErr.style.display = "block"; return; }
  
  const prefix = parseInt(document.getElementById("bin_prefix").value, 10);
  const mask = maskFromPrefix(prefix);
  const wc = wildcardFromMask(mask);
  const ipInt = toInt(ip);
  const maskI = maskInt(prefix);
  const netInt = ipInt & maskI;
  const net = fromInt(netInt);
  
  document.getElementById("bin_mask").textContent = mask;
  document.getElementById("bin_wc").textContent = wc;
  document.getElementById("bin_network").textContent = octetsToIP(...net) + "/" + prefix;
  
  const bits = ip.map(bitsOfOctet);
  const maskBits = fromInt(maskI).map(bitsOfOctet);
  
  function decorate(octBits, maskOctBits) {
    let out = "";
    for (let i = 0; i < 8; i++) {
      const m = maskOctBits[i] === "1";
      out += m ? `<span class="netbit">${octBits[i]}</span>` : `<span class="hostbit">${octBits[i]}</span>`;
    }
    return out;
  }
  
  document.getElementById("bin_oct1").innerHTML = `Octet 1: ${decorate(bits[0], maskBits[0])}`;
  document.getElementById("bin_oct2").innerHTML = `Octet 2: ${decorate(bits[1], maskBits[1])}`;
  document.getElementById("bin_oct3").innerHTML = `Octet 3: ${decorate(bits[2], maskBits[2])}`;
  document.getElementById("bin_oct4").innerHTML = `Octet 4: ${decorate(bits[3], maskBits[3])}`;
  document.getElementById("bin_outputs").style.display = "block";
}

function copyBinary() {
  const lines = [];
  lines.push("Binary View:");
  lines.push("Mask: " + document.getElementById("bin_mask").textContent);
  lines.push("Wildcard: " + document.getElementById("bin_wc").textContent);
  lines.push("Network: " + document.getElementById("bin_network").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Copied binary summary."));
}

// ============== Tab & Modal Initialization ==============
document.addEventListener("DOMContentLoaded", () => {
  const tabNames = ["ipv4", "ipv6", "vlsm", "supernet", "binary"];
  const titleMap = {
    ipv4: "IPv4 Subnetting",
    ipv6: "IPv6 Calculator",
    vlsm: "VLSM Planning",
    supernet: "Route Aggregation",
    binary: "Binary Visualization"
  };
  
  // Sidebar navigation and tab switching
  document.querySelectorAll(".sidebar-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      
      // Update sidebar active state
      document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Update page title
      document.getElementById("page-title").textContent = titleMap[tabName] || "Calculator";
      
      // Show/hide tabpanes
      document.querySelectorAll(".tabpane").forEach(pane => pane.style.display = "none");
      const pane = document.getElementById(tabName);
      if (pane) pane.style.display = "block";
    });
  });
  
  // Help modal
  const helpBtn = document.querySelector(".help-btn");
  const backdrop = document.querySelector(".modal-backdrop");
  const modalClose = document.querySelector(".modal-close");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  
  function openModal() {
    backdrop.classList.add("show");
  }
  
  function closeModal() {
    backdrop.classList.remove("show");
  }
  
  helpBtn.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modalCloseBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("show")) closeModal();
  });
  
  // Expose activeCalc for header buttons
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

