#!/usr/bin/env node
/**
 * テンプレSlideから新しいGoogle Slideを複製し、
 * projects/{name}/slide-meta.json に新Slide IDを保存する。
 *
 * 使い方:
 *   node tools/copy-slide.mjs <presentation-dir> [new-title]
 *
 * 前提:
 *   - naoki-slides/.env に GAS_WEBHOOK_URL と TEMPLATE_SLIDE_ID が設定されていること
 *   - GAS側で action="copy" エンドポイントが有効であること（コード.js v0.2.0以降）
 *
 * new-title を省略するとプレゼンフォルダ名をタイトルに使う。
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

dotenv.config({ path: join(ROOT, ".env") });

const presentationDir = process.argv[2];
const newTitleArg = process.argv[3];

if (!presentationDir) {
  console.error("Usage: node tools/copy-slide.mjs <presentation-dir> [new-title]");
  process.exit(1);
}

const { GAS_WEBHOOK_URL } = process.env;
// TEMPLATE_SLIDE_ID (新) を優先。旧キー GOOGLE_SLIDE_ID もfallbackで受ける。
const TEMPLATE_ID = process.env.TEMPLATE_SLIDE_ID || process.env.GOOGLE_SLIDE_ID;
if (!GAS_WEBHOOK_URL || !TEMPLATE_ID) {
  console.error("❌ .env に GAS_WEBHOOK_URL と TEMPLATE_SLIDE_ID を設定してください。");
  console.error("   bash セットアップ.sh を実行して生成してください。");
  process.exit(1);
}

const absDir = resolve(presentationDir);
if (!existsSync(absDir)) {
  mkdirSync(absDir, { recursive: true });
}

const newTitle = newTitleArg || basename(absDir);

console.log(`📄 テンプレートSlideから複製中: "${newTitle}"`);

try {
  const res = await fetch(GAS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "copy",
      templateId: TEMPLATE_ID,
      newTitle,
    }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok || json.error) {
    console.error(`❌ GAS エラー: ${json.error || text}`);
    console.error("   ヒント: GAS側が action=copy に対応していない場合は、gas/コード.js を最新版に貼り直して再デプロイしてください。");
    process.exit(1);
  }

  const meta = {
    slideId: json.newSlideId,
    url: json.url,
    title: json.title,
    createdAt: new Date().toISOString(),
    templateId: TEMPLATE_ID,
  };

  const metaPath = join(absDir, "slide-meta.json");
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

  console.log(`\n✅ 新しいGoogle Slideを作成しました`);
  console.log(`   タイトル: ${json.title}`);
  console.log(`   Slide ID: ${json.newSlideId}`);
  console.log(`   URL: ${json.url}`);
  console.log(`   保存先: ${metaPath}`);
} catch (e) {
  console.error(`❌ ネットワークエラー: ${e.message}`);
  process.exit(1);
}
