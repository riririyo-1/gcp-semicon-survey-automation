# -- ビルドステージ --------------
FROM node:20-alpine AS builder

WORKDIR /app

# pnpmインストール
RUN npm install -g pnpm

# 依存関係のインストール
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# アプリケーションファイルコピー
COPY . .

# Next.jsビルド
RUN pnpm build


# -- 実行ステージ --------------
FROM node:20-alpine AS runner

WORKDIR /app

# 環境変数設定
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルド成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 非rootユーザーに切り替え
USER nextjs

# ポート公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 実行
CMD ["node", "server.js"]
