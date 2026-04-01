import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import puppeteer from "puppeteer-core";

// 强制动态渲染，避免 build 时访问数据库
export const dynamic = "force-dynamic";

const executablePath =
  process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser";

function buildHtml(
  title: string,
  pagesList: { pageNumber: number; aiText: string | null; aiImageUrl: string | null }[]
): string {
  const coverImageUrl = pagesList[0]?.aiImageUrl || "";

  const innerPages = pagesList.map((p, idx) => {
    const imgHtml = p.aiImageUrl
      ? `<div class="page-image"><img src="${p.aiImageUrl}" alt="第${p.pageNumber}页" /></div>`
      : `<div class="page-image"><div class="no-image">暂无图片</div></div>`;
    return `
      <div class="page-inner">
        ${imgHtml}
        <div class="page-text">${p.aiText || ""}</div>
        <div class="page-footer">
          <span class="page-num">${idx + 1} / ${pagesList.length}</span>
          <span class="book-title">${title}</span>
        </div>
      </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<style>
  @page {
    size: A4;
    margin: 20mm 15mm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
    color: #333;
  }

  /* 封面 */
  .cover {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    page-break-after: always;
    text-align: center;
  }
  .cover-image {
    width: 100%;
    max-height: 65vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2cm;
  }
  .cover-image img {
    max-width: 100%;
    max-height: 65vh;
    object-fit: contain;
    border-radius: 8px;
  }
  .cover-title {
    font-size: 2.5em;
    font-weight: bold;
    color: #333;
    margin-top: 0.5cm;
  }
  .no-image {
    width: 100%;
    height: 200px;
    background: #f5f0e8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    border-radius: 8px;
  }

  /* 内页 */
  .page-inner {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    page-break-after: always;
  }
  .page-inner:last-child {
    page-break-after: auto;
  }
  .page-image {
    flex: 6;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .page-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 6px;
  }
  .page-text {
    flex: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8cm 0.5cm;
    font-size: 1.2em;
    line-height: 1.8;
    text-align: justify;
  }
  .page-footer {
    position: fixed;
    bottom: 10mm;
    left: 15mm;
    right: 15mm;
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    color: #999;
  }
</style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover">
    <div class="cover-image">
      ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${title}" />` : '<div class="no-image">暂无封面</div>'}
    </div>
    <div class="cover-title">${title}</div>
  </div>

  <!-- 内页 -->
  ${innerPages}

</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const { bookId } = await params;
    const bookData = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookData.length) {
      return NextResponse.json({ error: "绘本不存在" }, { status: 404 });
    }

    const book = bookData[0];

    const pagesData = await db
      .select()
      .from(pages)
      .where(eq(pages.bookId, bookId))
      .orderBy(pages.pageNumber);

    const pagesList = pagesData.map((p) => ({
      pageNumber: p.pageNumber,
      aiText: p.aiText,
      aiImageUrl: p.aiImageUrl,
    }));

    const htmlTemplate = buildHtml(book.title, pagesList);

    // 用 puppeteer-core 渲染
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "networkidle0", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(book.title)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF 导出失败:", error);
    return NextResponse.json({ error: "PDF 导出失败" }, { status: 500 });
  }
}
