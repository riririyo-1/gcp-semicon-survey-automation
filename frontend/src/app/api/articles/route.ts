import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/repositories/articleRepository";

// -- GET /api/articles --------------
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const q = searchParams.get("q") || undefined;
    const date = searchParams.get("date") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const articles = await getArticles(source, tag, q, date, limit, offset);

    return NextResponse.json({
      articles,
      hasMore: articles.length === limit,
      nextOffset: offset + articles.length,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
