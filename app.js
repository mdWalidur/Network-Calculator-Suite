// app.js - extracted from index.html

// ---------- IPv4 utilities ----------
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
function octetsToIP(a,b,c,d){ return [a,b,c,d].join("."); }
function maskFromPrefix(prefix){
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
function blockInfo(prefix){
  const octetIndex = Math.floor((prefix - 1) / 8); // 0..3
  const fixedBitsBefore = octetIndex * 8;
  const bitsIntoOctet = prefix - fixedBitsBefore; // 1..8
  const block = Math.pow(2, 8 - bitsIntoOctet);
  return { block, octetIndex };
}
function addToIP([a,b,c,d], octetIndex, step){
  const ip = [a,b,c,d];
  ip[octetIndex] += step;
  for(let i=octetIndex; i>0; i--){
    while(ip[i] > 255){
      const overflow = Math.floor(ip[i] / 256);
      ip[i] = ip[i] % 256;
      ip[i-1] += overflow;
    }
  }
  return ip;
}
function nextIP([a,b,c,d]) { d+=1; if(d<=255) return [a,b,c,d]; d=0; c+=1; if(c<=255) return [a,b,c,d]; c=0; b+=1; if(b<=255) return [a,b,c,d]; b=0; a+=1; return [a,b,c,d]; }
function prevIP([a,b,c,d]) { d-=1; if(d>=0) return [a,b,c,d]; d=255; c-=1; if(c>=0) return [a,b,c,d]; c=255; b-=1; if(b>=0) return [a,b,c,d]; b=255; a-=1; return [a,b,c,d]; }

function networkRanges(baseIp, basePrefix, desiredPrefix){
  const baseInt = toInt(baseIp);
  const baseMask = maskInt(basePrefix);
  const baseNetInt = (baseInt & baseMask) >>> 0;
  const subnetSize = Math.pow(2, 32 - desiredPrefix) >>> 0;
  const subnetBits = desiredPrefix - basePrefix;
  const numSubnets = Math.pow(2, subnetBits);
  const ranges = [];
  for (let i = 0; i < numSubnets; i++){
    const networkInt = (baseNetInt + i * subnetSize) >>> 0;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;
    ranges.push({
      index: i+1,
      network: octetsToIP(...fromInt(networkInt)) + "/" + desiredPrefix,
      first: octetsToIP(...fromInt(firstInt)),
      last: octetsToIP(...fromInt(lastInt)),
      broadcast: octetsToIP(...fromInt(broadcastInt)),
      gatewayFirst: octetsToIP(...fromInt(firstInt)),
      gatewayLast: octetsToIP(...fromInt(lastInt))
    });
  }
  return { ranges, subnetSize, numSubnets };
}

// ---------- IPv4 main ----------
function calculateIPv4(){
  const baseNetEl = document.getElementById("v4_baseNet");
  const baseNetErr = document.getElementById("v4_baseNetErr");
  const basePrefix = parseInt(document.getElementById("v4_basePrefix").value,10);
  const desiredPrefix = parseInt(document.getElementById("v4_desiredPrefix").value,10);
  const hostReq = parseInt(document.getElementById("v4_hostReq").value,10);
  const gatewayPref = document.getElementById("v4_gatewayPref").value;

  let baseIp;
  baseNetErr.style.display = "none";
  try { baseIp = ipToOctets(baseNetEl.value); }
  catch(e){ baseNetErr.textContent = e.message; baseNetErr.style.display = "block"; return; }
  if (desiredPrefix < basePrefix) { baseNetErr.textContent = "Desired prefix must be >= base prefix."; baseNetErr.style.display = "block"; return; }

  const subnetBits = desiredPrefix - basePrefix;
  const hostBits = 32 - desiredPrefix;
  const usableHosts = Math.max(0, Math.pow(2, hostBits) - 2);
  const numSubnets = Math.pow(2, subnetBits);
  const maskText = maskFromPrefix(desiredPrefix);
  const wildcardText = wildcardFromMask(maskText);
  const { ranges, block } = networkRanges(baseIp, basePrefix, desiredPrefix);

  const ipClass = classOfIP(baseIp);
  const priv = isPrivateIP(baseIp) ? "Private (RFC1918)" : "Public";
  const cidrText = octetsToIP(...baseIp) + "/" + basePrefix;

  document.getElementById("v4_hostBits").textContent = hostBits;
  document.getElementById("v4_usableHosts").textContent = usableHosts;
  document.getElementById("v4_subnetBits").textContent = subnetBits;
  document.getElementById("v4_numSubnets").textContent = numSubnets;
  document.getElementById("v4_maskText").textContent = maskText;
  document.getElementById("v4_wildcardText").textContent = wildcardText;
  document.getElementById("v4_ipClass").textContent = ipClass;
  document.getElementById("v4_ipPriv").textContent = priv;
  document.getElementById("v4_cidrText").textContent = cidrText;

  const warnEl = document.getElementById("v4_warn");
  warnEl.style.display = usableHosts < hostReq ? "block" : "none";
  warnEl.textContent = usableHosts < hostReq ? `Warning: Usable hosts (${usableHosts}) < requirement (${hostReq}). Consider /25.` : "";

  const tbody = document.querySelector("#v4_rangesTable tbody");
  tbody.innerHTML = "";
  ranges.forEach(r => {
    const gw = gatewayPref === "first" ? r.gatewayFirst : r.gatewayLast;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.index}</td><td class="mono">${r.network}</td><td class="mono">${r.first}</td><td class="mono">${r.last}</td><td class="mono">${r.broadcast}</td><td class="mono">${gw}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("v4_dhcpScope").textContent = `${usableHosts} addresses per subnet`;
  document.getElementById("v4_dhcpRes").textContent = `Reserve ~10–20 IPs for infra (router/switch/AP/server/printer). Exclude first addresses from DHCP pool.`;
  document.getElementById("v4_aclMask").value = maskText;

  // VLAN notes
  const vlanId = document.getElementById("v4_vlanId").value || "—";
  const vlanName = document.getElementById("v4_vlanName").value || "—";
  const gwConv = gatewayPref === "first" ? "first usable (.1)" : "last usable (.254)";
  const notes = `VLAN ${vlanId} (${vlanName})\nGateway: ${gwConv}\nMask: ${maskText}, Wildcard: ${wildcardText}\nDHCP scope: ${usableHosts} per subnet\nBase: ${cidrText}\nSuggested gateway (subnet 1): ${gatewayPref === "first" ? ranges[0].first : ranges[0].last}`;
  document.getElementById("v4_vlanNotes").value = notes;

  document.getElementById("v4_outputs").style.display = "block";
}
function exportIPv4(){
  const rows = [["#", "Network", "First usable", "Last usable", "Broadcast", "Gateway"]];
  document.querySelectorAll("#v4_rangesTable tbody tr").forEach(tr => { rows.push(Array.from(tr.children).map(td => td.textContent)); });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"}); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "ipv4-subnets.csv"; a.click(); URL.revokeObjectURL(url);
}
function copyIPv4(){
  if (document.getElementById("v4_outputs").style.display === "none") { alert("Calculate first."); return; }
  const lines = [];
  const ids = ["v4_hostBits","v4_usableHosts","v4_subnetBits","v4_numSubnets","v4_maskText","v4_wildcardText","v4_ipClass","v4_ipPriv","v4_cidrText"];
  const labels = ["Host bits","Usable hosts","Subnet bits","Number of subnets","Mask","Wildcard","IP class","Private/Public","CIDR"];
  ids.forEach((id,i)=> lines.push(`${labels[i]}: ${document.getElementById(id).textContent}`));
  lines.push(""); lines.push("#,Network,First usable,Last usable,Broadcast,Gateway");
  document.querySelectorAll("#v4_rangesTable tbody tr").forEach(tr => { lines.push(Array.from(tr.children).map(td => td.textContent).join(",")); });
  navigator.clipboard.writeText(lines.join("\n")).then(()=> alert("Copied summary."));
}
function calcAclWildcard(){
  const mask = document.getElementById("v4_aclMask").value;
  try {
    const wc = wildcardFromMask(mask);
    document.getElementById("v4_aclWildcard").value = wc;
    document.getElementById("v4_aclExample").textContent = `Example (Cisco ACL): access-list 10 permit ${document.getElementById("v4_baseNet").value} ${wc}`;
  } catch(e){
    document.getElementById("v4_aclWildcard").value = "";
    document.getElementById("v4_aclExample").textContent = "Invalid mask format.";
  }
}

// ---------- IPv6 ----------
function normalizeIPv6(ip) {
  let hasDbl = ip.includes("::");
  let parts = ip.split("::");
  let left = parts[0] ? parts[0].split(":").filter(Boolean) : [];
  let right = parts[1] ? parts[1].split(":").filter(Boolean) : [];
  let total = left.length + right.length;
  if (hasDbl) {
    const fill = 8 - total;
    const zeros = Array(fill).fill("0");
    parts = [...left, ...zeros, ...right];
  } else {
    parts = ip.split(":").filter(Boolean);
  }
  parts = parts.map(p => p || "0");
  while (parts.length < 8) parts.push("0");
  parts = parts.slice(0,8).map(p => p.padStart(4,"0").toLowerCase());
  const expanded = parts.join(":");
  let compressed = expanded.replace(/(^|:)0{1,3}([0-9a-f])/g, "$1$2");
  const zeroRuns = compressed.split(":");
  let bestStart=-1, bestLen=0, curStart=-1, curLen=0;
  for (let i=0;i<zeroRuns.length;i++){
    if (zeroRuns[i] === "0") { if(curStart<0) curStart=i; curLen++; if (curLen>bestLen){bestLen=curLen;bestStart=curStart;} }
    else { curStart=-1; curLen=0; }
  }
  if (bestLen>1){
    const compArr = compressed.split(":");
    compArr.splice(bestStart,bestLen,"");
    compressed = compArr.join(":").replace(":::", "::");
    if (!compressed.includes("::")) compressed = compressed.replace(/(^|:)$/, "$1::");
  }
  return { expanded, compressed };
}
function ipv6Type(ip){
  const low = ip.toLowerCase();
  if (low.startsWith("fe80")) return "Link-local (fe80::/10)";
  if (low.startsWith("fc") || low.startsWith("fd")) return "Unique-local (fc00::/7)";
  return "Global (or other)";
}
function calcIPv6(){
  const netEl = document.getElementById("v6_net");
  const netErr = document.getElementById("v6_netErr");
  netErr.style.display = "none";
  const net = netEl.value.trim();
  if (!net) { netErr.textContent = "Enter an IPv6 network."; netErr.style.display = "block"; return; }
  try {
    const prefix = parseInt(document.getElementById("v6_prefix").value,10);
    const { expanded, compressed } = normalizeIPv6(net);
    const hostBits = 128 - prefix;
    const hostsStr = hostBits >= 64 ? "2^" + hostBits + " (astronomical)" : (BigInt(1) << BigInt(hostBits)).toString();

    document.getElementById("v6_hosts").textContent = hostsStr;
    document.getElementById("v6_type").textContent = ipv6Type(expanded);
    document.getElementById("v6_short").textContent = compressed + "/" + prefix;
    document.getElementById("v6_long").textContent = expanded + "/" + prefix;
    document.getElementById("v6_outputs").style.display = "block";
  } catch(e){ netErr.textContent = "Invalid IPv6 format."; netErr.style.display = "block"; }
}
function copyIPv6(){
  const lines = [];
  lines.push("IPv6 Summary:");
  lines.push("Compressed: " + document.getElementById("v6_short").textContent);
  lines.push("Expanded: " + document.getElementById("v6_long").textContent);
  lines.push("Type: " + document.getElementById("v6_type").textContent);
  lines.push("Hosts: " + document.getElementById("v6_hosts").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(()=> alert("Copied IPv6 summary."));
}

// ---------- VLSM ----------
function smallestPrefixForHosts(hosts){
  for (let p=30; p>=0; p--){
    const hostBits = 32 - p;
    const usable = Math.max(0, Math.pow(2, hostBits) - 2);
    if (usable >= hosts) return p;
  }
  return 0;
}
function calcVLSM(){
  const baseErr = document.getElementById("vlsm_baseErr");
  const hostsErr = document.getElementById("vlsm_hostsErr");
  baseErr.style.display = hostsErr.style.display = "none";
  let base;
  try { base = ipToOctets(document.getElementById("vlsm_base").value); }
  catch(e){ baseErr.textContent = e.message; baseErr.style.display = "block"; return; }
  const basePrefix = parseInt(document.getElementById("vlsm_prefix").value,10);
  const hostListRaw = document.getElementById("vlsm_hosts").value;
  const hostList = hostListRaw.split(",").map(x=>parseInt(x.trim(),10)).filter(x=>!isNaN(x) && x>0).sort((a,b)=>b-a);
  if (hostList.length === 0){ hostsErr.textContent = "Enter one or more positive host counts (comma-separated)."; hostsErr.style.display = "block"; return; }
  const gwPref = document.getElementById("vlsm_gateway").value;

  const tbody = document.querySelector("#vlsm_table tbody"); tbody.innerHTML="";
  const warn = document.getElementById("vlsm_warn"); warn.style.display="none";

  const baseInt = toInt(base);
  const baseNetInt = (baseInt & maskInt(basePrefix)) >>> 0;
  let currentNetInt = baseNetInt;

  for (let i=0;i<hostList.length;i++){
    const h = hostList[i];
    const pref = smallestPrefixForHosts(h);
    if (pref < basePrefix) { warn.textContent = `Warning: Host requirement ${h} exceeds base block granularity.`; warn.style.display="block"; }
    const subnetSize = Math.pow(2, 32 - pref) >>> 0;
    const networkInt = currentNetInt;
    const broadcastInt = (networkInt + subnetSize - 1) >>> 0;
    const firstInt = (networkInt + 1) >>> 0;
    const lastInt = (broadcastInt - 1) >>> 0;
    const gw = gwPref === "first" ? octetsToIP(...fromInt(firstInt)) : octetsToIP(...fromInt(lastInt));

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${h}</td><td>/${pref}</td><td class=\"mono\">${octetsToIP(...fromInt(networkInt))}/${pref}</td><td class=\"mono\">${octetsToIP(...fromInt(firstInt))}</td><td class=\"mono\">${octetsToIP(...fromInt(lastInt))}</td><td class=\"mono\">${octetsToIP(...fromInt(broadcastInt))}</td><td class=\"mono\">${gw}</td>`;
    tbody.appendChild(tr);

    currentNetInt = (networkInt + subnetSize) >>> 0;
  }
  document.getElementById("vlsm_outputs").style.display = "block";
}
function exportVLSM(){
  const rows = [["#", "Hosts req.", "Prefix", "Network", "First usable", "Last usable", "Broadcast", "Gateway"]];
  document.querySelectorAll("#vlsm_table tbody tr").forEach(tr => { rows.push(Array.from(tr.children).map(td => td.textContent)); });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"}); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "vlsm-plan.csv"; a.click(); URL.revokeObjectURL(url);
}
function copyVLSM(){
  const lines = ["VLSM Plan","#,Hosts,Prefix,Network,First,Last,Broadcast,Gateway"];
  document.querySelectorAll("#vlsm_table tbody tr").forEach(tr => { lines.push(Array.from(tr.children).map(td => td.textContent).join(",")); });
  navigator.clipboard.writeText(lines.join("\n")).then(()=> alert("Copied VLSM plan."));
}

// ---------- Supernetting ----------
function parseCIDR(cidr){
  const [ip, prefStr] = cidr.split("/");
  const prefix = parseInt(prefStr,10);
  return { ip: ipToOctets(ip), prefix };
}
function toInt([a,b,c,d]){ return ((a<<24)>>>0) + (b<<16) + (c<<8) + d; }
function fromInt(n){ return [ (n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255 ]; }
function maskInt(prefix){ return prefix===0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0); }
function calcSupernet(){
  const lines = document.getElementById("agg_list").value.split("\n").map(l=>l.trim()).filter(Boolean);
  if (lines.length === 0) { alert("Add networks first."); return; }
  const nets = lines.map(parseCIDR).sort((a,b)=> toInt(a.ip) - toInt(b.ip) || a.prefix - b.prefix);
  const first = nets[0], last = nets[nets.length-1];
  const firstInt = toInt(first.ip), lastInt = toInt(last.ip);
  let common = 0;
  for (let i=31;i>=0;i--){
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
  document.getElementById("agg_result").value = result + "\n(Note: ensure inputs are contiguous blocks for accurate summarization.)";
}
function copySupernet(){
  const t = document.getElementById("agg_result").value;
  if (!t) { alert("Summarize first."); return; }
  navigator.clipboard.writeText(t).then(()=> alert("Copied summary route."));
}

// ---------- Binary view ----------
function bitsOfOctet(n){ return n.toString(2).padStart(8,"0"); }
function calcBinary(){
  const ipErr = document.getElementById("bin_ipErr");
  ipErr.style.display = "none";
  let ip, prefix;
  try { ip = ipToOctets(document.getElementById("bin_ip").value); } catch(e){ ipErr.textContent = e.message; ipErr.style.display = "block"; return; }
  prefix = parseInt(document.getElementById("bin_prefix").value,10);

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
  function decorate(octBits, maskOctBits){
    let out = "";
    for (let i=0;i<8;i++){
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
function copyBinary(){
  const lines = [];
  lines.push("Binary View:");
  lines.push("Mask: " + document.getElementById("bin_mask").textContent);
  lines.push("Wildcard: " + document.getElementById("bin_wc").textContent);
  lines.push("Network: " + document.getElementById("bin_network").textContent);
  navigator.clipboard.writeText(lines.join("\n")).then(()=> alert("Copied binary summary."));
}

// Set dynamic copyright year in footer
try {
  const yel = document.getElementById('copyrightYear');
  if (yel) yel.textContent = new Date().getFullYear();
} catch(e) { /* noop */ }

// Initialization: tabs, help modal, and expose activeCalc for header buttons
(function(){
  function activateTab(t, focus){
    const tabs = Array.from(document.querySelectorAll('.tab'));
    tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected','false'); x.setAttribute('tabindex','-1'); });
    document.querySelectorAll('.tabpane').forEach(p => p.style.display = 'none');
    t.classList.add('active');
    t.setAttribute('aria-selected','true');
    t.setAttribute('tabindex','0');
    const pane = document.getElementById(t.dataset.tab);
    if (pane) pane.style.display = 'block';
    if (focus) t.focus();
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    const tabs = Array.from(document.querySelectorAll('.tab'));
    tabs.forEach(t => {
      t.setAttribute('role','tab');
      t.setAttribute('tabindex', t.classList.contains('active') ? '0' : '-1');
      t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
      t.addEventListener('click', ()=> activateTab(t, false));
      t.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(t, false); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
          const idx = tabs.indexOf(t);
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = tabs[(idx + dir + tabs.length) % tabs.length];
          next.focus();
        }
      });
    });

    // Help modal
    const helpBtn = document.getElementById('helpBtn');
    const backdrop = document.getElementById('helpBackdrop');
    const helpClose = document.getElementById('helpClose');
    function openHelp(){ backdrop.classList.add('show'); backdrop.setAttribute('aria-hidden','false'); helpClose.focus(); }
    function closeHelp(){ backdrop.classList.remove('show'); backdrop.setAttribute('aria-hidden','true'); helpBtn.focus(); }
    helpBtn.addEventListener('click', openHelp);
    helpClose.addEventListener('click', closeHelp);
    backdrop.addEventListener('click', (e)=>{ if (e.target === backdrop) closeHelp(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && backdrop.classList.contains('show')) closeHelp(); });

    // expose activeCalc for header buttons
    window.activeCalc = function(){
      const active = document.querySelector(".tab.active").dataset.tab;
      if (active === "ipv4") return { calculate: calculateIPv4, export: exportIPv4, copy: copyIPv4 };
      if (active === "ipv6") return { calculate: calcIPv6, export: ()=>{}, copy: copyIPv6 };
      if (active === "vlsm") return { calculate: calcVLSM, export: exportVLSM, copy: copyVLSM };
      if (active === "supernet") return { calculate: calcSupernet, export: ()=>{}, copy: copySupernet };
      if (active === "binary") return { calculate: calcBinary, export: ()=>{}, copy: copyBinary };
      return { calculate: ()=>{}, export: ()=>{}, copy: ()=>{} };
    };
  });
})();
