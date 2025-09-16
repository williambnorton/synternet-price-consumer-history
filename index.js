import dotenv from "dotenv";
import { createAppJwt, NatsService } from "pubsub-js-synternet";
import fs from "fs";
import path from "path";
dotenv.config();

const BROKER = process.env.SYNTERNET_BROKER || "broker-eu-01.synternet.com";
const SUBJECT = process.env.SYNTERNET_SUBJECT || "synternet.price.all";
const ACCESS_KEY = process.env.SYNTERNET_ACCESS_KEY;
const OUTPUT_DIR = process.env.OUTPUT_DIR || "/output";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

if (!ACCESS_KEY || !ACCESS_KEY.startsWith("SAA")) {
  console.error("❌ Missing or invalid SYNTERNET_ACCESS_KEY.  The key must start with 'SAA'. ");
  process.exit(1);
}

function getYYMMDD(date) {
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

function writeFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function computeAggregates(records) {
  if (!records.length) return {};
  
  // Calculate price statistics
  const prices = records.map(record => record.price).filter(price => price !== undefined);
  
  if (!prices.length) return {};
  
  const sorted = [...prices].sort((a,b) => a - b);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((sum,p) => sum + p, 0) / prices.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const first = prices[0];
  const last = prices[prices.length -1];
  const trend = last > first ? "UP" : "DOWN";

  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const std_dev = Math.sqrt(variance);
  
  // Calculate percentage change between first and last price
  const change = first !== 0 ? ((last - first) / first) * 100 : 0;

  return {
    min_price: min,
    max_price: max,
    median_price: median,
    avg_price: avg,
    trend,
    std_dev_price: std_dev,
    change_percent: change
  };
}

function loadRecords(file) {
  if (!fs.existsSync(file)) return [];
  try {
    const obj = JSON.parse(fs.readFileSync(file, "utf8"));
    if (Array.isArray(obj.records)) return obj.records;
    return [];
  } catch {
    return [];
  }
}

function pruneRecords(records, windowMs, now, minCheckFn) {
  return records.filter(record => {
    const ts = record.last_updated * 1000;
    const keepTime = now - windowMs <= ts;
    const keepMin = minCheckFn ? minCheckFn(new Date(ts)) : true;
    return keepTime && keepMin;
  });
}

// Updates or creates a JSON file with records pruned to time window and file-size limits
function updateRollingFile(filename, newRecord, maxLen, windowMs, now, minCheckFn = null) {
  let records = loadRecords(filename);
  records.push(newRecord);
  records = pruneRecords(records, windowMs, now, minCheckFn);
  if (records.length > maxLen) records = records.slice(records.length - maxLen);
  const aggregates = computeAggregates(records);
  writeFile(filename, { records, aggregates });
}

async function main() {
  const service = new NatsService({
    url: BROKER,
    natsCredsFile: createAppJwt(ACCESS_KEY),
  });

  await service.waitForConnection();

  service.addHandler(SUBJECT, (encoded) => {
    const dataStr = new TextDecoder().decode(encoded);
    const tokenData = JSON.parse(dataStr);
    const now = Date.now();

    // Get current date in the format "Sep 15 19:11"
    const nowDate = new Date();
    const month = nowDate.toLocaleString('en-US', { month: 'short' });
    const day = nowDate.getDate();
    const hours = nowDate.getHours().toString().padStart(2, '0');
    const minutes = nowDate.getMinutes().toString().padStart(2, '0');
    
    // Convert object to array of tokens
    const tokens = Object.entries(tokenData).map(([symbol, data]) => ({
      symbol,
      ...data
    }));
    
    console.log(`${month} ${day} ${hours}:${minutes} Processing ${tokens.length} tokens`);

    // Timing constants
    const ONE_MIN_MS = 60 * 1000;
    const FIFTEEN_MIN_MS = 15 * ONE_MIN_MS;
    const ONE_HOUR_MS = 60 * ONE_MIN_MS;
    const ONE_DAY_MS = 24 * ONE_HOUR_MS;
    const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;

    // Process each token individually
    tokens.forEach(token => {
      const tokenSymbol = token.symbol;
      const tokenDate = new Date(token.last_updated * 1000);
      const ymd = getYYMMDD(tokenDate);

      // Update files for this specific token
      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.1m.json`),
        token,
        2,
        2 * ONE_MIN_MS,
        now
      );

      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.last15minutes.json`),
        token,
        15,
        FIFTEEN_MIN_MS,
        now
      );

      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.lasthour.json`),
        token,
        60,
        ONE_HOUR_MS,
        now
      );

      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.last24hour.json`),
        token,
        24 * 60,
        ONE_DAY_MS,
        now,
        (date) => [0,15,30,45].includes(date.getMinutes())
      );

      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.last30days.json`),
        token,
        60 * 24,
        THIRTY_DAYS_MS,
        now,
        (date) => date.getMinutes() === 0
      );

      updateRollingFile(
        path.join(OUTPUT_DIR, `${tokenSymbol}.${ymd}.json`),
        token,
        1000000,
        ONE_DAY_MS,
        now
      );
    });
  });

  await service.serve();
}

process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT. Shutting down...");
  process.exit(0);
});

main();

