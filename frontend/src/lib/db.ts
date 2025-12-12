import { Pool } from "pg";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

let pool: Pool | null = null;
let secretClient: SecretManagerServiceClient | null = null;


// -- Secret Manager からパスワード取得 --------------
async function getDbPassword(): Promise<string> {
  // ローカル開発環境では環境変数から取得
  if (process.env.NODE_ENV !== "production") {
    const password = process.env.DB_PASSWORD;
    if (password) {
      return password;
    }
  }
  // 本番環境では Secret Manager から取得
    secretClient = new SecretManagerServiceClient();
  }

  const projectId = process.env.GCP_PROJECT_ID || "gcp-semicon-survey-automation";
  const secretName = `projects/${projectId}/secrets/db-password/versions/latest`;

  try {
    const [version] = await secretClient.accessSecretVersion({ name: secretName });
    const password = version.payload?.data?.toString();

    if (!password) {
      throw new Error("Failed to retrieve password from Secret Manager");
    }

    return password;
  } catch (error) {
    console.error("Error accessing Secret Manager:", error);
    throw new Error(`Failed to get database password: ${error}`);
  }
}


// -- データベース接続プールの取得 --------------
export async function getPool(): Promise<Pool> {
  if (!pool) {
    const dbPassword = await getDbPassword();

    // Cloud SQL Unix socket 接続設定
    const host = process.env.DB_SOCKET || "/cloudsql/gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db";
    const user = process.env.DB_USER || "postgres";
    const database = process.env.DB_NAME || "semicon_survey";

    console.log(`Creating database pool: database=${database}, user=${user}, host=${host}`);

    pool = new Pool({
      user,
      password: dbPassword,
      database,
      host,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // 接続テスト
    try {
      const client = await pool.connect();
      console.log("Database connection successful");
      client.release();
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }

  return pool;
}


// -- データベース接続クローズ --------------
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
