/**
 * Network Calculator Suite - Core Calculation Engine
 * High-performance, RFC-compliant networking algorithms.
 * Supports IPv4 Subnetting, IPv6 Normalization & Compression (RFC 5952),
 * VLSM Subnetting, Route Summarization/Aggregation, and Binary Representation.
 */

export interface IPv4SubnetRange {
  id: number;
  network: string;
  prefix: number;
  firstUsable: string;
  lastUsable: string;
  broadcast: string;
  gateway: string;
}

export interface IPv4CalculationResult {
  baseNetInt: number;
  basePrefix: number;
  desiredPrefix: number;
  hostBits: number;
  usableHosts: number;
  subnetBits: number;
  numSubnets: number;
  mask: string;
  wildcard: string;
  ipClass: string;
  isPrivate: boolean;
  cidr: string;
  ranges: IPv4SubnetRange[];
  truncated: boolean;
  totalSubnets: number;
  dhcpScope: number;
  dhcpReservations: number;
}

export interface IPv6CalculationResult {
  input: string;
  network: string;
  prefix: number;
  fullExpanded: string;
  compressed: string;
  networkCompressed: string;
}

export interface VLSMAllocation {
  id: number;
  requestedHosts: number;
  allocatedHosts: number;
  prefix: number;
  network: string;
  firstUsable: string;
  lastUsable: string;
  broadcast: string;
  gateway: string;
}

export interface VLSMCalculationResult {
  baseNetwork: string;
  basePrefix: number;
  baseCapacity: number;
  totalAllocated: number;
  exceedsCapacity: boolean;
  allocations: VLSMAllocation[];
  warnings: string[];
}

export interface SupernetResult {
  summary: string;
  prefix: number;
  startIP: string;
  endIP: string;
  inputCount: number;
  spanningAddresses: number;
}

export interface BinaryBreakdown {
  ip: string;
  prefix: number;
  network: string;
  mask: string;
  wildcard: string;
  octets: Array<{
    octetIndex: number;
    value: number;
    binaryString: string;
    bits: Array<{ bit: string; isNetwork: boolean }>;
  }>;
}

// ================= IPv4 Algorithms =================

export function ipToOctets(ip: string): [number, number, number, number] {
  if (typeof ip !== "string") throw new Error("Invalid IPv4 address string");
  const parts = ip.trim().split(".");
  if (parts.length !== 4) {
    throw new Error("IPv4 address must contain exactly 4 octets separated by dots");
  }
  const octets = parts.map((part) => {
    const trimmed = part.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error(`Octet "${trimmed}" must be an integer between 0 and 255`);
    }
    const val = parseInt(trimmed, 10);
    if (val < 0 || val > 255) {
      throw new Error(`Octet value ${val} is out of valid range (0–255)`);
    }
    return val;
  });
  return [octets[0], octets[1], octets[2], octets[3]];
}

export function octetsToIP(a: number, b: number, c: number, d: number): string {
  return `${a}.${b}.${c}.${d}`;
}

export function toInt([a, b, c, d]: [number, number, number, number]): number {
  return (((a << 24) >>> 0) + (b << 16) + (c << 8) + d) >>> 0;
}

export function fromInt(n: number): [number, number, number, number] {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

export function maskInt(prefix: number): number {
  if (prefix < 0 || prefix > 32) throw new Error("Prefix must be between 0 and 32");
  return prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
}

export function maskFromPrefix(prefix: number): string {
  const m = maskInt(prefix);
  return octetsToIP(...fromInt(m));
}

export function wildcardFromMask(mask: string): string {
  const [a, b, c, d] = ipToOctets(mask);
  return octetsToIP(255 - a, 255 - b, 255 - c, 255 - d);
}

export function classOfIP([a]: [number, number, number, number]): string {
  if (a >= 1 && a <= 126) return "Class A";
  if (a === 127) return "Loopback";
  if (a >= 128 && a <= 191) return "Class B";
  if (a >= 192 && a <= 223) return "Class C";
  if (a >= 224 && a <= 239) return "Multicast (Class D)";
  if (a >= 240) return "Experimental (Class E)";
  return "Unknown";
}

export function isPrivateIP([a, b]: [number, number, number, number]): boolean {
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  return false;
}

export function smallestPrefixForHosts(hosts: number): number {
  if (hosts <= 0) return 32;
  const needed = hosts + 2;
  for (let p = 32; p >= 0; p--) {
    const available = Math.pow(2, 32 - p);
    if (available >= needed) return p;
  }
  return 0;
}

export function calculateIPv4(
  baseNetStr: string,
  basePrefix: number,
  desiredPrefix: number,
  gatewayPref: "first" | "last" = "first",
  maxRowsToRender = 100
): IPv4CalculationResult {
  const baseOctets = ipToOctets(baseNetStr);
  if (desiredPrefix < basePrefix) {
    throw new Error(`Desired prefix (/${desiredPrefix}) must be greater than or equal to base prefix (/${basePrefix})`);
  }

  const baseInt = toInt(baseOctets);
  const baseMask = maskInt(basePrefix);
  const baseNetInt = (baseInt & baseMask) >>> 0;

  const subnetBits = desiredPrefix - basePrefix;
  const numSubnets = Math.pow(2, subnetBits);
  const hostBits = 32 - desiredPrefix;
  const subnetSize = Math.pow(2, hostBits) >>> 0;
  const usableHosts = hostBits <= 1 ? 0 : Math.pow(2, hostBits) - 2;

  const mask = maskFromPrefix(desiredPrefix);
  const wildcard = wildcardFromMask(mask);
  const ipClass = classOfIP(baseOctets);
  const isPrivate = isPrivateIP(baseOctets);
  const cidr = `${octetsToIP(...fromInt(baseNetInt))}/${basePrefix}`;

  const renderLimit = Math.min(numSubnets, maxRowsToRender);
  const ranges: IPv4SubnetRange[] = [];

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

    ranges.push({
      id: i + 1,
      network: `${octetsToIP(...fromInt(networkInt))}/${desiredPrefix}`,
      prefix: desiredPrefix,
      firstUsable: firstText,
      lastUsable: lastText,
      broadcast: octetsToIP(...fromInt(broadcastInt)),
      gateway: gw,
    });
  }

  const dhcpReservations = Math.ceil(usableHosts * 0.1);

  return {
    baseNetInt,
    basePrefix,
    desiredPrefix,
    hostBits,
    usableHosts,
    subnetBits,
    numSubnets,
    mask,
    wildcard,
    ipClass,
    isPrivate,
    cidr,
    ranges,
    truncated: numSubnets > renderLimit,
    totalSubnets: numSubnets,
    dhcpScope: usableHosts,
    dhcpReservations,
  };
}

// ================= IPv6 Algorithms =================

export function normalizeIPv6(ip: string): string {
  if (typeof ip !== "string") throw new Error("Invalid IPv6 format");
  const cleaned = ip.toLowerCase().replace(/\s/g, "");
  if (!cleaned) throw new Error("Please enter an IPv6 address");

  if (cleaned.split("::").length > 2) {
    throw new Error("IPv6 address cannot contain multiple '::' occurrences");
  }

  if (cleaned.includes("::")) {
    const [left, right] = cleaned.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    const missing = 8 - leftParts.length - rightParts.length;
    if (missing < 1) throw new Error("Invalid IPv6: too many hextets for '::' expansion");
    const middle = Array(missing).fill("0000");
    const all = [...leftParts, ...middle, ...rightParts];
    if (all.length !== 8) throw new Error("Invalid IPv6 address");
    return all
      .map((p) => {
        if (!/^[0-9a-f]{1,4}$/.test(p)) throw new Error(`Invalid hexadecimal hextet: "${p}"`);
        return p.padStart(4, "0");
      })
      .join(":");
  }

  const parts = cleaned.split(":");
  if (parts.length !== 8) throw new Error("IPv6 address must contain 8 hextets or use '::'");
  return parts
    .map((p) => {
      if (!/^[0-9a-f]{1,4}$/.test(p)) throw new Error(`Invalid hexadecimal hextet: "${p}"`);
      return p.padStart(4, "0");
    })
    .join(":");
}

export function compressIPv6(fullHex: string): string {
  const hextets = fullHex.split(":").map((h) => parseInt(h, 16).toString(16));
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

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

export function ipv6Network(fullHex: string, prefix: number): string {
  const hextets = fullHex.split(":").map((h) => parseInt(h, 16));
  const netHextets = hextets.map((val, idx) => {
    const bitStart = idx * 16;
    const bitEnd = (idx + 1) * 16;
    if (prefix <= bitStart) return 0;
    if (prefix >= bitEnd) return val;
    const keepBits = prefix - bitStart;
    const mask = (0xffff << (16 - keepBits)) & 0xffff;
    return val & mask;
  });
  return netHextets.map((h) => h.toString(16).padStart(4, "0")).join(":");
}

export function calculateIPv6(inputAddress: string, prefix: number): IPv6CalculationResult {
  const fullExpanded = normalizeIPv6(inputAddress);
  const netFull = ipv6Network(fullExpanded, prefix);
  const networkCompressed = compressIPv6(netFull);
  const compressed = compressIPv6(fullExpanded);

  return {
    input: inputAddress,
    network: `${networkCompressed}/${prefix}`,
    prefix,
    fullExpanded,
    compressed,
    networkCompressed,
  };
}

// ================= VLSM Algorithms =================

export function calculateVLSM(
  baseNetwork: string,
  basePrefix: number,
  hostRequirements: number[],
  gatewayPref: "first" | "last" = "first"
): VLSMCalculationResult {
  const baseOctets = ipToOctets(baseNetwork);
  const baseInt = toInt(baseOctets);
  const baseMask = maskInt(basePrefix);
  const baseNetInt = (baseInt & baseMask) >>> 0;
  const baseCapacity = Math.pow(2, 32 - basePrefix);

  const sortedHosts = [...hostRequirements]
    .filter((h) => !isNaN(h) && h > 0)
    .sort((a, b) => b - a);

  if (sortedHosts.length === 0) {
    throw new Error("Please supply at least one positive host requirement");
  }

  const warnings: string[] = [];
  const allocations: VLSMAllocation[] = [];
  let currentNetInt = baseNetInt;

  for (let i = 0; i < sortedHosts.length; i++) {
    const req = sortedHosts[i];
    const prefix = smallestPrefixForHosts(req);
    const subnetSize = Math.pow(2, 32 - prefix) >>> 0;
    const usableHosts = 32 - prefix <= 1 ? 0 : Math.pow(2, 32 - prefix) - 2;

    if (prefix < basePrefix) {
      warnings.push(`Subnet #${i + 1} (${req} hosts) requires /${prefix}, exceeding the root base block (/${basePrefix}).`);
    }

    const networkInt = currentNetInt;
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

    allocations.push({
      id: i + 1,
      requestedHosts: req,
      allocatedHosts: usableHosts,
      prefix,
      network: `${octetsToIP(...fromInt(networkInt))}/${prefix}`,
      firstUsable: firstText,
      lastUsable: lastText,
      broadcast: octetsToIP(...fromInt(broadcastInt)),
      gateway: gw,
    });

    currentNetInt = (networkInt + subnetSize) >>> 0;
  }

  const totalAllocated = currentNetInt - baseNetInt;
  const exceedsCapacity = totalAllocated > baseCapacity;
  if (exceedsCapacity) {
    warnings.push(
      `Total allocated space (${totalAllocated.toLocaleString()} addresses) exceeds root base capacity (${baseCapacity.toLocaleString()} addresses).`
    );
  }

  return {
    baseNetwork: octetsToIP(...fromInt(baseNetInt)),
    basePrefix,
    baseCapacity,
    totalAllocated,
    exceedsCapacity,
    allocations,
    warnings,
  };
}

// ================= Supernetting Algorithms =================

export interface CIDRRoute {
  ip: [number, number, number, number];
  prefix: number;
}

export function parseCIDR(cidr: string): CIDRRoute {
  const parts = cidr.trim().split("/");
  if (parts.length !== 2) {
    throw new Error(`Invalid CIDR format in "${cidr}". Expected format: IP/prefix (e.g., 192.168.1.0/24)`);
  }
  const ip = ipToOctets(parts[0]);
  const prefix = parseInt(parts[1].trim(), 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Invalid prefix in "${cidr}". Prefix must be an integer between 0 and 32`);
  }
  return { ip, prefix };
}

export function summarizeRoutes(nets: CIDRRoute[]): SupernetResult {
  if (!nets || nets.length === 0) throw new Error("No networks provided for route summarization");

  let minStart = 0xffffffff;
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
    endIP: octetsToIP(...fromInt(maxEnd)),
    inputCount: nets.length,
    spanningAddresses: maxEnd - minStart + 1,
  };
}

// ================= Binary Breakdown =================

export function calculateBinary(ipStr: string, prefix: number): BinaryBreakdown {
  const octets = ipToOctets(ipStr);
  const mask = maskFromPrefix(prefix);
  const wildcard = wildcardFromMask(mask);
  const ipInt = toInt(octets);
  const maskI = maskInt(prefix);
  const netInt = (ipInt & maskI) >>> 0;
  const network = `${octetsToIP(...fromInt(netInt))}/${prefix}`;

  const maskBits = fromInt(maskI)
    .map((o) => o.toString(2).padStart(8, "0"))
    .join("");

  const octetBreakdowns = octets.map((val, idx) => {
    const binaryString = val.toString(2).padStart(8, "0");
    const bits = binaryString.split("").map((b, bitIdx) => {
      const globalBitIndex = idx * 8 + bitIdx;
      return {
        bit: b,
        isNetwork: maskBits[globalBitIndex] === "1",
      };
    });
    return {
      octetIndex: idx + 1,
      value: val,
      binaryString,
      bits,
    };
  });

  return {
    ip: octetsToIP(...octets),
    prefix,
    network,
    mask,
    wildcard,
    octets: octetBreakdowns,
  };
}

