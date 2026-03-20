import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'krishimitra.db');

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await ensureDataDir();
      const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT DEFAULT (datetime('now')),
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          language TEXT,
          last_location_name TEXT,
          last_lat REAL,
          last_lon REAL
        );
      `);

      // Create tables if missing.
      // If tables already exist from previous versions, we will add missing columns via ALTER TABLE below.

      await db.exec(`
        CREATE TABLE IF NOT EXISTS recommendations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT DEFAULT (datetime('now')),
          moisture INTEGER NOT NULL,
          n INTEGER NOT NULL,
          p INTEGER NOT NULL,
          k INTEGER NOT NULL,
          stage TEXT NOT NULL,
          location TEXT,
          irrigation_text TEXT,
          fertilizer_text TEXT,
          rationale TEXT,
          progress INTEGER,
          weather_json TEXT
        );
      `);

      await db.exec(`
        CREATE TABLE IF NOT EXISTS sensor_readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT DEFAULT (datetime('now')),
          user_id INTEGER,
          crop TEXT NOT NULL,
          stage TEXT NOT NULL,
          moisture INTEGER NOT NULL,
          n INTEGER NOT NULL,
          p INTEGER NOT NULL,
          k INTEGER NOT NULL,
          ph REAL NOT NULL,
          location_name TEXT,
          lat REAL,
          lon REAL
        );
      `);

      await db.exec(`
        CREATE TABLE IF NOT EXISTS recommendation_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT DEFAULT (datetime('now')),
          user_id INTEGER,
          sensor_reading_id INTEGER NOT NULL,
          crop TEXT NOT NULL,
          stage TEXT NOT NULL,
          language TEXT,
          irrigation_when TEXT,
          irrigation_mm REAL,
          fertilizer_n_kg REAL,
          fertilizer_p_kg REAL,
          fertilizer_k_kg REAL,
          reasons_json TEXT,
          rationale TEXT,
          progress INTEGER,
          next_stage TEXT,
          weather_json TEXT,
          FOREIGN KEY(sensor_reading_id) REFERENCES sensor_readings(id)
        );
      `);

      // Migration: add user_id columns if they don't exist yet.
      // (CREATE TABLE IF NOT EXISTS won't add columns for an existing table.)
      await db.exec(`
        ALTER TABLE sensor_readings ADD COLUMN user_id INTEGER;
      `).catch(() => undefined);
      await db.exec(`
        ALTER TABLE recommendation_runs ADD COLUMN user_id INTEGER;
      `).catch(() => undefined);

      return db;
    })();
  }
  return dbPromise;
}

export type RecommendationRow = {
  id: number;
  created_at: string;
  moisture: number;
  n: number;
  p: number;
  k: number;
  stage: string;
  location: string | null;
  irrigation_text: string;
  fertilizer_text: string;
  rationale: string;
  progress: number;
  weather_json: string | null;
};

export type SensorReadingRow = {
  id: number;
  created_at: string;
  user_id: number | null;
  crop: string;
  stage: string;
  moisture: number;
  n: number;
  p: number;
  k: number;
  ph: number;
  location_name: string | null;
  lat: number | null;
  lon: number | null;
};

export type RecommendationRunRow = {
  id: number;
  created_at: string;
  user_id: number | null;
  sensor_reading_id: number;
  crop: string;
  stage: string;
  language: string | null;
  irrigation_when: string | null;
  irrigation_mm: number | null;
  fertilizer_n_kg: number | null;
  fertilizer_p_kg: number | null;
  fertilizer_k_kg: number | null;
  reasons_json: string | null;
  rationale: string | null;
  progress: number | null;
  next_stage: string | null;
  weather_json: string | null;
};

export async function saveRecommendation(input: {
  moisture: number;
  n: number;
  p: number;
  k: number;
  stage: string;
  location?: string;
}, outputs: {
  irrigationText: string;
  fertilizerText: string;
  rationale: string;
  progress: number;
  weather?: any;
}) {
  const db = await getDb();
  const result = await db.run(
    `
      INSERT INTO recommendations (
        moisture, n, p, k, stage, location,
        irrigation_text, fertilizer_text, rationale, progress, weather_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    input.moisture,
    input.n,
    input.p,
    input.k,
    input.stage,
    input.location ?? null,
    outputs.irrigationText,
    outputs.fertilizerText,
    outputs.rationale,
    outputs.progress,
    outputs.weather ? JSON.stringify(outputs.weather) : null,
  );
  return result.lastID as number;
}

export async function getRecommendationById(id: number): Promise<RecommendationRow | undefined> {
  const db = await getDb();
  const row = await db.get<RecommendationRow>('SELECT * FROM recommendations WHERE id = ?', id);
  return row ?? undefined;
}

export async function saveSensorReading(input: {
  userId: number;
  crop: string;
  stage: string;
  moisture: number;
  n: number;
  p: number;
  k: number;
  ph: number;
  locationName?: string;
  lat?: number;
  lon?: number;
}) {
  const db = await getDb();
  const result = await db.run(
    `
      INSERT INTO sensor_readings (
        user_id, crop, stage, moisture, n, p, k, ph, location_name, lat, lon
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    input.userId,
    input.crop,
    input.stage,
    input.moisture,
    input.n,
    input.p,
    input.k,
    input.ph,
    input.locationName ?? null,
    input.lat ?? null,
    input.lon ?? null,
  );
  return result.lastID as number;
}

export async function getLatestSensorReading(userId: number): Promise<SensorReadingRow | undefined> {
  const db = await getDb();
  const row = await db.get<SensorReadingRow>(
    `SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 1`,
    userId,
  );
  return row ?? undefined;
}

export async function getSensorHistory(userId: number, limit: number): Promise<SensorReadingRow[]> {
  const db = await getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 25);
  const rows = await db.all<SensorReadingRow>(
    `SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?`,
    userId,
    safeLimit,
  );
  return rows as unknown as SensorReadingRow[];
}

export async function saveRecommendationRun(input: {
  userId: number;
  sensorReadingId: number;
  crop: string;
  stage: string;
  language?: string;
  irrigationWhen?: string;
  irrigationMm?: number;
  fertilizerNKg?: number;
  fertilizerPKg?: number;
  fertilizerKKg?: number;
  reasons: string[];
  rationale?: string;
  progress?: number;
  nextStage?: string;
  weather?: any;
}) {
  const db = await getDb();
  const result = await db.run(
    `
      INSERT INTO recommendation_runs (
        user_id, sensor_reading_id, crop, stage, language,
        irrigation_when, irrigation_mm,
        fertilizer_n_kg, fertilizer_p_kg, fertilizer_k_kg,
        reasons_json,
        rationale, progress, next_stage,
        weather_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    input.userId,
    input.sensorReadingId,
    input.crop,
    input.stage,
    input.language ?? null,
    input.irrigationWhen ?? null,
    input.irrigationMm ?? null,
    input.fertilizerNKg ?? null,
    input.fertilizerPKg ?? null,
    input.fertilizerKKg ?? null,
    JSON.stringify(input.reasons),
    input.rationale ?? null,
    input.progress ?? null,
    input.nextStage ?? null,
    input.weather ? JSON.stringify(input.weather) : null,
  );
  return result.lastID as number;
}

export async function getRecommendationRunById(
  userId: number,
  id: number,
): Promise<RecommendationRunRow | undefined> {
  const db = await getDb();
  const row = await db.get<RecommendationRunRow>(
    `SELECT * FROM recommendation_runs WHERE id = ? AND user_id = ?`,
    id,
    userId,
  );
  return row ?? undefined;
}

export async function getSoilReportByRunId(userId: number, id: number): Promise<{
  run: RecommendationRunRow;
  sensor: SensorReadingRow;
}> {
  const db = await getDb();
  const rows = await db.all<any>(
    `
      SELECT
        rr.*,
        sr.id AS sensor_id,
        sr.created_at AS sensor_created_at,
        sr.crop AS sensor_crop,
        sr.stage AS sensor_stage,
        sr.moisture,
        sr.n,
        sr.p,
        sr.k,
        sr.ph,
        sr.location_name,
        sr.lat,
        sr.lon
      FROM recommendation_runs rr
      JOIN sensor_readings sr ON sr.id = rr.sensor_reading_id
      WHERE rr.id = ? AND rr.user_id = ? AND sr.user_id = ?
    `,
    id,
    userId,
    userId,
  );

  const row = rows[0];
  if (!row) {
    throw new Error('Not found');
  }

  const run: RecommendationRunRow = {
    id: row.id,
    created_at: row.created_at,
    user_id: row.user_id,
    sensor_reading_id: row.sensor_reading_id,
    crop: row.crop,
    stage: row.stage,
    language: row.language,
    irrigation_when: row.irrigation_when,
    irrigation_mm: row.irrigation_mm,
    fertilizer_n_kg: row.fertilizer_n_kg,
    fertilizer_p_kg: row.fertilizer_p_kg,
    fertilizer_k_kg: row.fertilizer_k_kg,
    reasons_json: row.reasons_json,
    rationale: row.rationale,
    progress: row.progress,
    next_stage: row.next_stage,
    weather_json: row.weather_json,
  };

  const sensor: SensorReadingRow = {
    id: row.sensor_id,
    created_at: row.sensor_created_at,
    user_id: row.user_id,
    crop: row.sensor_crop,
    stage: row.sensor_stage,
    moisture: row.moisture,
    n: row.n,
    p: row.p,
    k: row.k,
    ph: row.ph,
    location_name: row.location_name,
    lat: row.lat,
    lon: row.lon,
  };

  return { run, sensor };
}

export async function getAnalyticsSummary(userId: number) {
  const db = await getDb();
  const row = await db.get<any>(`
    SELECT
      COUNT(*) AS runs_count,
      COALESCE(SUM(irrigation_mm), 0) AS total_irrigation_mm,
      AVG(irrigation_mm) AS avg_irrigation_mm,
      COALESCE(SUM(fertilizer_n_kg), 0) AS total_fertilizer_n_kg,
      COALESCE(SUM(fertilizer_p_kg), 0) AS total_fertilizer_p_kg,
      COALESCE(SUM(fertilizer_k_kg), 0) AS total_fertilizer_k_kg
    FROM recommendation_runs
    WHERE user_id = ?
  `);

  return {
    runsCount: row.runs_count ?? 0,
    totalIrrigationMm: row.total_irrigation_mm ?? 0,
    avgIrrigationMm: row.avg_irrigation_mm ?? null,
    totalFertilizerNKg: row.total_fertilizer_n_kg ?? 0,
    totalFertilizerPKg: row.total_fertilizer_p_kg ?? 0,
    totalFertilizerKKg: row.total_fertilizer_k_kg ?? 0,
  };
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  const row = await db.get<any>(`SELECT * FROM users WHERE username = ?`, username);
  return row ?? null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  language?: string;
  lastLocationName?: string;
  lastLat?: number;
  lastLon?: number;
}) {
  const db = await getDb();
  const result = await db.run(
    `
      INSERT INTO users (
        username, password_hash, language,
        last_location_name, last_lat, last_lon
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    input.username,
    input.passwordHash,
    input.language ?? null,
    input.lastLocationName ?? null,
    input.lastLat ?? null,
    input.lastLon ?? null,
  );
  return result.lastID as number;
}

export async function getUserById(id: number) {
  const db = await getDb();
  const row = await db.get<any>(`SELECT id, username, language, last_location_name, last_lat, last_lon FROM users WHERE id = ?`, id);
  return row ?? null;
}

export async function updateUserProfile(userId: number, input: {
  language?: string;
  lastLocationName?: string;
  lastLat?: number;
  lastLon?: number;
}) {
  const db = await getDb();
  await db.run(
    `
      UPDATE users
      SET
        language = ?,
        last_location_name = ?,
        last_lat = ?,
        last_lon = ?
      WHERE id = ?
    `,
    input.language ?? null,
    input.lastLocationName ?? null,
    input.lastLat ?? null,
    input.lastLon ?? null,
    userId,
  );
}

