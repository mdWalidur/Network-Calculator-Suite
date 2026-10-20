const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../app.js');

describe('IPv4 Utilities', () => {
  test('ipToOctets parses valid IPs with or without whitespace', () => {
    assert.deepEqual(calc.ipToOctets('192.168.1.1'), [192, 168, 1, 1]);
    assert.deepEqual(calc.ipToOctets(' 10.0.0.1 '), [10, 0, 0, 1]);
    assert.deepEqual(calc.ipToOctets('172. 16. 0 . 5'), [172, 16, 0, 5]);
  });

  test('ipToOctets throws on invalid format or out-of-range octets', () => {
    assert.throws(() => calc.ipToOctets('192.168.1'), /must be 4 octets/);
    assert.throws(() => calc.ipToOctets('192.168.1.256'), /Octets must be 0–255/);
    assert.throws(() => calc.ipToOctets('192.168.1.-1'), /numeric octets/);
    assert.throws(() => calc.ipToOctets('abc.def.ghi.jkl'), /numeric octets/);
  });

  test('maskFromPrefix computes correct subnet masks', () => {
    assert.equal(calc.maskFromPrefix(8), '255.0.0.0');
    assert.equal(calc.maskFromPrefix(16), '255.255.0.0');
    assert.equal(calc.maskFromPrefix(24), '255.255.255.0');
    assert.equal(calc.maskFromPrefix(26), '255.255.255.192');
    assert.equal(calc.maskFromPrefix(30), '255.255.255.252');
    assert.equal(calc.maskFromPrefix(32), '255.255.255.255');
    assert.equal(calc.maskFromPrefix(0), '0.0.0.0');
  });

  test('wildcardFromMask computes correct inverse wildcard masks', () => {
    assert.equal(calc.wildcardFromMask('255.255.255.0'), '0.0.0.255');
    assert.equal(calc.wildcardFromMask('255.255.255.192'), '0.0.0.63');
    assert.equal(calc.wildcardFromMask('255.255.0.0'), '0.0.255.255');
  });

  test('classOfIP identifies IP classes', () => {
    assert.equal(calc.classOfIP([10, 0, 0, 1]), 'Class A');
    assert.equal(calc.classOfIP([127, 0, 0, 1]), 'Loopback');
    assert.equal(calc.classOfIP([172, 16, 0, 1]), 'Class B');
    assert.equal(calc.classOfIP([192, 168, 1, 1]), 'Class C');
    assert.equal(calc.classOfIP([224, 0, 0, 5]), 'Multicast (D)');
    assert.equal(calc.classOfIP([245, 0, 0, 1]), 'Experimental (E)');
  });

  test('isPrivateIP identifies RFC1918 private ranges', () => {
    assert.equal(calc.isPrivateIP([10, 0, 0, 1]), true);
    assert.equal(calc.isPrivateIP([172, 16, 0, 1]), true);
    assert.equal(calc.isPrivateIP([172, 31, 255, 254]), true);
    assert.equal(calc.isPrivateIP([172, 32, 0, 1]), false);
    assert.equal(calc.isPrivateIP([192, 168, 1, 1]), true);
    assert.equal(calc.isPrivateIP([8, 8, 8, 8]), false);
    assert.equal(calc.isPrivateIP([1, 1, 1, 1]), false);
  });

  test('smallestPrefixForHosts finds correct prefix', () => {
    assert.equal(calc.smallestPrefixForHosts(2), 30);
    assert.equal(calc.smallestPrefixForHosts(6), 29);
    assert.equal(calc.smallestPrefixForHosts(14), 28);
    assert.equal(calc.smallestPrefixForHosts(30), 27);
    assert.equal(calc.smallestPrefixForHosts(50), 26);
    assert.equal(calc.smallestPrefixForHosts(100), 25);
    assert.equal(calc.smallestPrefixForHosts(200), 24);
  });
});

describe('IPv6 Utilities', () => {
  test('normalizeIPv6 expands compressed IPv6 addresses', () => {
    assert.equal(calc.normalizeIPv6('2001:db8::'), '2001:0db8:0000:0000:0000:0000:0000:0000');
    assert.equal(calc.normalizeIPv6('::1'), '0000:0000:0000:0000:0000:0000:0000:0001');
    assert.equal(calc.normalizeIPv6('2001:db8:0:0:0:0:2:1'), '2001:0db8:0000:0000:0000:0000:0002:0001');
    assert.equal(calc.normalizeIPv6('fe80::1ff:fe23:4567:890a'), 'fe80:0000:0000:0000:01ff:fe23:4567:890a');
  });

  test('normalizeIPv6 throws on invalid formats', () => {
    assert.throws(() => calc.normalizeIPv6('2001::db8::1'), /multiple '::'/);
    assert.throws(() => calc.normalizeIPv6('2001:xyz::1'), /Invalid hex/);
  });

  test('compressIPv6 applies RFC 5952 compression rules', () => {
    assert.equal(calc.compressIPv6('2001:0db8:0000:0000:0000:0000:0000:0000'), '2001:db8::');
    assert.equal(calc.compressIPv6('0000:0000:0000:0000:0000:0000:0000:0001'), '::1');
    assert.equal(calc.compressIPv6('2001:0db8:0000:0000:0000:0000:0002:0001'), '2001:db8::2:1');
    assert.equal(calc.compressIPv6('2001:0db8:0001:0002:0003:0004:0005:0006'), '2001:db8:1:2:3:4:5:6');
  });

  test('ipv6Network zeroes host bits based on prefix', () => {
    const full = '2001:0db8:abcd:1234:5678:9abc:def0:1234';
    assert.equal(calc.ipv6Network(full, 64), '2001:0db8:abcd:1234:0000:0000:0000:0000');
    assert.equal(calc.ipv6Network(full, 48), '2001:0db8:abcd:0000:0000:0000:0000:0000');
    assert.equal(calc.ipv6Network(full, 32), '2001:0db8:0000:0000:0000:0000:0000:0000');
  });
});

describe('Supernetting / Route Summarization', () => {
  test('parseCIDR correctly parses CIDR strings', () => {
    assert.deepEqual(calc.parseCIDR('192.168.0.0/24'), { ip: [192, 168, 0, 0], prefix: 24 });
    assert.deepEqual(calc.parseCIDR(' 10.0.0.0 / 8 '), { ip: [10, 0, 0, 0], prefix: 8 });
  });

  test('parseCIDR throws on malformed CIDR', () => {
    assert.throws(() => calc.parseCIDR('192.168.0.0'), /expected IP\/prefix/);
    assert.throws(() => calc.parseCIDR('192.168.0.0/33'), /must be 0–32/);
  });

  test('summarizeRoutes summarizes contiguous subnets', () => {
    const nets = [
      calc.parseCIDR('192.168.0.0/24'),
      calc.parseCIDR('192.168.1.0/24')
    ];
    const res = calc.summarizeRoutes(nets);
    assert.equal(res.summary, '192.168.0.0/23');
  });

  test('summarizeRoutes summarizes four /24 subnets into a /22', () => {
    const nets = [
      calc.parseCIDR('192.168.0.0/24'),
      calc.parseCIDR('192.168.1.0/24'),
      calc.parseCIDR('192.168.2.0/24'),
      calc.parseCIDR('192.168.3.0/24')
    ];
    const res = calc.summarizeRoutes(nets);
    assert.equal(res.summary, '192.168.0.0/22');
  });

  test('summarizeRoutes preserves prefix when single network is provided', () => {
    const nets = [calc.parseCIDR('192.168.0.0/24')];
    const res = calc.summarizeRoutes(nets);
    assert.equal(res.summary, '192.168.0.0/24');
  });
});

