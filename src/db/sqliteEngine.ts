import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

let dbInstance: Database | null = null;
const dataDir = path.join(process.cwd(), "src", "data");
const dbFilePath = path.join(dataDir, "cms.sqlite");

/**
 * Initializes the SQLite database using sql.js in Node.js
 */
export async function getSqlDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const wasmPath = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  let sqlJsConfig: any = {};
  if (fs.existsSync(wasmPath)) {
    try {
      sqlJsConfig.wasmBinary = fs.readFileSync(wasmPath);
    } catch (e) {
      sqlJsConfig.locateFile = () => wasmPath;
    }
  }
  const SQL = await initSqlJs(sqlJsConfig);

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn("Could not read existing cms.sqlite file, creating fresh database instance.");
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize SQLite schema
  initTables(dbInstance);
  saveDatabaseToFile(dbInstance);

  return dbInstance;
}

function initTables(db: Database) {
  // Main CMS configuration table in SQL
  db.run(`
    CREATE TABLE IF NOT EXISTS cms_config (
      id TEXT PRIMARY KEY,
      json_data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Founders relational SQL table
  db.run(`
    CREATE TABLE IF NOT EXISTS founders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      active INTEGER DEFAULT 1,
      position INTEGER DEFAULT 0
    );
  `);

  // Testimonials relational SQL table
  db.run(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      text TEXT NOT NULL,
      image_url TEXT,
      stars INTEGER DEFAULT 5,
      active INTEGER DEFAULT 1,
      position INTEGER DEFAULT 0
    );
  `);

  // Footer relational SQL table
  db.run(`
    CREATE TABLE IF NOT EXISTS footer_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      year TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      designers_json TEXT NOT NULL
    );
  `);

  // QR Codes relational SQL table
  db.run(`
    CREATE TABLE IF NOT EXISTS qrs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      sinpe_number TEXT,
      holder TEXT,
      qr_image_url TEXT,
      active INTEGER DEFAULT 1
    );
  `);

  // Deployment history SQL table
  db.run(`
    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      commit_message TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      saved_to_cms INTEGER DEFAULT 1,
      cms_saved_at TEXT NOT NULL,
      deploy_status TEXT NOT NULL,
      deployed_at TEXT NOT NULL,
      provider TEXT NOT NULL,
      details TEXT
    );
  `);
}

function saveDatabaseToFile(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error("Error writing SQLite database file:", err);
  }
}

/**
 * Reads latest CMS config from SQL database
 */
export async function getConfigFromSQL(defaultConfig: any): Promise<any> {
  try {
    const db = await getSqlDatabase();
    const stmt = db.prepare("SELECT json_data FROM cms_config WHERE id = 'latest_config'");
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      if (row.json_data && typeof row.json_data === "string") {
        return JSON.parse(row.json_data);
      }
    }
    stmt.free();
  } catch (err) {
    console.error("Error reading config from SQL DB:", err);
  }

  // If table was empty, insert default config into SQL
  if (defaultConfig) {
    await saveConfigToSQL(defaultConfig);
  }
  return defaultConfig;
}

/**
 * Saves CMS config into SQL database tables and exports SQLite file
 */
export async function saveConfigToSQL(config: any): Promise<boolean> {
  try {
    const db = await getSqlDatabase();
    const updatedAt = new Date().toISOString();
    const configToSave = { ...config, updatedAt };
    const jsonStr = JSON.stringify(configToSave);

    // 1. Update main SQL cms_config table
    db.run(
      "INSERT OR REPLACE INTO cms_config (id, json_data, updated_at) VALUES ('latest_config', ?, ?)",
      [jsonStr, updatedAt]
    );

    // 2. Sync Founders into SQL founders table safely
    try {
      if (Array.isArray(config.founders)) {
        db.run("DELETE FROM founders");
        config.founders.forEach((founder: any, idx: number) => {
          db.run(
            `INSERT INTO founders (id, name, role, description, image_url, active, position)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              founder.id || `founder-${Date.now()}-${idx}`,
              founder.name || "",
              founder.role || "",
              founder.description || "",
              founder.imageUrl || "",
              founder.active !== false ? 1 : 0,
              idx
            ]
          );
        });
      }
    } catch (e) {
      console.warn("Minor warning syncing founders table:", e);
    }

    // 3. Sync Testimonials into SQL testimonials table safely
    try {
      if (Array.isArray(config.testimonials)) {
        db.run("DELETE FROM testimonials");
        config.testimonials.forEach((t: any, idx: number) => {
          db.run(
            `INSERT INTO testimonials (id, name, role, text, image_url, active, position)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              t.id || `testimony-${Date.now()}-${idx}`,
              t.name || "",
              t.role || "",
              t.text || "",
              t.imageUrl || "",
              t.active !== false ? 1 : 0,
              idx
            ]
          );
        });
      }
    } catch (e) {
      console.warn("Minor warning syncing testimonials table:", e);
    }

    // 4. Sync Footer into SQL footer_config table safely
    try {
      if (config.footer) {
        db.run(
          `INSERT OR REPLACE INTO footer_config (id, year, organization_name, designers_json)
           VALUES (1, ?, ?, ?)`,
          [
            config.footer.year || "2026",
            config.footer.organizationName || "Fundación Un Nuevo Comienzo C.R",
            JSON.stringify(config.footer.designers || [])
          ]
        );
      }
    } catch (e) {
      console.warn("Minor warning syncing footer table:", e);
    }

    // 5. Sync QRs into SQL qrs table safely
    try {
      db.run("DELETE FROM qrs");
      if (config.branding?.corporateQrUrl) {
        db.run(
          `INSERT INTO qrs (id, title, sinpe_number, holder, qr_image_url, active)
           VALUES ('qr-main', 'Código QR Institucional', ?, ?, ?, 1)`,
          [config.sinpe?.phone || "", config.sinpe?.holder || "", config.branding.corporateQrUrl]
        );
      }
    } catch (e) {
      console.warn("Minor warning syncing QRs table:", e);
    }

    // Save SQLite state to disk file
    saveDatabaseToFile(db);
    return true;
  } catch (err) {
    console.error("Error saving config to SQL database:", err);
    return false;
  }
}

/**
 * Logs deployment attempt to SQL table and exports file
 */
export async function logDeploymentToSQL(deployRecord: any): Promise<void> {
  try {
    const db = await getSqlDatabase();
    db.run(
      `INSERT OR REPLACE INTO deployments 
       (id, commit_message, commit_hash, saved_to_cms, cms_saved_at, deploy_status, deployed_at, provider, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deployRecord.id,
        deployRecord.commitMessage,
        deployRecord.commitHash,
        deployRecord.savedToCMS ? 1 : 0,
        deployRecord.cmsSavedAt,
        deployRecord.deployStatus,
        deployRecord.deployedAt,
        deployRecord.provider || "Netlify",
        deployRecord.details || ""
      ]
    );
    saveDatabaseToFile(db);
  } catch (err) {
    console.error("Error logging deployment to SQL:", err);
  }
}

/**
 * Gets all deployment history from SQL table
 */
export async function getDeploymentsFromSQL(): Promise<any[]> {
  try {
    const db = await getSqlDatabase();
    const res = db.exec("SELECT * FROM deployments ORDER BY deployed_at DESC LIMIT 30");
    if (res.length > 0 && res[0].values) {
      const columns = res[0].columns;
      return res[0].values.map((row) => {
        const item: any = {};
        columns.forEach((col, i) => {
          item[col] = row[i];
        });
        return {
          id: item.id,
          commitMessage: item.commit_message,
          commitHash: item.commit_hash,
          savedToCMS: Boolean(item.saved_to_cms),
          cmsSavedAt: item.cms_saved_at,
          deployStatus: item.deploy_status,
          deployedAt: item.deployed_at,
          provider: item.provider,
          details: item.details
        };
      });
    }
  } catch (err) {
    console.error("Error reading deployments from SQL:", err);
  }
  return [];
}
