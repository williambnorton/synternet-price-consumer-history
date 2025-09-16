# synternet-price-consumer-history
## Introduction
A simple subscribe and store of the Synternet token price data stream as a number of files.
Steps to use:
1) Create a project on https://portal.synternet.com
2) Add a service: synternet.price.all ...You will need SYNT tokens here (Free 100SYNT if you bought my Amazon KDP Synternet AI Cookbook in 2025)
3) Click the '...' next to the project name to Reveal Access Token

## AI Prompt
Create a new project directory named synternet-price-consumer-history
Write a full index.js file implementing all 6 files below and their rolling JSON updates + statistics as specified
Create a simple Dockerfile to containerize the Node.js app
Initialize npm and install required packages
Print each step as requested so I can watch it progress
This will set me up to run the project using Docker with a mounted volume for persistent output.

I want there to be several files to be continually created in that directory:
1) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.YYMMDD.json where YY is the year MM is the month and DD is the day the record was collected.
2) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.last15minutes.json that only includes the last 15 samples collected.That is, remove samples collected outside of the last 15 minute period.
3) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.lasthour.json that only includes the last 60 samples collected. That is, remove samples collected outside of the last 60 minute period.
4) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.last24hour.json that only includes the last 60*24 samples collected but only include samples collected on the 0,15,30, and 45 minute boundaries. That is, remove samples collected outside of the last 24 hour period.
5) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.last30days.json that only includes the last 60*24 samples collected but only include samples collected on the 0 minute boundaries. That is, store only 1 sample per hour. Remove samples collected outside of the last 30-day period.
6) I want each raw JSON record received to be appended to an always-valid JSON file named synternet.price.all.1m.json that only includes the last 2 samples collected, the last one and the current one. That is, it should hold exactly 2 samples. Remove samples collected outside of these.
For each of these files, calculated and add the following aggregate statistics for the file: min_price, max_price, median_price, avg_price, std deviation, and trend which shows whether the ending price for the period is DOWN relative to the first sample or UP relative to the first sample in the period.
## Sample Use
```
% docker run --rm -it -e SYNTERNET_ACCESS_KEY=SA_SYNTERNET_ACCESS_KEY_HERE  williambnorton/synternet-price-consumer:latest
Files created
:
:
FBTC.last15minutes.json			SYNT.last15minutes.json
FBTC.last1minute.json			SYNT.last1minute.json
FBTC.last24hour.json			SYNT.last24hour.json
FBTC.last30days.json			SYNT.last30days.json
FBTC.lasthour.json			SYNT.lasthour.json
FDUSD.250916.json			synternet.price.all.250916.json
FDUSD.last15minutes.json		synternet.price.all.last15minutes.json
FDUSD.last1minute.json			synternet.price.all.last1minute.json
FDUSD.last24hour.json			synternet.price.all.last24hour.json
FDUSD.last30days.json			synternet.price.all.last30days.json
FDUSD.lasthour.json			synternet.price.all.lasthour.json
:
:

wbn@doghouse synternet.price.all.history % cat SYNT.last15minutes.json
{
  "records": [
    {
      "ts": 1757987820000,
      "price": 0.012853092278076335,
      "volume_24h": 2157098.14693112,
      "volume_change_24h": 30.8722,
      "price_percent_change_24h": -0.18568748,
      "price_percent_change_30d": -20.09422096,
      "market_cap": 8424129.564818632,
      "market_cap_dominance": 0,
      "last_updated": 1757987820
    },
    {
      "ts": 1757987880000,
      "price": 0.012845671790834194,
      "volume_24h": 2157968.1873493,
      "volume_change_24h": 30.9255,
      "price_percent_change_24h": -0.27630793,
      "price_percent_change_30d": -20.13846496,
      "market_cap": 8419266.054574603,
      "market_cap_dominance": 0,
      "last_updated": 1757987880
    },
    {
      "ts": 1757987940000,
      "price": 0.012846143546355453,
      "volume_24h": 2158024.67637763,
      "volume_change_24h": 30.8823,
      "price_percent_change_24h": -0.24789965,
      "price_percent_change_30d": -20.13007988,
      "market_cap": 8419575.250956923,
      "market_cap_dominance": 0,
      "last_updated": 1757987940
    },
    {
      "ts": 1757988000000,
      "price": 0.012852010020326389,
      "volume_24h": 2158333.39732591,
      "volume_change_24h": 30.9143,
      "price_percent_change_24h": -0.17230667,
      "price_percent_change_30d": -20.1242521,
      "market_cap": 8423420.235163882,
      "market_cap_dominance": 0,
      "last_updated": 1757988000
    },
    {
      "ts": 1757988060000,
      "price": 0.012852010020326389,
      "volume_24h": 2158333.39732591,
      "volume_change_24h": 30.9143,
      "price_percent_change_24h": -0.17230667,
      "price_percent_change_30d": -20.1242521,
      "market_cap": 8423420.235163882,
      "market_cap_dominance": 0,
      "last_updated": 1757988000
    },
    {
      "ts": 1757988120000,
      "price": 0.012853108791927017,
      "volume_24h": 2155569.99899423,
      "volume_change_24h": 30.7082,
      "price_percent_change_24h": -0.14219354,
      "price_percent_change_30d": -20.09412318,
      "market_cap": 8424140.388269888,
      "market_cap_dominance": 0,
      "last_updated": 1757988120
    },
    {
      "ts": 1757988180000,
      "price": 0.012854425425109412,
      "volume_24h": 2154331.25159646,
      "volume_change_24h": 30.583,
      "price_percent_change_24h": 0.06323733,
      "price_percent_change_30d": -19.99606754,
      "market_cap": 8425003.331465025,
      "market_cap_dominance": 0,
      "last_updated": 1757988180
    },
    {
      "ts": 1757988240000,
      "price": 0.012853616615362,
      "volume_24h": 2152920.07938691,
      "volume_change_24h": 30.3631,
      "price_percent_change_24h": -0.00486811,
      "price_percent_change_30d": -20.05156292,
      "market_cap": 8424473.224160254,
      "market_cap_dominance": 0,
      "last_updated": 1757988240
    },
    {
      "ts": 1757988300000,
      "price": 0.012846000947305597,
      "volume_24h": 2152969.06976442,
      "volume_change_24h": 30.2769,
      "price_percent_change_24h": 0.03440341,
      "price_percent_change_30d": -20.11439675,
      "market_cap": 8419481.78917778,
      "market_cap_dominance": 0,
      "last_updated": 1757988300
    },
    {
      "ts": 1757988360000,
      "price": 0.01285423523316181,
      "volume_24h": 2152348.10113262,
      "volume_change_24h": 30.2335,
      "price_percent_change_24h": 0.12170797,
      "price_percent_change_30d": -20.03872911,
      "market_cap": 8424878.676512416,
      "market_cap_dominance": 0,
      "last_updated": 1757988360
    },
    {
      "ts": 1757988420000,
      "price": 0.012844864377997613,
      "volume_24h": 2151499.95511618,
      "volume_change_24h": 30.2272,
      "price_percent_change_24h": 0.00901631,
      "price_percent_change_30d": -20.0816741,
      "market_cap": 8418736.86282833,
      "market_cap_dominance": 0,
      "last_updated": 1757988420
    },
    {
      "ts": 1757988480000,
      "price": 0.012852317294185107,
      "volume_24h": 2152058.02318296,
      "volume_change_24h": 30.2281,
      "price_percent_change_24h": 0.0506211,
      "price_percent_change_30d": -20.076098,
      "market_cap": 8423621.627540262,
      "market_cap_dominance": 0,
      "last_updated": 1757988480
    },
    {
      "ts": 1757988540000,
      "price": 0.012849078127292283,
      "volume_24h": 2151302.95618718,
      "volume_change_24h": 30.2033,
      "price_percent_change_24h": -0.11888289,
      "price_percent_change_30d": -20.06485379,
      "market_cap": 8421498.623908384,
      "market_cap_dominance": 0,
      "last_updated": 1757988540
    },
    {
      "ts": 1757988540000,
      "price": 0.012858089699489681,
      "volume_24h": 2151513.31734706,
      "volume_change_24h": 30.3954,
      "price_percent_change_24h": 0.03171531,
      "price_percent_change_30d": -19.93088506,
      "market_cap": 8427404.95758523,
      "market_cap_dominance": 0,
      "last_updated": 1757988600
    }
  ],
  "aggregates": {
    "min_price": 0.012844864377997613,
    "max_price": 0.012858089699489681,
    "median_price": 0.012852317294185107,
    "avg_price": 0.012851047440553516,
    "trend": "UP"
  }
}%

