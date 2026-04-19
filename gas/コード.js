/**
 * naoki-slides — Google Slides 書き込みGAS
 *
 * naoki-slides/tools/post-to-gas.mjs から Base64画像の配列を受け取り、
 * 指定された Google Slide の全スライドを削除 → 画像を1枚ずつページに貼り付ける。
 *
 * デプロイ方法:
 *   1. https://script.google.com/ で新しいプロジェクト作成
 *   2. このファイルの中身を丸ごと貼り付け
 *   3. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
 *      ・次のユーザーとして実行: 自分
 *      ・アクセスできるユーザー: 自分のみ
 *   4. 表示された Web App URL を naoki-slides/.env に GAS_WEBHOOK_URL として設定
 */

// =====================================================
// エントリポイント（POST）
// =====================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "sync";

    if (action === "sync") {
      return jsonResponse(syncSlides(data));
    }

    return jsonResponse({ error: `Unknown action: ${action}` });
  } catch (err) {
    return jsonResponse({ error: err.toString(), stack: err.stack });
  }
}

// =====================================================
// GET（動作確認用）
// =====================================================
function doGet() {
  return jsonResponse({
    ok: true,
    name: "naoki-slides GAS",
    version: "0.1.0",
    usage: "POST { action: 'sync', slideId, images: [{name, data(base64)}] }"
  });
}

// =====================================================
// メイン処理: Google Slideを全削除 → 画像を1枚ずつ貼り付け
// =====================================================
function syncSlides({ slideId, images }) {
  if (!slideId) throw new Error("slideId が必要です");
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("images は1枚以上必要です");
  }

  const presentation = SlidesApp.openById(slideId);
  if (!presentation) throw new Error(`Google Slide が開けません: ${slideId}`);

  // 1. 既存スライドを全削除（2枚目以降を先に削除）
  const existingSlides = presentation.getSlides();
  for (let i = existingSlides.length - 1; i >= 1; i--) {
    existingSlides[i].remove();
  }

  // 2. 1枚目が存在するなら空白化して再利用、無ければ新規追加
  let firstSlide = presentation.getSlides()[0];
  if (firstSlide) {
    firstSlide.getPageElements().forEach(el => el.remove());
  } else {
    firstSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  }

  // 3. スライドサイズ取得（1280×720px = 960×540pt または 720×405pt）
  const pageWidth = presentation.getPageWidth();
  const pageHeight = presentation.getPageHeight();

  // 4. 1枚目: 空白化した1枚目に画像を貼る
  insertImage(firstSlide, images[0], pageWidth, pageHeight);

  // 5. 2枚目以降: 新規スライド（BLANK layout）追加して画像を貼る
  for (let i = 1; i < images.length; i++) {
    const newSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    insertImage(newSlide, images[i], pageWidth, pageHeight);
  }

  return {
    ok: true,
    slideId,
    slidesCount: images.length,
    url: `https://docs.google.com/presentation/d/${slideId}/edit`,
  };
}

// =====================================================
// 1枚のSlideに画像をフィット挿入
// =====================================================
function insertImage(slide, imageInfo, pageWidth, pageHeight) {
  // Base64 → Blob
  const bytes = Utilities.base64Decode(imageInfo.data);
  const blob = Utilities.newBlob(bytes, "image/png", imageInfo.name || "slide.png");
  const img = slide.insertImage(blob);

  // アスペクト比を維持しつつページにフィット
  const imgW = img.getWidth();
  const imgH = img.getHeight();
  const scale = Math.min(pageWidth / imgW, pageHeight / imgH);
  const newW = imgW * scale;
  const newH = imgH * scale;
  img.setWidth(newW);
  img.setHeight(newH);
  img.setLeft((pageWidth - newW) / 2);
  img.setTop((pageHeight - newH) / 2);
}

// =====================================================
// JSONレスポンス
// =====================================================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
