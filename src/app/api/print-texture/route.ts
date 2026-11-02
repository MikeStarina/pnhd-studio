import { NextRequest } from "next/server";

const ALLOWED_HOST = "cdn.pnhd.ru";

export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get("url");
    if (!raw) return new Response("Не передан адрес", { status: 400 });

    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return new Response("Некорректный адрес", { status: 400 });
    }

    if (parsed.protocol !== "https:" || parsed.host !== ALLOWED_HOST || !parsed.pathname.startsWith("/prints/")) {
        return new Response("Адрес не разрешён", { status: 400 });
    }

    let upstream: Response;
    try {
        upstream = await fetch(parsed.toString());
    } catch {
        return new Response("Не удалось получить файл", { status: 502 });
    }
    if (!upstream.ok || !upstream.body) {
        return new Response("Не удалось получить файл", { status: 502 });
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
