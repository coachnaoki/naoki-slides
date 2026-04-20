#!/usr/bin/env node
/**
 * 近隣の naoki-blueprint から .license を自動で探してコピーする。
 *
 * naoki-blueprint で認証済みなら、naoki-slides 側で再度IDを入力する必要がない。
 * fingerprint（hostname|user|platform|arch）が現在のマシンと一致する場合のみコピー。
 *
 * 使い方:
 *   node tools/find-license.mjs
 *
 * 探索範囲（naoki-blueprint の直下 / テンプレ / projects 配下すべて）:
 *   - naoki-blueprint/.license
 *   - naoki-blueprint/.template/.license
 *   - naoki-blueprint/.template-shorts/.license
 *   - naoki-blueprint/projects/*\/.license
 */
import { existsSync, copyFileSync, readFileSync, readdirSync } from "fs";
import { homedir, hostname, userInfo, platform, arch } from "os";
import { dirname, resolve, join } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TARGET = join(ROOT, ".license");

if (existsSync(TARGET)) {
  console.log("✓ .license は既に存在します。コピーは不要です。");
  process.exit(0);
}

// 現在のマシンのfingerprint（validateLicense.mjs / _chk.mjs と同じ計算）
const getFingerprint = () => {
  const r = `${hostname()}|${userInfo().username}|${platform()}|${arch()}`;
  return createHash("sha256").update(r).digest("hex").slice(0, 16);
};

// naoki-blueprint 本体の候補ベースパス（naoki-slides との位置関係を複数想定）
const baseDirs = [
  // 兄弟ディレクトリ
  resolve(ROOT, "..", "naoki-blueprint"),
  // よくある絶対パス
  join(homedir(), "Desktop", "7_AI", "Cursor", "naoki-blueprint"),
  join(homedir(), "Desktop", "Cursor", "naoki-blueprint"),
  join(homedir(), "Cursor", "naoki-blueprint"),
  join(homedir(), "naoki-blueprint"),
];

// 各ベースで .license を探す候補を組み立てる
const candidates = [];
for (const base of baseDirs) {
  // 直下（初回認証を本体で行っていたケース）
  candidates.push(join(base, ".license"));
  // テンプレ直下（validateLicense.mjs を .template 配下で叩いた場合）
  candidates.push(join(base, ".template", ".license"));
  candidates.push(join(base, ".template-shorts", ".license"));
  // projects/ 配下（新規作成.sh で .license ごとコピーされた各動画プロジェクト）
  const projectsDir = join(base, "projects");
  if (existsSync(projectsDir)) {
    try {
      const entries = readdirSync(projectsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          candidates.push(join(projectsDir, entry.name, ".license"));
        }
      }
    } catch {
      // 読めないディレクトリは無視
    }
  }
}

const currentFp = getFingerprint();

for (const p of candidates) {
  if (!existsSync(p)) continue;
  try {
    const d = JSON.parse(readFileSync(p, "utf-8"));
    if (d.fingerprint !== currentFp) {
      console.log(`\x1b[33m⊘ スキップ（別PCのライセンス）: ${p}\x1b[0m`);
      continue;
    }
    copyFileSync(p, TARGET);
    console.log(`\x1b[32m✅ naoki-blueprint から .license を自動コピーしました\x1b[0m`);
    console.log(`   送り元: ${p}`);
    console.log(`   → ${TARGET}`);
    console.log(`   ライセンスID: NK-****-****-****（${d.name}）`);
    process.exit(0);
  } catch (e) {
    // JSONパースエラーは無視して次候補へ
  }
}

console.error(`\x1b[31m✗ naoki-blueprint の .license が見つかりません\x1b[0m`);
console.error("  以下のいずれかを試してください:");
console.error("    1. naoki-blueprint 側で先にライセンス認証する");
console.error("    2. または手動入力: node tools/validateLicense.mjs NK-XXXX-XXXX-XXXX");
process.exit(1);
