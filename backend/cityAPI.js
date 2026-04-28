// Worldwide countries + cities directory.
// Uses the free countriesnow.space API (same source the seed script used)
// and caches results in memory so we only hit it once per process.

let countriesCache = null;     // sorted string[]
let citiesByCountry = null;    // { [country]: string[] (sorted) }
let inflight = null;

async function fetchAllCountriesAndCities() {
  if (countriesCache && citiesByCountry) {
    return { countries: countriesCache, citiesByCountry };
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json && json.data;
      if (!Array.isArray(data)) throw new Error('Unexpected response shape');

      const map = {};
      for (const entry of data) {
        if (!entry || !entry.country || !Array.isArray(entry.cities)) continue;
        map[entry.country] = entry.cities.slice().sort();
      }
      citiesByCountry = map;
      countriesCache = Object.keys(map).sort();
      console.log(`🌍 Loaded ${countriesCache.length} countries / ${
        Object.values(map).reduce((s, a) => s + a.length, 0)
      } cities from countriesnow.space`);
    } catch (err) {
      console.warn('⚠️  Failed to fetch worldwide city list:', err.message);
      citiesByCountry = citiesByCountry || {};
      countriesCache = countriesCache || [];
    } finally {
      inflight = null;
    }
    return { countries: countriesCache, citiesByCountry };
  })();

  return inflight;
}

async function getAllCountries() {
  const { countries } = await fetchAllCountriesAndCities();
  return countries;
}

async function getCitiesForCountry(country) {
  const { citiesByCountry } = await fetchAllCountriesAndCities();
  return citiesByCountry[country] || [];
}

// Best-effort lookup of cost-of-living indices from RapidAPI for a city.
// Returns null if unavailable.
async function fetchRapidApiCityCost(city, country) {
  if (!process.env.RAPIDAPI_KEY) return null;
  try {
    const url = new URL('https://cities-cost-of-living-and-average-prices-api.p.rapidapi.com/city');
    url.searchParams.set('city_name', city);
    if (country) url.searchParams.set('country_name', country);

    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'cities-cost-of-living-and-average-prices-api.p.rapidapi.com',
      },
    });
    if (!res.ok) {
      console.warn(`RapidAPI ${city}/${country} -> HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data) return null;
    const pick = (...keys) => {
      for (const k of keys) {
        const v = data[k];
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(parseFloat(v))) return parseFloat(v);
      }
      return null;
    };
    const costOfLivingIndex = pick('cost_of_living_index', 'costOfLivingIndex');
    const rentIndex = pick('rent_index', 'rentIndex');
    if (costOfLivingIndex == null || rentIndex == null) return null;
    return {
      city,
      country: data.country || country,
      costOfLivingIndex,
      rentIndex,
      groceriesIndex: pick('groceries_index', 'groceriesIndex'),
      restaurantIndex: pick('restaurant_price_index', 'restaurantIndex'),
    };
  } catch (err) {
    console.warn('RapidAPI lookup failed:', err.message);
    return null;
  }
}

// Country-level fallback indices when neither the DB nor RapidAPI has the city.
const COUNTRY_FALLBACK = {
  'Afghanistan': 18, 'Albania': 35, 'Algeria': 28, 'Argentina': 32, 'Armenia': 34,
  'Australia': 74, 'Austria': 72, 'Azerbaijan': 36, 'Bahrain': 55, 'Bangladesh': 22,
  'Belarus': 32, 'Belgium': 72, 'Bolivia': 28, 'Bosnia and Herzegovina': 34,
  'Botswana': 38, 'Brazil': 40, 'Bulgaria': 38, 'Cambodia': 28, 'Cameroon': 30,
  'Canada': 72, 'Chile': 45, 'China': 48, 'Colombia': 32, 'Costa Rica': 48,
  'Croatia': 52, 'Cuba': 22, 'Cyprus': 60, 'Czech Republic': 52, 'Denmark': 88,
  'Dominican Republic': 38, 'Ecuador': 32, 'Egypt': 22, 'El Salvador': 35,
  'Estonia': 58, 'Ethiopia': 22, 'Finland': 80, 'France': 75, 'Georgia': 38,
  'Germany': 72, 'Ghana': 30, 'Greece': 60, 'Hong Kong': 85, 'Hungary': 48,
  'Iceland': 90, 'India': 25, 'Indonesia': 35, 'Iran': 28, 'Ireland': 78,
  'Israel': 80, 'Italy': 70, 'Jamaica': 45, 'Japan': 78, 'Jordan': 50,
  'Kazakhstan': 36, 'Kenya': 35, 'Kuwait': 60, 'Latvia': 55, 'Lebanon': 50,
  'Lithuania': 55, 'Luxembourg': 85, 'Malaysia': 42, 'Malta': 65, 'Mexico': 38,
  'Moldova': 32, 'Mongolia': 32, 'Montenegro': 42, 'Morocco': 32, 'Myanmar': 30,
  'Nepal': 25, 'Netherlands': 75, 'New Zealand': 72, 'Nicaragua': 32, 'Nigeria': 30,
  'North Macedonia': 35, 'Norway': 88, 'Oman': 55, 'Pakistan': 22, 'Panama': 50,
  'Paraguay': 32, 'Peru': 35, 'Philippines': 35, 'Poland': 48, 'Portugal': 60,
  'Qatar': 65, 'Romania': 40, 'Russia': 38, 'Saudi Arabia': 55, 'Serbia': 38,
  'Singapore': 80, 'Slovakia': 50, 'Slovenia': 60, 'South Africa': 42,
  'South Korea': 75, 'Spain': 65, 'Sri Lanka': 30, 'Sweden': 75, 'Switzerland': 95,
  'Taiwan': 60, 'Tanzania': 32, 'Thailand': 38, 'Tunisia': 28, 'Turkey': 38,
  'Uganda': 28, 'UK': 78, 'United Kingdom': 78, 'Ukraine': 32,
  'United Arab Emirates': 65, 'Uruguay': 50, 'USA': 80, 'United States': 80,
  'Venezuela': 35, 'Vietnam': 32, 'Yemen': 25, 'Zambia': 30, 'Zimbabwe': 28,
};

function fallbackIndicesForCountry(country) {
  const col = COUNTRY_FALLBACK[country] || 45;
  return {
    costOfLivingIndex: col,
    rentIndex: Math.round(col * 0.6),
    groceriesIndex: Math.round(col * 0.9),
    restaurantIndex: Math.round(col * 0.95),
  };
}

module.exports = {
  getAllCountries,
  getCitiesForCountry,
  fetchRapidApiCityCost,
  fallbackIndicesForCountry,
};
