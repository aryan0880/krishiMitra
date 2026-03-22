import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/genai';
import {
  getAnalyticsSummary,
  getLatestSensorReading,
  getRecommendationById,
  getRecommendationRunById,
  getSensorHistory,
  getSoilReportByRunId,
  saveRecommendation,
  saveRecommendationRun,
  saveSensorReading,
} from './db';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Hardcoded for now until auth is restored/added
const DEFAULT_USER_ID = 1;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'dist')));

const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);

type Stage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Harvest';
type UiLanguage = 'English' | 'Hindi' | 'Marathi';

type RecommendationRequest = {
  moisture: number;
  nutrients: { n: number; p: number; k: number };
  stage: Stage;
  crop?: string;
  ph?: number;
  location?: { lat: number; lon: number; name?: string };
  language?: UiLanguage;
};

type WeatherSummary = {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecastSummary: string;
};

type RecommendationResponse = {
  id: number;
  irrigationText: string;
  fertilizerText: string;
  rationale: string;
  progress: number;
  weather: WeatherSummary;
};

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const LANGS: UiLanguage[] = ['English', 'Hindi', 'Marathi'];

function normalizeLanguage(value: unknown): UiLanguage {
  return LANGS.includes(value as UiLanguage) ? (value as UiLanguage) : 'English';
}

async function fetchWeather(lat: number | undefined, lon: number | undefined, language: UiLanguage): Promise<WeatherSummary> {
  // Default coordinates (e.g., Pune, India) if none provided
  const latitude = lat ?? 18.5204;
  const longitude = lon ?? 73.8567;

  const base =
    (process.env.WEATHER_API_BASE && process.env.WEATHER_API_BASE.trim() !== '') ?
    process.env.WEATHER_API_BASE :
    'https://api.open-meteo.com/v1/forecast';

  const url = new URL(base);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,wind_speed_10m');
  url.searchParams.set('current_weather', 'true');

  try {
    // Node 18+ provides global `fetch`
    const resp = await fetch(url.toString());
    const data: any = await resp.json();

    const temperature = data.current_weather?.temperature ?? 28;
    const windSpeed = data.current_weather?.windspeed ?? 10;
    const humidity =
      data.hourly?.relative_humidity_2m?.[0] ??
      60;

    const conditionByLang: Record<UiLanguage, string> = {
      English: 'Field conditions',
      Hindi: 'मैदान की स्थिति',
      Marathi: 'शेतीतील परिस्थिती',
    };

    const forecastByLang: Record<UiLanguage, string> = {
      English: 'Based on local temperature, humidity and wind. ',
      Hindi: 'स्थानीय तापमान, आर्द्रता और हवा की स्थिति के आधार पर। ',
      Marathi: 'स्थानिक तापमान, आर्द्रता आणि वाऱ्याच्या स्थितीनुसार। ',
    };

    const condition = conditionByLang[language];
    const forecastSummary = forecastByLang[language];

    return {
      temperature,
      windSpeed,
      humidity,
      condition,
      forecastSummary,
    };
  } catch {
    const conditionByLang: Record<UiLanguage, string> = {
      English: 'Stable',
      Hindi: 'स्थिर',
      Marathi: 'स्थिर',
    };

    const forecastByLang: Record<UiLanguage, string> = {
      English: 'Using default weather profile.',
      Hindi: 'डिफ़ॉल्ट मौसम प्रोफाइल का उपयोग किया गया।',
      Marathi: 'डिफॉल्ट हवामान प्रोफाइल वापरले.',
    };

    return {
      temperature: 28,
      windSpeed: 8,
      humidity: 60,
      condition: conditionByLang[language],
      forecastSummary: forecastByLang[language],
    };
  }
}

function deriveRecommendations(
  input: RecommendationRequest,
  weather: WeatherSummary,
  language: UiLanguage,
) {
  const { moisture, nutrients, stage } = input;
  const crop = input.crop ?? 'Maize';

  const cropMult = (() => {
    const c = crop.toLowerCase();
    if (c.includes('wheat')) return 0.9;
    if (c.includes('rice')) return 1.1;
    if (c.includes('cotton')) return 1.0;
    return 1.0; // maize + default
  })();

  // Stage targets (simple rule-based model)
  const stageCfg = (() => {
    switch (stage) {
      case 'Seedling':
        return { moistureTarget: 60, nTarget: 45, pTarget: 35, kTarget: 30, baseN: 15, baseP: 10, baseK: 10, progress: 15 };
      case 'Vegetative':
        return { moistureTarget: 55, nTarget: 55, pTarget: 45, kTarget: 40, baseN: 25, baseP: 15, baseK: 18, progress: 45 };
      case 'Flowering':
        return { moistureTarget: 50, nTarget: 50, pTarget: 55, kTarget: 45, baseN: 20, baseP: 25, baseK: 18, progress: 75 };
      case 'Harvest':
        return { moistureTarget: 45, nTarget: 35, pTarget: 40, kTarget: 50, baseN: 10, baseP: 12, baseK: 25, progress: 95 };
      default:
        return { moistureTarget: 55, nTarget: 55, pTarget: 45, kTarget: 40, baseN: 25, baseP: 15, baseK: 18, progress: 45 };
    }
  })();

  const nextStage = getNextStage(stage);

  // Irrigation timing + mm
  const deficit = stageCfg.moistureTarget - moisture;
  const tempFactor = 1 + (weather.temperature - 25) / 40 * 0.15;
  const windFactor = 1 + (weather.windSpeed / 20) * 0.1;
  const humidityFactor = weather.humidity < 40 ? 1.05 : 1.0;
  const weatherFactor = Math.min(1.45, Math.max(0.85, tempFactor * windFactor * humidityFactor));

  let irrigationWhen: string = 'Skip';
  let irrigationMm = 0;
  if (deficit > 0) {
    if (deficit >= 10) {
      irrigationWhen = 'Now';
      irrigationMm = deficit * 0.55 * weatherFactor;
    } else {
      irrigationWhen = 'Within24h';
      irrigationMm = deficit * 0.35 * weatherFactor;
    }
  }
  irrigationMm = Math.max(0, Math.round(irrigationMm));

  // Fertilizer dosage (kg per acre)
  const nDef = Math.max(0, stageCfg.nTarget - nutrients.n);
  const pDef = Math.max(0, stageCfg.pTarget - nutrients.p);
  const kDef = Math.max(0, stageCfg.kTarget - nutrients.k);

  const nRatio = stageCfg.nTarget > 0 ? Math.min(1, nDef / stageCfg.nTarget) : 0;
  const pRatio = stageCfg.pTarget > 0 ? Math.min(1, pDef / stageCfg.pTarget) : 0;
  const kRatio = stageCfg.kTarget > 0 ? Math.min(1, kDef / stageCfg.kTarget) : 0;

  let fertilizerNKg = Math.round(stageCfg.baseN * nRatio * cropMult);
  let fertilizerPKg = Math.round(stageCfg.baseP * pRatio * cropMult);
  let fertilizerKKg = Math.round(stageCfg.baseK * kRatio * cropMult);

  fertilizerNKg = Math.max(0, fertilizerNKg);
  fertilizerPKg = Math.max(0, fertilizerPKg);
  fertilizerKKg = Math.max(0, fertilizerKKg);

  // Reasons (localized)
  const reasons: string[] = [];
  if (irrigationMm > 0) {
    if (language === 'English') {
      reasons.push(`Moisture risk: low soil moisture. Irrigation planned: ${irrigationWhen} (~${irrigationMm} mm).`);
    } else if (language === 'Hindi') {
      reasons.push(`नमी का जोखिम: मिट्टी की नमी कम है। सिंचाई की योजना: ${irrigationWhen === 'Now' ? 'आज' : '24 घंटों के भीतर'} (~${irrigationMm} मिमी)।`);
    } else {
      reasons.push(`ओलावा धोका: मातीतील ओलावा कमी आहे. सिंचन योजना: ${irrigationWhen === 'Now' ? 'आज' : '24 तासांच्या आत'} (~${irrigationMm} मिमी).`);
    }
  } else {
    reasons.push(
      language === 'English'
        ? `Moisture is near target (${moisture}%). Avoid heavy irrigation today.`
        : language === 'Hindi'
          ? `नमी लक्ष्य के करीब है (${moisture}%). आज अधिक सिंचाई न करें।`
          : `ओलावा लक्ष्याजवळ आहे (${moisture}%). आज जास्त सिंचन टाळा.`,
    );
  }

  if (fertilizerNKg > 0 || fertilizerPKg > 0 || fertilizerKKg > 0) {
    const parts: string[] = [];
    if (fertilizerNKg > 0) parts.push(`N: ${fertilizerNKg}kg`);
    if (fertilizerPKg > 0) parts.push(`P: ${fertilizerPKg}kg`);
    if (fertilizerKKg > 0) parts.push(`K: ${fertilizerKKg}kg`);

    if (language === 'English') {
      reasons.push(`Nutrient adjustment based on stage targets (${parts.join(', ')} per acre).`);
    } else if (language === 'Hindi') {
      reasons.push(`फसल चरण के अनुसार पोषक समायोजन: ${parts.join(', ')} प्रति एकड़।`);
    } else {
      reasons.push(`पिकाच्या टप्प्यानुसार पोषक समायोजन: ${parts.join(', ')} प्रति एकर.`);
    }
  }

  if (typeof input.ph === 'number') {
    const ph = input.ph;
    if (ph < 5.5) {
      reasons.push(
        language === 'English'
          ? `pH is acidic (${ph.toFixed(1)}). Liming may improve nutrient availability.`
          : language === 'Hindi'
            ? `pH अम्लीय है (${ph.toFixed(1)}). चूना देने से पोषक उपलब्धता बेहतर हो सकती है।`
            : `pH आम्लीय आहे (${ph.toFixed(1)}). चुनखडीने पोषक उपलब्धता सुधारू शकते.`,
      );
    } else if (ph > 7.5) {
      reasons.push(
        language === 'English'
          ? `pH is alkaline (${ph.toFixed(1)}). Check micronutrient availability.`
          : language === 'Hindi'
            ? `pH क्षारीय है (${ph.toFixed(1)}). सूक्ष्म पोषक की उपलब्धता जांचें।`
            : `pH क्षारीय आहे (${ph.toFixed(1)}). सूक्ष्म पोषकांची उपलब्धता तपासा.`,
      );
    } else {
      reasons.push(
        language === 'English'
          ? `pH is near optimal (${ph.toFixed(1)}). Nutrient uptake should remain steady.`
          : language === 'Hindi'
            ? `pH लगभग इष्टतम है (${ph.toFixed(1)}). पोषक ग्रहण स्थिर रहना चाहिए।`
            : `pH इष्टतम जवळ आहे (${ph.toFixed(1)}). पोषक ग्रहण स्थिर राहील.`,
      );
    }
  }

  reasons.push(
    language === 'English'
      ? `Weather context: ${weather.temperature}°C and wind ${weather.windSpeed} km/h can increase evapotranspiration.`
      : language === 'Hindi'
        ? `मौसम: तापमान ${weather.temperature}°C और हवा ${weather.windSpeed} किमी/घं बाष्पोत्सर्जन बढ़ा सकते हैं।`
        : `हवामान: तापमान ${weather.temperature}°C आणि वारा ${weather.windSpeed} किमी/ता बाष्पीभवन वाढवू शकतो.`,
  );

  // Rationale paragraph (short explainable summary)
  let rationale: string;
  if (language === 'English') {
    rationale = [
      `Soil moisture is ${moisture}% for the ${stage} stage (target ${stageCfg.moistureTarget}%). With ${weather.temperature}°C and ${weather.windSpeed} km/h wind, evapotranspiration risk is adjusted.`,
      irrigationMm > 0
        ? `Recommendation: ${irrigationWhen === 'Now' ? 'irrigate today' : 'irrigate within 24 hours'} with ~${irrigationMm} mm water.`
        : 'Recommendation: skip heavy irrigation today.',
      `Fertilizer dosage is stage-target based: N=${fertilizerNKg}kg, P=${fertilizerPKg}kg, K=${fertilizerKKg}kg per acre.`,
    ].join(' ');
  } else if (language === 'Hindi') {
    rationale = [
      `मिट्टी की नमी ${moisture}% है (${stage} चरण, लक्ष्य ${stageCfg.moistureTarget}%). तापमान ${weather.temperature}°C और हवा ${weather.windSpeed} किमी/घं के साथ बाष्पोत्सर्जन जोखिम समायोजित किया गया है।`,
      irrigationMm > 0
        ? `सिफारिश: ${irrigationWhen === 'Now' ? 'आज सिंचाई' : '24 घंटों के भीतर सिंचाई'} ~${irrigationMm} मिमी।`
        : 'सिफारिश: आज भारी सिंचाई न करें।',
      `उर्वरक मात्रा चरण-लक्ष्य आधारित है: N=${fertilizerNKg}kg, P=${fertilizerPKg}kg, K=${fertilizerKKg}kg प्रति एकड़।`,
    ].join(' ');
  } else {
    rationale = [
      `मातीतील ओलावा ${moisture}% आहे (टप्पा: ${stage}, लक्ष्य: ${stageCfg.moistureTarget}%). तापमान ${weather.temperature}°C आणि वारा ${weather.windSpeed} किमी/ता असल्याने बाष्पीभवन धोका समायोजित केला आहे.`,
      irrigationMm > 0
        ? `शिफारस: ${irrigationWhen === 'Now' ? 'आज सिंचन' : '24 तासांच्या आत सिंचन'} ~${irrigationMm} मिमी पाणी.`
        : 'शिफारस: आज जास्त सिंचन टाळा.',
      `खत मात्रा टप्पा-लक्ष्य आधारित आहे: N=${fertilizerNKg}kg, P=${fertilizerPKg}kg, K=${fertilizerKKg}kg प्रति एकर।`,
    ].join(' ');
  }

  // UI text strings
  const irrigationText =
    language === 'English'
      ? irrigationMm > 0
        ? `Irrigate ${irrigationWhen === 'Now' ? 'today' : 'within 24 hours'} with ~${irrigationMm} mm water.`
        : 'No irrigation needed today.'
      : language === 'Hindi'
        ? irrigationMm > 0
          ? `~${irrigationMm} मिमी पानी के साथ ${irrigationWhen === 'Now' ? 'आज' : '24 घंटों के भीतर'} सिंचाई करें।`
          : 'आज पानी देने की आवश्यकता नहीं है।'
        : irrigationMm > 0
          ? `~${irrigationMm} मिमी पाण्यासह ${irrigationWhen === 'Now' ? 'आज' : '24 तासांच्या आत'} सिंचन करा.`
          : 'आज सिंचनाची गरज नाही.';

  const fertilizerText =
    fertilizerNKg === 0 && fertilizerPKg === 0 && fertilizerKKg === 0
      ? language === 'English'
        ? 'Nutrients are within a safe range.'
        : language === 'Hindi'
          ? 'पोषक तत्व सुरक्षित सीमा में हैं।'
          : 'पोषक घटक सुरक्षित मर्यादेत आहेत.'
      : language === 'English'
        ? `Apply per acre: N ${fertilizerNKg}kg, P ${fertilizerPKg}kg, K ${fertilizerKKg}kg.`
        : language === 'Hindi'
          ? `प्रति एकड़ डालें: N ${fertilizerNKg}kg, P ${fertilizerPKg}kg, K ${fertilizerKKg}kg.`
          : `प्रति एकर द्या: N ${fertilizerNKg}kg, P ${fertilizerPKg}kg, K ${fertilizerKKg}kg.`;

  return {
    irrigationText,
    fertilizerText,
    rationale,
    progress: stageCfg.progress,
    nextStage,
    irrigationWhen,
    irrigationMm,
    fertilizerNKg,
    fertilizerPKg,
    fertilizerKKg,
    reasons,
  };
}

function getNextStage(stage: Stage): Stage {
  switch (stage) {
    case 'Seedling':
      return 'Vegetative';
    case 'Vegetative':
      return 'Flowering';
    case 'Flowering':
      return 'Harvest';
    case 'Harvest':
      return 'Harvest';
    default:
      return 'Vegetative';
  }
}

app.get('/api/weather', async (req, res) => {
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lon = req.query.lon ? Number(req.query.lon) : undefined;

  const language = normalizeLanguage(req.query.lang);
  const weather = await fetchWeather(lat, lon, language);
  res.json(weather);
});

async function generateGeminiRecommendation(
  input: RecommendationRequest,
  weather: WeatherSummary,
  language: UiLanguage,
): Promise<Partial<RecommendationData> | null> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return null;
  }

  try {
    const prompt = `
      You are an expert agronomist for KrishiMitra. Provide farming recommendations based on:
      Crop: ${input.crop}
      Stage: ${input.stage}
      Soil Moisture: ${input.moisture}%
      Nutrients: N=${input.nutrients.n}, P=${input.nutrients.p}, K=${input.nutrients.k}
      Soil pH: ${input.ph}
      Weather: ${weather.temperature}°C, ${weather.condition}, Humidity ${weather.humidity}%, Wind ${weather.windSpeed}km/h.
      Forecast: ${weather.forecastSummary}
      
      Language: ${language}
      
      Return ONLY a JSON object with these fields:
      - irrigationText (short instruction for irrigation)
      - fertilizerText (short instruction for fertilizer)
      - rationale (detailed explanation in ${language})
      - reasons (array of 3-4 specific bullet points in ${language})
      - irrigationMm (number, estimated water needed in mm)
      - fertilizerNKg (number, kg N per acre)
      - fertilizerPKg (number, kg P per acre)
      - fertilizerKKg (number, kg K per acre)
      - nextStage (string, the expected next growth stage)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

app.post('/api/recommendations', async (req, res) => {
  console.log('Received recommendation request:', req.body);
  try {
    const body: RecommendationRequest = req.body;
    const language = normalizeLanguage(body.language);

    if (
      typeof body.moisture !== 'number' ||
      !body.nutrients ||
      typeof body.nutrients.n !== 'number' ||
      typeof body.nutrients.p !== 'number' ||
      typeof body.nutrients.k !== 'number' ||
      !body.stage ||
      typeof body.crop !== 'string' ||
      typeof body.ph !== 'number'
    ) {
      console.log('Invalid request body:', body);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const sensorReadingId = await saveSensorReading({
      userId: DEFAULT_USER_ID,
      crop: body.crop,
      stage: body.stage,
      moisture: body.moisture,
      n: body.nutrients.n,
      p: body.nutrients.p,
      k: body.nutrients.k,
      ph: body.ph,
      locationName: body.location?.name,
      lat: body.location?.lat,
      lon: body.location?.lon,
    });

    const weather = await fetchWeather(body.location?.lat, body.location?.lon, language);

    // Try Gemini first, fallback to rule-based
    const geminiRec = await generateGeminiRecommendation(body, weather, language);
    const derived = deriveRecommendations(body, weather, language);

    const irrigationWhen = geminiRec?.irrigationWhen || derived.irrigationWhen;
    const irrigationMm = geminiRec?.irrigationMm ?? derived.irrigationMm;
    const fertilizerNKgN = geminiRec?.fertilizerNKg ?? derived.fertilizerNKg;
    const fertilizerPKgP = geminiRec?.fertilizerPKg ?? derived.fertilizerPKg;
    const fertilizerKKgK = geminiRec?.fertilizerKKg ?? derived.fertilizerKKg;
    const reasons = geminiRec?.reasons || derived.reasons;
    const nextStage = geminiRec?.nextStage || derived.nextStage;
    const rationale = geminiRec?.rationale || derived.rationale;
    const irrigationText = geminiRec?.irrigationText || derived.irrigationText;
    const fertilizerText = geminiRec?.fertilizerText || derived.fertilizerText;

    const runId = await saveRecommendationRun({
      userId: DEFAULT_USER_ID,
      sensorReadingId,
      crop: body.crop,
      stage: body.stage,
      language,
      irrigationWhen,
      irrigationMm,
      fertilizerNKg: fertilizerNKgN,
      fertilizerPKg: fertilizerPKgP,
      fertilizerKKg: fertilizerKKgK,
      reasons,
      rationale,
      progress: derived.progress,
      nextStage,
      weather,
    });

    res.json({
      id: runId,
      irrigationText,
      fertilizerText,
      rationale,
      progress: derived.progress,
      nextStage,
      reasons,
      irrigationMm,
      fertilizerNKg: fertilizerNKgN,
      fertilizerPKg: fertilizerPKgP,
      fertilizerKKg: fertilizerKKgK,
      weather,
    });
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/soil-report/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const report = await getSoilReportByRunId(DEFAULT_USER_ID, id).catch(() => null);
  if (!report) {
    return res.status(404).json({ error: 'Not found' });
  }

  let weather: WeatherSummary | null = null;
  if (report.run.weather_json) {
    try {
      weather = JSON.parse(report.run.weather_json) as WeatherSummary;
    } catch {
      weather = null;
    }
  }

  let reasons: string[] = [];
  if (report.run.reasons_json) {
    try {
      reasons = JSON.parse(report.run.reasons_json) as string[];
    } catch {
      reasons = [];
    }
  }

  res.json({
    runId: report.run.id,
    createdAt: report.run.created_at,
    sensor: {
      sensorReadingId: report.sensor.id,
      createdAt: report.sensor.created_at,
      crop: report.sensor.crop,
      stage: report.sensor.stage,
      moisture: report.sensor.moisture,
      n: report.sensor.n,
      p: report.sensor.p,
      k: report.sensor.k,
      ph: report.sensor.ph,
      locationName: report.sensor.location_name,
      lat: report.sensor.lat,
      lon: report.sensor.lon,
    },
    recommendation: {
      irrigationWhen: report.run.irrigation_when,
      irrigationMm: report.run.irrigation_mm,
      fertilizerNKg: report.run.fertilizer_n_kg,
      fertilizerPKg: report.run.fertilizer_p_kg,
      fertilizerKKg: report.run.fertilizer_k_kg,
      reasons,
      rationale: report.run.rationale,
      progress: report.run.progress,
      nextStage: report.run.next_stage,
    },
    weather,
  });
});

app.get('/api/sensors/latest', async (_req, res) => {
  const row = await getLatestSensorReading(DEFAULT_USER_ID);
  if (!row) return res.json(null);
  res.json(row);
});

app.get('/api/sensors/history', async (req, res) => {
  const limit = Number(req.query.limit || 5);
  const rows = await getSensorHistory(DEFAULT_USER_ID, Number.isFinite(limit) ? limit : 5);
  res.json(rows);
});

app.get('/api/analytics/summary', async (_req, res) => {
  const summary = await getAnalyticsSummary(DEFAULT_USER_ID);
  res.json(summary);
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on port ${PORT}`);
});
