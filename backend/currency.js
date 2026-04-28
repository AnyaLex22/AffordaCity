// Country -> currency mapping (ISO 4217 code + symbol)
const COUNTRY_CURRENCY = {
  'Afghanistan':            { code: 'AFN', symbol: '؋' },
  'Albania':                { code: 'ALL', symbol: 'L' },
  'Algeria':                { code: 'DZD', symbol: 'د.ج' },
  'Andorra':                { code: 'EUR', symbol: '€' },
  'Angola':                 { code: 'AOA', symbol: 'Kz' },
  'Argentina':              { code: 'ARS', symbol: '$' },
  'Armenia':                { code: 'AMD', symbol: '֏' },
  'Australia':              { code: 'AUD', symbol: 'A$' },
  'Austria':                { code: 'EUR', symbol: '€' },
  'Azerbaijan':             { code: 'AZN', symbol: '₼' },
  'Bahamas':                { code: 'BSD', symbol: '$' },
  'Bahrain':                { code: 'BHD', symbol: '.د.ب' },
  'Bangladesh':             { code: 'BDT', symbol: '৳' },
  'Belarus':                { code: 'BYN', symbol: 'Br' },
  'Belgium':                { code: 'EUR', symbol: '€' },
  'Belize':                 { code: 'BZD', symbol: 'BZ$' },
  'Bolivia':                { code: 'BOB', symbol: 'Bs.' },
  'Bosnia and Herzegovina': { code: 'BAM', symbol: 'KM' },
  'Botswana':               { code: 'BWP', symbol: 'P' },
  'Brazil':                 { code: 'BRL', symbol: 'R$' },
  'Brunei':                 { code: 'BND', symbol: 'B$' },
  'Bulgaria':               { code: 'BGN', symbol: 'лв' },
  'Cambodia':               { code: 'KHR', symbol: '៛' },
  'Cameroon':               { code: 'XAF', symbol: 'FCFA' },
  'Canada':                 { code: 'CAD', symbol: 'C$' },
  'Chile':                  { code: 'CLP', symbol: '$' },
  'China':                  { code: 'CNY', symbol: '¥' },
  'Colombia':               { code: 'COP', symbol: '$' },
  'Costa Rica':             { code: 'CRC', symbol: '₡' },
  'Croatia':                { code: 'EUR', symbol: '€' },
  'Cuba':                   { code: 'CUP', symbol: '$' },
  'Cyprus':                 { code: 'EUR', symbol: '€' },
  'Czech Republic':         { code: 'CZK', symbol: 'Kč' },
  'Czechia':                { code: 'CZK', symbol: 'Kč' },
  'Denmark':                { code: 'DKK', symbol: 'kr' },
  'Dominican Republic':     { code: 'DOP', symbol: 'RD$' },
  'Ecuador':                { code: 'USD', symbol: '$' },
  'Egypt':                  { code: 'EGP', symbol: 'E£' },
  'El Salvador':            { code: 'USD', symbol: '$' },
  'Estonia':                { code: 'EUR', symbol: '€' },
  'Ethiopia':               { code: 'ETB', symbol: 'Br' },
  'Finland':                { code: 'EUR', symbol: '€' },
  'France':                 { code: 'EUR', symbol: '€' },
  'Georgia':                { code: 'GEL', symbol: '₾' },
  'Germany':                { code: 'EUR', symbol: '€' },
  'Ghana':                  { code: 'GHS', symbol: '₵' },
  'Greece':                 { code: 'EUR', symbol: '€' },
  'Guatemala':              { code: 'GTQ', symbol: 'Q' },
  'Honduras':               { code: 'HNL', symbol: 'L' },
  'Hong Kong':              { code: 'HKD', symbol: 'HK$' },
  'Hungary':                { code: 'HUF', symbol: 'Ft' },
  'Iceland':                { code: 'ISK', symbol: 'kr' },
  'India':                  { code: 'INR', symbol: '₹' },
  'Indonesia':              { code: 'IDR', symbol: 'Rp' },
  'Iran':                   { code: 'IRR', symbol: '﷼' },
  'Iraq':                   { code: 'IQD', symbol: 'ع.د' },
  'Ireland':                { code: 'EUR', symbol: '€' },
  'Israel':                 { code: 'ILS', symbol: '₪' },
  'Italy':                  { code: 'EUR', symbol: '€' },
  'Jamaica':                { code: 'JMD', symbol: 'J$' },
  'Japan':                  { code: 'JPY', symbol: '¥' },
  'Jordan':                 { code: 'JOD', symbol: 'JD' },
  'Kazakhstan':             { code: 'KZT', symbol: '₸' },
  'Kenya':                  { code: 'KES', symbol: 'KSh' },
  'Kuwait':                 { code: 'KWD', symbol: 'KD' },
  'Kyrgyzstan':             { code: 'KGS', symbol: 'с' },
  'Laos':                   { code: 'LAK', symbol: '₭' },
  'Latvia':                 { code: 'EUR', symbol: '€' },
  'Lebanon':                { code: 'LBP', symbol: 'L£' },
  'Libya':                  { code: 'LYD', symbol: 'ل.د' },
  'Lithuania':              { code: 'EUR', symbol: '€' },
  'Luxembourg':             { code: 'EUR', symbol: '€' },
  'Macau':                  { code: 'MOP', symbol: 'MOP$' },
  'Madagascar':             { code: 'MGA', symbol: 'Ar' },
  'Malaysia':               { code: 'MYR', symbol: 'RM' },
  'Maldives':               { code: 'MVR', symbol: 'Rf' },
  'Malta':                  { code: 'EUR', symbol: '€' },
  'Mauritius':              { code: 'MUR', symbol: '₨' },
  'Mexico':                 { code: 'MXN', symbol: '$' },
  'Moldova':                { code: 'MDL', symbol: 'L' },
  'Monaco':                 { code: 'EUR', symbol: '€' },
  'Mongolia':               { code: 'MNT', symbol: '₮' },
  'Montenegro':             { code: 'EUR', symbol: '€' },
  'Morocco':                { code: 'MAD', symbol: 'DH' },
  'Mozambique':             { code: 'MZN', symbol: 'MT' },
  'Myanmar':                { code: 'MMK', symbol: 'K' },
  'Namibia':                { code: 'NAD', symbol: 'N$' },
  'Nepal':                  { code: 'NPR', symbol: '₨' },
  'Netherlands':            { code: 'EUR', symbol: '€' },
  'New Zealand':            { code: 'NZD', symbol: 'NZ$' },
  'Nicaragua':              { code: 'NIO', symbol: 'C$' },
  'Nigeria':                { code: 'NGN', symbol: '₦' },
  'North Macedonia':        { code: 'MKD', symbol: 'ден' },
  'Norway':                 { code: 'NOK', symbol: 'kr' },
  'Oman':                   { code: 'OMR', symbol: 'ر.ع.' },
  'Pakistan':               { code: 'PKR', symbol: '₨' },
  'Panama':                 { code: 'PAB', symbol: 'B/.' },
  'Paraguay':               { code: 'PYG', symbol: '₲' },
  'Peru':                   { code: 'PEN', symbol: 'S/' },
  'Philippines':            { code: 'PHP', symbol: '₱' },
  'Poland':                 { code: 'PLN', symbol: 'zł' },
  'Portugal':               { code: 'EUR', symbol: '€' },
  'Puerto Rico':            { code: 'USD', symbol: '$' },
  'Qatar':                  { code: 'QAR', symbol: 'ر.ق' },
  'Romania':                { code: 'RON', symbol: 'lei' },
  'Russia':                 { code: 'RUB', symbol: '₽' },
  'Rwanda':                 { code: 'RWF', symbol: 'FRw' },
  'Saudi Arabia':           { code: 'SAR', symbol: 'ر.س' },
  'Senegal':                { code: 'XOF', symbol: 'CFA' },
  'Serbia':                 { code: 'RSD', symbol: 'дин' },
  'Singapore':              { code: 'SGD', symbol: 'S$' },
  'Slovakia':               { code: 'EUR', symbol: '€' },
  'Slovenia':               { code: 'EUR', symbol: '€' },
  'South Africa':           { code: 'ZAR', symbol: 'R' },
  'South Korea':            { code: 'KRW', symbol: '₩' },
  'Spain':                  { code: 'EUR', symbol: '€' },
  'Sri Lanka':              { code: 'LKR', symbol: 'Rs' },
  'Sweden':                 { code: 'SEK', symbol: 'kr' },
  'Switzerland':            { code: 'CHF', symbol: 'Fr' },
  'Syria':                  { code: 'SYP', symbol: '£' },
  'Taiwan':                 { code: 'TWD', symbol: 'NT$' },
  'Tanzania':               { code: 'TZS', symbol: 'TSh' },
  'Thailand':               { code: 'THB', symbol: '฿' },
  'Tunisia':                { code: 'TND', symbol: 'د.ت' },
  'Turkey':                 { code: 'TRY', symbol: '₺' },
  'Uganda':                 { code: 'UGX', symbol: 'USh' },
  'UK':                     { code: 'GBP', symbol: '£' },
  'United Kingdom':         { code: 'GBP', symbol: '£' },
  'Ukraine':                { code: 'UAH', symbol: '₴' },
  'United Arab Emirates':   { code: 'AED', symbol: 'AED' },
  'Uruguay':                { code: 'UYU', symbol: '$U' },
  'USA':                    { code: 'USD', symbol: '$' },
  'United States':          { code: 'USD', symbol: '$' },
  'Uzbekistan':             { code: 'UZS', symbol: 'soʻm' },
  'Venezuela':              { code: 'VES', symbol: 'Bs.' },
  'Vietnam':                { code: 'VND', symbol: '₫' },
  'Yemen':                  { code: 'YER', symbol: '﷼' },
  'Zambia':                 { code: 'ZMW', symbol: 'ZK' },
  'Zimbabwe':               { code: 'ZWL', symbol: 'Z$' },
};

const DEFAULT_CURRENCY = { code: 'USD', symbol: '$' };

function getCurrencyForCountry(country) {
  if (!country) return DEFAULT_CURRENCY;
  const exact = COUNTRY_CURRENCY[country];
  if (exact) return exact;
  const lc = country.toLowerCase();
  for (const [k, v] of Object.entries(COUNTRY_CURRENCY)) {
    if (k.toLowerCase() === lc) return v;
  }
  return DEFAULT_CURRENCY;
}

// Cache rates (USD base) for an hour
let ratesCache = { fetchedAt: 0, rates: null };
const RATES_TTL_MS = 60 * 60 * 1000;

async function getUsdRates() {
  if (ratesCache.rates && Date.now() - ratesCache.fetchedAt < RATES_TTL_MS) {
    return ratesCache.rates;
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      ratesCache = { fetchedAt: Date.now(), rates: data.rates };
      return data.rates;
    }
  } catch (err) {
    console.warn('⚠️  Exchange rate fetch failed:', err.message);
  }
  return ratesCache.rates || {};
}

async function convertFromUsd(amountUsd, currencyCode) {
  if (!currencyCode || currencyCode === 'USD') return amountUsd;
  const rates = await getUsdRates();
  const rate = rates[currencyCode];
  if (!rate) return amountUsd; // fallback to USD if no rate
  return amountUsd * rate;
}

async function convertToUsd(amount, currencyCode) {
  if (!currencyCode || currencyCode === 'USD') return amount;
  const rates = await getUsdRates();
  const rate = rates[currencyCode];
  if (!rate) return amount;
  return amount / rate;
}

module.exports = { getCurrencyForCountry, convertFromUsd, convertToUsd, getUsdRates };
