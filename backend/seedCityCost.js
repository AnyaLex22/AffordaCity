require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Country-level cost of living indexes (based on Numbeo/World Bank estimates)
// costOfLivingIndex: 0-100 (100 = most expensive, like NYC/Zurich)
// rentIndex: 0-100
// groceriesIndex: 0-100
// restaurantIndex: 0-100
const COUNTRY_INDEXES = {
  'Afghanistan':              { costOfLivingIndex: 18, rentIndex: 8,  groceriesIndex: 16, restaurantIndex: 12 },
  'Albania':                  { costOfLivingIndex: 35, rentIndex: 15, groceriesIndex: 32, restaurantIndex: 28 },
  'Algeria':                  { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 25, restaurantIndex: 20 },
  'Angola':                   { costOfLivingIndex: 42, rentIndex: 38, groceriesIndex: 40, restaurantIndex: 35 },
  'Argentina':                { costOfLivingIndex: 32, rentIndex: 14, groceriesIndex: 28, restaurantIndex: 25 },
  'Armenia':                  { costOfLivingIndex: 34, rentIndex: 18, groceriesIndex: 30, restaurantIndex: 28 },
  'Australia':                { costOfLivingIndex: 74, rentIndex: 62, groceriesIndex: 72, restaurantIndex: 70 },
  'Austria':                  { costOfLivingIndex: 72, rentIndex: 55, groceriesIndex: 68, restaurantIndex: 70 },
  'Azerbaijan':               { costOfLivingIndex: 36, rentIndex: 22, groceriesIndex: 32, restaurantIndex: 28 },
  'Bahrain':                  { costOfLivingIndex: 55, rentIndex: 48, groceriesIndex: 50, restaurantIndex: 52 },
  'Bangladesh':               { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 20, restaurantIndex: 15 },
  'Belarus':                  { costOfLivingIndex: 32, rentIndex: 18, groceriesIndex: 28, restaurantIndex: 24 },
  'Belgium':                  { costOfLivingIndex: 72, rentIndex: 52, groceriesIndex: 68, restaurantIndex: 70 },
  'Bolivia':                  { costOfLivingIndex: 28, rentIndex: 14, groceriesIndex: 25, restaurantIndex: 22 },
  'Bosnia and Herzegovina':   { costOfLivingIndex: 34, rentIndex: 16, groceriesIndex: 30, restaurantIndex: 26 },
  'Botswana':                 { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 35, restaurantIndex: 30 },
  'Brazil':                   { costOfLivingIndex: 40, rentIndex: 22, groceriesIndex: 35, restaurantIndex: 32 },
  'Bulgaria':                 { costOfLivingIndex: 38, rentIndex: 18, groceriesIndex: 34, restaurantIndex: 30 },
  'Cambodia':                 { costOfLivingIndex: 28, rentIndex: 18, groceriesIndex: 24, restaurantIndex: 20 },
  'Cameroon':                 { costOfLivingIndex: 30, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 22 },
  'Canada':                   { costOfLivingIndex: 72, rentIndex: 60, groceriesIndex: 68, restaurantIndex: 68 },
  'Chile':                    { costOfLivingIndex: 45, rentIndex: 28, groceriesIndex: 42, restaurantIndex: 38 },
  'China':                    { costOfLivingIndex: 48, rentIndex: 35, groceriesIndex: 42, restaurantIndex: 40 },
  'Colombia':                 { costOfLivingIndex: 32, rentIndex: 18, groceriesIndex: 28, restaurantIndex: 25 },
  'Costa Rica':               { costOfLivingIndex: 48, rentIndex: 30, groceriesIndex: 44, restaurantIndex: 40 },
  'Croatia':                  { costOfLivingIndex: 52, rentIndex: 32, groceriesIndex: 48, restaurantIndex: 45 },
  'Cuba':                     { costOfLivingIndex: 22, rentIndex: 8,  groceriesIndex: 20, restaurantIndex: 15 },
  'Cyprus':                   { costOfLivingIndex: 60, rentIndex: 42, groceriesIndex: 56, restaurantIndex: 55 },
  'Czech Republic':           { costOfLivingIndex: 52, rentIndex: 30, groceriesIndex: 48, restaurantIndex: 45 },
  'Denmark':                  { costOfLivingIndex: 88, rentIndex: 68, groceriesIndex: 82, restaurantIndex: 88 },
  'Dominican Republic':       { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 34, restaurantIndex: 30 },
  'Ecuador':                  { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 25 },
  'Egypt':                    { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 20, restaurantIndex: 15 },
  'El Salvador':              { costOfLivingIndex: 35, rentIndex: 18, groceriesIndex: 30, restaurantIndex: 28 },
  'Estonia':                  { costOfLivingIndex: 58, rentIndex: 38, groceriesIndex: 52, restaurantIndex: 52 },
  'Ethiopia':                 { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 20, restaurantIndex: 15 },
  'Finland':                  { costOfLivingIndex: 80, rentIndex: 60, groceriesIndex: 75, restaurantIndex: 80 },
  'France':                   { costOfLivingIndex: 75, rentIndex: 58, groceriesIndex: 70, restaurantIndex: 75 },
  'Georgia':                  { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 34, restaurantIndex: 30 },
  'Germany':                  { costOfLivingIndex: 72, rentIndex: 52, groceriesIndex: 66, restaurantIndex: 68 },
  'Ghana':                    { costOfLivingIndex: 32, rentIndex: 18, groceriesIndex: 28, restaurantIndex: 24 },
  'Greece':                   { costOfLivingIndex: 55, rentIndex: 32, groceriesIndex: 50, restaurantIndex: 50 },
  'Guatemala':                { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 25 },
  'Honduras':                 { costOfLivingIndex: 30, rentIndex: 14, groceriesIndex: 26, restaurantIndex: 22 },
  'Hong Kong':                { costOfLivingIndex: 80, rentIndex: 92, groceriesIndex: 72, restaurantIndex: 68 },
  'Hungary':                  { costOfLivingIndex: 48, rentIndex: 28, groceriesIndex: 44, restaurantIndex: 40 },
  'Iceland':                  { costOfLivingIndex: 90, rentIndex: 72, groceriesIndex: 88, restaurantIndex: 92 },
  'India':                    { costOfLivingIndex: 22, rentIndex: 12, groceriesIndex: 18, restaurantIndex: 16 },
  'Indonesia':                { costOfLivingIndex: 28, rentIndex: 18, groceriesIndex: 24, restaurantIndex: 20 },
  'Iran':                     { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 18, restaurantIndex: 14 },
  'Iraq':                     { costOfLivingIndex: 28, rentIndex: 14, groceriesIndex: 24, restaurantIndex: 20 },
  'Ireland':                  { costOfLivingIndex: 82, rentIndex: 72, groceriesIndex: 75, restaurantIndex: 80 },
  'Israel':                   { costOfLivingIndex: 78, rentIndex: 65, groceriesIndex: 72, restaurantIndex: 75 },
  'Italy':                    { costOfLivingIndex: 68, rentIndex: 48, groceriesIndex: 62, restaurantIndex: 65 },
  'Ivory Coast':              { costOfLivingIndex: 35, rentIndex: 22, groceriesIndex: 30, restaurantIndex: 28 },
  'Jamaica':                  { costOfLivingIndex: 42, rentIndex: 25, groceriesIndex: 38, restaurantIndex: 35 },
  'Japan':                    { costOfLivingIndex: 72, rentIndex: 52, groceriesIndex: 65, restaurantIndex: 68 },
  'Jordan':                   { costOfLivingIndex: 45, rentIndex: 28, groceriesIndex: 40, restaurantIndex: 38 },
  'Kazakhstan':               { costOfLivingIndex: 35, rentIndex: 22, groceriesIndex: 30, restaurantIndex: 28 },
  'Kenya':                    { costOfLivingIndex: 32, rentIndex: 18, groceriesIndex: 28, restaurantIndex: 24 },
  'Kuwait':                   { costOfLivingIndex: 52, rentIndex: 42, groceriesIndex: 48, restaurantIndex: 45 },
  'Kyrgyzstan':               { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 18, restaurantIndex: 15 },
  'Laos':                     { costOfLivingIndex: 25, rentIndex: 12, groceriesIndex: 22, restaurantIndex: 18 },
  'Latvia':                   { costOfLivingIndex: 52, rentIndex: 32, groceriesIndex: 48, restaurantIndex: 45 },
  'Lebanon':                  { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 34, restaurantIndex: 30 },
  'Libya':                    { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'Lithuania':                { costOfLivingIndex: 52, rentIndex: 30, groceriesIndex: 48, restaurantIndex: 44 },
  'Luxembourg':               { costOfLivingIndex: 90, rentIndex: 75, groceriesIndex: 82, restaurantIndex: 88 },
  'Macau':                    { costOfLivingIndex: 72, rentIndex: 82, groceriesIndex: 65, restaurantIndex: 60 },
  'Madagascar':               { costOfLivingIndex: 20, rentIndex: 8,  groceriesIndex: 18, restaurantIndex: 14 },
  'Malaysia':                 { costOfLivingIndex: 35, rentIndex: 22, groceriesIndex: 30, restaurantIndex: 28 },
  'Mali':                     { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 18 },
  'Malta':                    { costOfLivingIndex: 62, rentIndex: 42, groceriesIndex: 55, restaurantIndex: 58 },
  'Mexico':                   { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 32, restaurantIndex: 30 },
  'Moldova':                  { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'Mongolia':                 { costOfLivingIndex: 30, rentIndex: 16, groceriesIndex: 26, restaurantIndex: 22 },
  'Montenegro':               { costOfLivingIndex: 42, rentIndex: 22, groceriesIndex: 38, restaurantIndex: 35 },
  'Morocco':                  { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 25 },
  'Mozambique':               { costOfLivingIndex: 28, rentIndex: 14, groceriesIndex: 24, restaurantIndex: 20 },
  'Myanmar':                  { costOfLivingIndex: 22, rentIndex: 12, groceriesIndex: 18, restaurantIndex: 15 },
  'Namibia':                  { costOfLivingIndex: 40, rentIndex: 22, groceriesIndex: 36, restaurantIndex: 32 },
  'Nepal':                    { costOfLivingIndex: 22, rentIndex: 10, groceriesIndex: 18, restaurantIndex: 14 },
  'Netherlands':              { costOfLivingIndex: 78, rentIndex: 65, groceriesIndex: 72, restaurantIndex: 75 },
  'New Zealand':              { costOfLivingIndex: 72, rentIndex: 60, groceriesIndex: 68, restaurantIndex: 68 },
  'Nicaragua':                { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'Nigeria':                  { costOfLivingIndex: 30, rentIndex: 16, groceriesIndex: 26, restaurantIndex: 22 },
  'North Korea':              { costOfLivingIndex: 15, rentIndex: 5,  groceriesIndex: 12, restaurantIndex: 10 },
  'Norway':                   { costOfLivingIndex: 92, rentIndex: 72, groceriesIndex: 88, restaurantIndex: 95 },
  'Oman':                     { costOfLivingIndex: 48, rentIndex: 32, groceriesIndex: 44, restaurantIndex: 40 },
  'Pakistan':                 { costOfLivingIndex: 20, rentIndex: 8,  groceriesIndex: 17, restaurantIndex: 13 },
  'Panama':                   { costOfLivingIndex: 45, rentIndex: 28, groceriesIndex: 40, restaurantIndex: 38 },
  'Paraguay':                 { costOfLivingIndex: 30, rentIndex: 14, groceriesIndex: 26, restaurantIndex: 22 },
  'Peru':                     { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 25 },
  'Philippines':              { costOfLivingIndex: 30, rentIndex: 18, groceriesIndex: 26, restaurantIndex: 22 },
  'Poland':                   { costOfLivingIndex: 50, rentIndex: 30, groceriesIndex: 45, restaurantIndex: 42 },
  'Portugal':                 { costOfLivingIndex: 58, rentIndex: 38, groceriesIndex: 52, restaurantIndex: 52 },
  'Puerto Rico':              { costOfLivingIndex: 58, rentIndex: 38, groceriesIndex: 52, restaurantIndex: 50 },
  'Qatar':                    { costOfLivingIndex: 58, rentIndex: 55, groceriesIndex: 52, restaurantIndex: 50 },
  'Romania':                  { costOfLivingIndex: 42, rentIndex: 22, groceriesIndex: 38, restaurantIndex: 34 },
  'Russia':                   { costOfLivingIndex: 40, rentIndex: 22, groceriesIndex: 36, restaurantIndex: 32 },
  'Rwanda':                   { costOfLivingIndex: 35, rentIndex: 18, groceriesIndex: 30, restaurantIndex: 25 },
  'Saudi Arabia':             { costOfLivingIndex: 50, rentIndex: 38, groceriesIndex: 45, restaurantIndex: 42 },
  'Senegal':                  { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 24 },
  'Serbia':                   { costOfLivingIndex: 38, rentIndex: 18, groceriesIndex: 34, restaurantIndex: 30 },
  'Singapore':                { costOfLivingIndex: 82, rentIndex: 80, groceriesIndex: 72, restaurantIndex: 68 },
  'Slovakia':                 { costOfLivingIndex: 50, rentIndex: 28, groceriesIndex: 45, restaurantIndex: 42 },
  'Slovenia':                 { costOfLivingIndex: 58, rentIndex: 35, groceriesIndex: 52, restaurantIndex: 52 },
  'Somalia':                  { costOfLivingIndex: 20, rentIndex: 8,  groceriesIndex: 18, restaurantIndex: 12 },
  'South Africa':             { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 34, restaurantIndex: 30 },
  'South Korea':              { costOfLivingIndex: 68, rentIndex: 50, groceriesIndex: 60, restaurantIndex: 62 },
  'Spain':                    { costOfLivingIndex: 62, rentIndex: 42, restaurantIndex: 58, groceriesIndex: 55 },
  'Sri Lanka':                { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'Sudan':                    { costOfLivingIndex: 22, rentIndex: 8,  groceriesIndex: 18, restaurantIndex: 14 },
  'Sweden':                   { costOfLivingIndex: 82, rentIndex: 62, groceriesIndex: 75, restaurantIndex: 82 },
  'Switzerland':              { costOfLivingIndex: 98, rentIndex: 85, groceriesIndex: 95, restaurantIndex: 98 },
  'Syria':                    { costOfLivingIndex: 18, rentIndex: 6,  groceriesIndex: 15, restaurantIndex: 12 },
  'Taiwan':                   { costOfLivingIndex: 60, rentIndex: 42, groceriesIndex: 52, restaurantIndex: 55 },
  'Tanzania':                 { costOfLivingIndex: 28, rentIndex: 14, groceriesIndex: 24, restaurantIndex: 20 },
  'Thailand':                 { costOfLivingIndex: 38, rentIndex: 22, groceriesIndex: 32, restaurantIndex: 28 },
  'Trinidad and Tobago':      { costOfLivingIndex: 48, rentIndex: 28, groceriesIndex: 42, restaurantIndex: 40 },
  'Tunisia':                  { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'Turkey':                   { costOfLivingIndex: 35, rentIndex: 18, groceriesIndex: 30, restaurantIndex: 28 },
  'Turkmenistan':             { costOfLivingIndex: 25, rentIndex: 10, groceriesIndex: 20, restaurantIndex: 16 },
  'Uganda':                   { costOfLivingIndex: 28, rentIndex: 14, groceriesIndex: 24, restaurantIndex: 18 },
  'Ukraine':                  { costOfLivingIndex: 28, rentIndex: 12, groceriesIndex: 24, restaurantIndex: 20 },
  'United Arab Emirates':     { costOfLivingIndex: 62, rentIndex: 60, groceriesIndex: 55, restaurantIndex: 52 },
  'United Kingdom':           { costOfLivingIndex: 78, rentIndex: 65, groceriesIndex: 70, restaurantIndex: 75 },
  'United States':            { costOfLivingIndex: 78, rentIndex: 65, groceriesIndex: 72, restaurantIndex: 72 },
  'Uruguay':                  { costOfLivingIndex: 52, rentIndex: 28, groceriesIndex: 48, restaurantIndex: 45 },
  'Uzbekistan':               { costOfLivingIndex: 22, rentIndex: 8,  groceriesIndex: 18, restaurantIndex: 14 },
  'Venezuela':                { costOfLivingIndex: 18, rentIndex: 8,  groceriesIndex: 15, restaurantIndex: 12 },
  'Vietnam':                  { costOfLivingIndex: 28, rentIndex: 16, groceriesIndex: 24, restaurantIndex: 20 },
  'Yemen':                    { costOfLivingIndex: 18, rentIndex: 6,  groceriesIndex: 15, restaurantIndex: 10 },
  'Zambia':                   { costOfLivingIndex: 32, rentIndex: 16, groceriesIndex: 28, restaurantIndex: 24 },
  'Zimbabwe':                 { costOfLivingIndex: 30, rentIndex: 14, groceriesIndex: 26, restaurantIndex: 20 },
};

const DEFAULT_INDEXES = { costOfLivingIndex: 40, rentIndex: 20, groceriesIndex: 35, restaurantIndex: 30 };

const CityCostSchema = new mongoose.Schema({
  city:               { type: String, required: true },
  country:            { type: String, required: true },
  costOfLivingIndex:  Number,
  rentIndex:          Number,
  groceriesIndex:     Number,
  restaurantIndex:    Number,
  lastUpdated:        { type: Date, default: Date.now }
});

const CityCost = mongoose.model('CityCost', CityCostSchema);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  console.log('🌍 Fetching countries and cities from countriesnow.space...');
  const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
  const allCountries = response.data.data;

  console.log(`📦 Got ${allCountries.length} countries. Building city records...`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const countryData of allCountries) {
    const country = countryData.country;
    const cities = countryData.cities;
    const indexes = COUNTRY_INDEXES[country] || DEFAULT_INDEXES;

    const docs = cities.map(city => ({
      city,
      country,
      ...indexes,
      lastUpdated: new Date()
    }));

    // Use ordered:false to skip duplicates without stopping
    try {
      const result = await CityCost.insertMany(docs, { ordered: false });
      totalInserted += result.length;
    } catch (err) {
      // Some duplicates will throw — count inserted ones
      if (err.insertedDocs) {
        totalInserted += err.insertedDocs.length;
      }
      totalSkipped++;
    }

    process.stdout.write(`\r✍️  Processed: ${totalInserted} cities inserted...`);
  }

  console.log(`\n✅ Seeding complete! ${totalInserted} cities inserted, ${totalSkipped} batches had duplicates skipped.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});