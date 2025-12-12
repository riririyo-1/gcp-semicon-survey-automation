# DBパスワード管理の問題と解決策

## 現在の状態

### フロー図: 現在のDBパスワード管理

```mermaid
graph TB
    subgraph Terraform["Terraform (infra/main.tf)"]
        A[random_password生成 32文字] --> B[Secret Manager db-password]
        A --> C[Cloud SQL User postgres]
    end

    subgraph CloudRun["Cloud Run 環境変数"]
        D[DB_PASSWORD Secret参照]
        E[DATABASE_URL postgresql://postgres:@/semicon_survey?host=/cloudsql/...]
    end

    subgraph Frontend["Frontend Code"]
        F[db.ts getPool関数]
        G[DATABASE_URLをパース]
        H[password = userInfo.split':']
        I{password 存在?}
        J[エラー発生]
        K[DB接続成功]
    end

    B -.Secret Manager.-> D
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    I -->|空文字列| J
    I -->|存在| K

    style J fill:#ff6b6b
    style I fill:#ffd93d
```

### 問題点

1. **Cloud Run設定**: `DATABASE_URL`にパスワードが含まれていない
   - 現在: `postgresql://postgres:@/semicon_survey?...`
   - パスワード部分が空（`:@`の間が空）

2. **環境変数の分離**: `DB_PASSWORD`は別の環境変数として存在するが使用されていない

3. **コードの問題**: [frontend/src/lib/db.ts:35](frontend/src/lib/db.ts#L35)で`userInfo.split(':')`した結果、パスワードが空文字列になる

---

## 解決策の比較

### アプローチA: Cloud Run設定変更（DATABASE_URLにパスワードを含める）

```mermaid
graph TB
    subgraph Terraform["Terraform修正"]
        A1[Cloud Run設定変更]
        A2[DATABASE_URL= postgresql://postgres:DB_PASSWORD@/...]
    end

    subgraph CloudRun["Cloud Run 実行時"]
        B1[DB_PASSWORD展開]
        B2[DATABASE_URL= postgresql://postgres:actual_password@/...]
    end

    subgraph Frontend["Frontend Code"]
        C1[既存コード変更なし]
        C2[DATABASE_URLパース]
        C3[パスワード取得成功]
    end

    A1 --> A2
    A2 --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
    C2 --> C3

    style C3 fill:#51cf66
```

#### メリット

- フロントエンドコード変更不要
- DATABASE_URL形式が標準的
- 他のツール（pgAdmin等）でもそのまま使用可能

#### デメリット

- Terraform設定変更が必要
- Cloud Runの再デプロイが必要
- 環境変数展開の動作確認が必要

#### 実装手順

1. [infra/main.tf](infra/main.tf)のCloud Run設定を修正
2. `terraform apply`実行
3. フロントエンド再デプロイ

---

### アプローチB: フロントエンドコード修正（DB_PASSWORD環境変数を使用）

```mermaid
graph TB
    subgraph CloudRun["Cloud Run 環境変数（変更なし）"]
        A1[DB_PASSWORD Secret参照]
        A2[DATABASE_URL postgresql://postgres:@/...]
    end

    subgraph Frontend["Frontend Code修正"]
        B1[db.ts修正]
        B2[DATABASE_URLパース]
        B3{password 空?}
        B4[process.env.DB_PASSWORD を使用]
        B5[パース結果を使用]
        B6[DB接続成功]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> B3
    B3 -->|Yes| B4
    B3 -->|No| B5
    B4 --> B6
    B5 --> B6

    style B6 fill:#51cf66
```

#### メリット

- インフラ変更不要
- フロントエンドのみの修正で完結
- 素早く修正・デプロイ可能
- 柔軟性が高い（環境変数の優先順位制御可能）

#### デメリット

- フロントエンドコード修正が必要
- DATABASE_URL形式が非標準的

#### 実装手順

1. [frontend/src/lib/db.ts:35-45](frontend/src/lib/db.ts#L35-L45)を修正
2. Dockerビルド＆プッシュ
3. Cloud Runデプロイ

---

## 推奨アプローチ

### 推奨: アプローチB（フロントエンドコード修正）

**理由:**

1. **迅速性**: インフラ変更なしで即座に対応可能
2. **安全性**: Terraform状態に影響を与えない
3. **柔軟性**: 両方の環境変数パターンに対応可能
4. **テスト容易性**: ローカル開発でも本番でも動作

### 修正コード例

```typescript
// frontend/src/lib/db.ts:35付近
const [user, password] = userInfo.split(":");

// パスワードが空の場合、DB_PASSWORD環境変数を使用
const dbPassword = password || process.env.DB_PASSWORD || "";

if (!user || !dbPassword || !database || !host) {
  throw new Error(
    `Missing required connection parameters. user=${!!user}, password=${!!dbPassword}, database=${!!database}, host=${!!host}`
  );
}

pool = new Pool({
  user,
  password: dbPassword,
  database,
  host,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 将来的な改善案

長期的には、以下の構成を検討:

```mermaid
graph TB
    subgraph BestPractice["ベストプラクティス"]
        A[Secret Manager]
        B[Cloud Run Secret直接マウント]
        C[DATABASE_URL完全形式 with password]
        D[アプリケーション シンプルな接続]
    end

    A --> B
    B --> C
    C --> D

    style BestPractice fill:#e3f2fd
```

- DATABASE_URLに完全な接続文字列を含める
- Secret Managerから直接参照
- 環境変数の分離を避ける
