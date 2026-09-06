import express from 'express';
import { getDB } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Tool execution implementations
const executeIP = async (input) => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    return {
      status: 'success',
      data: {
        ip: response.data.ip,
        city: response.data.city,
        country: response.data.country_name,
        isp: response.data.org,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
        currency: response.data.currency
      }
    };
  } catch (error) {
    return { status: 'error', message: 'Failed to fetch IP information' };
  }
};

const executeSSL = async (input) => {
  try {
    const domain = input.trim();
    const url = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&all=done&ignoreMismatch=on`;
    const response = await axios.get(url, { timeout: 10000 });
    return {
      status: 'success',
      data: {
        domain: response.data.host,
        grade: response.data.grade || 'N/A',
        issuedTo: response.data.cert?.subject || 'Unknown',
        issuer: response.data.cert?.issuerLabel || 'Unknown',
        validFrom: response.data.cert?.notBefore || 'Unknown',
        validTo: response.data.cert?.notAfter || 'Unknown',
        keySize: response.data.cert?.keySize || 'Unknown',
        protocol: response.data.protocol || 'Unknown'
      }
    };
  } catch (error) {
    return { status: 'error', message: 'SSL check failed', domain: input };
  }
};

const executeDNS = async (input) => {
  try {
    const domain = input.trim();
    const response = await axios.get(`https://dns.google/resolve?name=${domain}`);
    const answers = response.data.Answer || [];
    return {
      status: 'success',
      data: {
        domain,
        records: answers.map(r => ({
          type: r.type === 1 ? 'A' : r.type === 5 ? 'CNAME' : 'OTHER',
          value: r.data,
          ttl: r.TTL
        })),
        total: answers.length
      }
    };
  } catch (error) {
    return { status: 'error', message: 'DNS lookup failed', domain: input };
  }
};

const executePing = async (input) => {
  try {
    const domain = input.trim();
    const start = Date.now();
    await axios.head(`https://${domain}`, { timeout: 5000 });
    const latency = Date.now() - start;
    return {
      status: 'success',
      data: {
        domain,
        latency: `${latency}ms`,
        responseTime: latency,
        status: 'Online'
      }
    };
  } catch (error) {
    return { status: 'error', message: 'Host unreachable', domain: input };
  }
};

const executeBase64 = async (input, action = 'encode') => {
  try {
    if (action === 'encode') {
      return {
        status: 'success',
        data: {
          original: input,
          encoded: Buffer.from(input).toString('base64'),
          length: input.length
        }
      };
    } else {
      return {
        status: 'success',
        data: {
          encoded: input,
          decoded: Buffer.from(input, 'base64').toString('utf-8'),
          length: Buffer.from(input, 'base64').toString('utf-8').length
        }
      };
    }
  } catch (error) {
    return { status: 'error', message: 'Base64 conversion failed' };
  }
};

const executeHTTPStatus = async (input) => {
  try {
    const url = input.trim();
    const response = await axios.head(url, { maxRedirects: 5, timeout: 5000 });
    return {
      status: 'success',
      data: {
        url,
        statusCode: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'] || 'Unknown',
        server: response.headers['server'] || 'Unknown',
        responseTime: `${response.duration || 0}ms`,
        lastModified: response.headers['last-modified'] || 'Not specified'
      }
    };
  } catch (error) {
    return {
      status: 'error',
      data: {
        url: input,
        statusCode: error.response?.status || 'Connection failed',
        message: error.message
      }
    };
  }
};

const executePortScan = async (input) => {
  const host = input.trim();
  const commonPorts = [80, 443, 8080, 3306, 5432, 27017, 6379, 22, 21, 25];
  const results = [];
  
  for (const port of commonPorts) {
    try {
      const response = await axios.get(`http://${host}:${port}`, { timeout: 500 });
      results.push({ port, status: 'Open', service: getServiceName(port) });
    } catch (err) {
      results.push({ port, status: 'Closed', service: getServiceName(port) });
    }
  }
  
  return {
    status: 'success',
    data: {
      host,
      portsScanned: commonPorts,
      results,
      openPorts: results.filter(r => r.status === 'Open').length
    }
  };
};

const getServiceName = (port) => {
  const services = {
    80: 'HTTP', 443: 'HTTPS', 22: 'SSH', 21: 'FTP',
    25: 'SMTP', 3306: 'MySQL', 5432: 'PostgreSQL', 6379: 'Redis',
    8080: 'HTTP Alt', 27017: 'MongoDB'
  };
  return services[port] || 'Unknown';
};

const executePhishing = async (input) => {
  const url = input.trim();
  const indicators = [];
  let score = 0;
  
  if (url.includes('http://')) { indicators.push('❌ Insecure HTTP protocol'); score += 30; }
  if (url.includes('bit.ly') || url.includes('tinyurl')) { indicators.push('⚠️ URL shortener detected'); score += 25; }
  if (url.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) { indicators.push('❌ IP address used instead of domain'); score += 35; }
  if (!url.includes('https://')) { indicators.push('⚠️ No HTTPS encryption'); score += 20; }
  if (url.length > 100) { indicators.push('⚠️ Unusually long URL'); score += 10; }
  
  return {
    status: 'success',
    data: {
      url,
      riskScore: Math.min(score, 100),
      riskLevel: score >= 70 ? '🔴 HIGH RISK' : score >= 40 ? '🟡 MEDIUM RISK' : '🟢 LOW RISK',
      indicators,
      isPhishing: score >= 70
    }
  };
};

const executeSQLi = async (input) => {
  const patterns = [
    { regex: /('|")(\s*)(or|and)(\s*)(1|true|=)/i, name: 'OR/AND boolean bypass', severity: 'HIGH' },
    { regex: /union(\s+)select/i, name: 'UNION SELECT injection', severity: 'CRITICAL' },
    { regex: /drop(\s+)table/i, name: 'DROP TABLE injection', severity: 'CRITICAL' },
    { regex: /exec(\s*)\(/i, name: 'Code execution attempt', severity: 'CRITICAL' },
    { regex: /sleep\(\d+\)/i, name: 'Time-based SQLi', severity: 'HIGH' },
    { regex: /\*/i, name: 'Wildcard detected', severity: 'MEDIUM' }
  ];
  
  const found = [];
  patterns.forEach(({ regex, name, severity }) => {
    if (regex.test(input)) {
      found.push({ pattern: name, severity, detected: true });
    }
  });
  
  return {
    status: 'success',
    data: {
      input: input.substring(0, 50),
      vulnerabilitiesFound: found.length,
      vulnerabilities: found,
      isVulnerable: found.length > 0,
      riskLevel: found.length > 0 ? 'HIGH' : 'LOW'
    }
  };
};

const executeXSS = async (input) => {
  const patterns = [
    { regex: /<script[^>]*>.*?<\/script>/gi, name: 'Script tag injection', type: 'CRITICAL' },
    { regex: /on\w+\s*=\s*["']?[^"']*["']?/gi, name: 'Event handler injection', type: 'CRITICAL' },
    { regex: /javascript:/gi, name: 'JavaScript protocol', type: 'HIGH' },
    { regex: /<iframe[^>]*>/gi, name: 'iFrame injection', type: 'HIGH' },
    { regex: /<img[^>]*onerror[^>]*>/gi, name: 'Image error handler', type: 'HIGH' }
  ];
  
  const found = [];
  patterns.forEach(({ regex, name, type }) => {
    const matches = input.match(regex);
    if (matches) {
      found.push({ threat: name, severity: type, count: matches.length });
    }
  });
  
  return {
    status: 'success',
    data: {
      input: input.substring(0, 50),
      threatsFound: found.length,
      threats: found,
      isVulnerable: found.length > 0,
      severity: found.length > 3 ? 'CRITICAL' : found.length > 0 ? 'HIGH' : 'SAFE'
    }
  };
};

const executeJWT = async (input) => {
  try {
    const parts = input.trim().split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
    
    return {
      status: 'success',
      data: {
        valid: true,
        header,
        payload,
        isExpired,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Never',
        algorithm: header.alg || 'Unknown',
        subject: payload.sub || 'Not specified'
      }
    };
  } catch (error) {
    return { status: 'error', message: 'Invalid JWT token', error: error.message };
  }
};

const executeWAF = async (input) => {
  try {
    const domain = input.trim();
    const response = await axios.get(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 0,
      timeout: 5000
    }).catch(e => e.response);
    
    const wafSignatures = {
      'Cloudflare': response?.headers?.['cf-ray'] ? 'Detected ✓' : null,
      'AWS WAF': response?.headers?.['x-amzn-wafv2-action'] ? 'Detected ✓' : null,
      'Imperva': response?.headers?.['x-iinfo'] ? 'Detected ✓' : null,
      'Akamai': response?.headers?.['x-akamai-transformed'] ? 'Detected ✓' : null,
      'ModSecurity': response?.headers?.['x-content-security-policy'] ? 'Detected ✓' : null
    };
    
    const detected = Object.entries(wafSignatures)
      .filter(([_, value]) => value)
      .map(([name, _]) => name);
    
    return {
      status: 'success',
      data: {
        domain,
        hasWAF: detected.length > 0,
        detectedWAF: detected,
        statusCode: response?.status,
        recommendation: detected.length > 0 ? 'Website is protected' : 'No WAF detected'
      }
    };
  } catch (error) {
    return { status: 'error', message: 'WAF detection failed', domain: input };
  }
};

const executeFuzzing = async (input) => {
  const baseUrl = input.trim();
  const paths = ['/admin', '/api', '/config', '/backup', '/.env', '/test', '/debug', '/console'];
  const found = [];
  
  for (const path of paths) {
    try {
      const response = await axios.head(`${baseUrl}${path}`, { timeout: 500 });
      if (response.status < 400) found.push({ path, status: response.status });
    } catch (err) {
      // Not found
    }
  }
  
  return {
    status: 'success',
    data: {
      baseUrl,
      pathsTested: paths.length,
      pathsFound: found,
      totalFound: found.length,
      severity: found.length > 0 ? 'HIGH' : 'LOW'
    }
  };
};

const executeCORS = async (input) => {
  try {
    const url = input.trim();
    const response = await axios.get(url, { timeout: 5000 });
    const corsHeader = response.headers['access-control-allow-origin'];
    
    return {
      status: 'success',
      data: {
        url,
        hasCORS: !!corsHeader,
        corsAllowOrigin: corsHeader || 'Not set',
        corsAllowMethods: response.headers['access-control-allow-methods'] || 'Not set',
        corsAllowCredentials: response.headers['access-control-allow-credentials'] || 'false',
        vulnerability: corsHeader === '*' ? 'VULNERABLE - Allows all origins' : 'Safe'
      }
    };
  } catch (error) {
    return { status: 'error', message: 'CORS check failed', url: input };
  }
};

const executeAPIKey = async (input) => {
  const patterns = [
    { regex: /['"]?api[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/gi, name: 'API Key' },
    { regex: /['"]?auth[_-]?token['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/gi, name: 'Auth Token' },
    { regex: /['"]?secret['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/gi, name: 'Secret Key' },
    { regex: /sk_live_[A-Za-z0-9]{24}/g, name: 'Stripe API Key' },
    { regex: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' }
  ];
  
  const found = [];
  patterns.forEach(({ regex, name }) => {
    const matches = input.match(regex);
    if (matches) {
      found.push({ type: name, count: matches.length, severity: 'CRITICAL' });
    }
  });
  
  return {
    status: 'success',
    data: {
      input: input.substring(0, 50),
      keysFound: found.length,
      keys: found,
      severity: found.length > 0 ? 'CRITICAL - Keys exposed' : 'Safe'
    }
  };
};

const executeEncryption = async (input) => {
  const algorithms = [
    { name: 'MD5', pattern: /[a-f0-9]{32}/i, strength: 'Weak' },
    { name: 'SHA-1', pattern: /[a-f0-9]{40}/i, strength: 'Weak' },
    { name: 'SHA-256', pattern: /[a-f0-9]{64}/i, strength: 'Strong' },
    { name: 'DES', pattern: /DES/i, strength: 'Very Weak' },
    { name: 'RC4', pattern: /RC4/i, strength: 'Weak' },
    { name: 'AES', pattern: /AES/i, strength: 'Strong' }
  ];
  
  const found = [];
  algorithms.forEach(({ name, pattern, strength }) => {
    if (pattern.test(input)) {
      found.push({ algorithm: name, strength, secure: strength === 'Strong' });
    }
  });
  
  return {
    status: 'success',
    data: {
      input: input.substring(0, 50),
      algorithmsFound: found.length,
      algorithms: found,
      recommendation: found.some(a => !a.secure) ? 'Weak algorithms detected - Use AES or SHA-256' : 'Strong algorithms used'
    }
  };
};

// Main execution router
router.post('/:toolId/execute', verifyToken, async (req, res) => {
  try {
    const { toolId } = req.params;
    const { input } = req.body;

    if (!input || input.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Input is required'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const logsCollection = db.collection('logs');

    // Get user
    const user = await usersCollection.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Tool execution map
    const tools = {
      'ip-checker': executeIP,
      'ssl-checker': executeSSL,
      'dns-lookup': executeDNS,
      'ping-latency': executePing,
      'base64-codec': executeBase64,
      'http-response': executeHTTPStatus,
      'port-scanner-lite': executePortScan,
      'phishing-detector': executePhishing,
      'sqli-tester': executeSQLi,
      'xss-scanner': executeXSS,
      'jwt-auditor': executeJWT,
      'waf-detector': executeWAF,
      'fuzzing-engine': executeFuzzing,
      'cors-detector': executeCORS,
      'api-key-extractor': executeAPIKey,
      'encryption-detector': executeEncryption
    };

    const executor = tools[toolId];
    if (!executor) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const startTime = Date.now();
    const result = await executor(input);
    const executionTime = Date.now() - startTime;

    // Log execution
    await logsCollection.insertOne({
      userId: req.userId,
      toolId,
      action: 'tool-executed',
      status: result.status === 'error' ? 'error' : 'success',
      executionTime,
      timestamp: new Date()
    });

    // Update tool usage
    await usersCollection.updateOne(
      { _id: req.userId },
      { $inc: { totalToolUses: 1 } }
    );

    res.json({
      success: true,
      tool: toolId,
      ...result,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Tool execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Tool execution failed',
      error: error.message
    });
  }
});

export default router;
