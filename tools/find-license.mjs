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
 * 動作:
 *   - .license が既にある → 何もせず終了
 *   - naoki-blueprint/.license が見つかり、fingerprint一致 → コピーして成功
 *   - 見つからない or fingerprint不一致 → エラーで終了（exit 1）
 */
import { existsSync, copyFileSync, readFileSync } from "fs";
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

// 探索候補パス（naoki-slides との位置関係を複数想定）
const candidates = [
  // 兄弟ディレクトリ
  resolve(ROOT, "..", "naoki-blueprint", ".license"),
  // よくある絶対パス
  join(homedir(), "Desktop", "7_AI", "Cursor", "naoki-blueprint", ".license"),
  join(homedir(), "Desktop", "Cursor", "naoki-blueprint", ".license"),
  join(homedir(), "Cursor", "naoki-blueprint", ".license"),
  join(homedir(), "naoki-blueprint", ".license"),
];

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
    console.log(`   ライセンスID: ${d.license_id}（${d.name}）`);
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
