import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");
  const targetLang = searchParams.get("targetLang") || "uz";

  if (!text || !text.trim()) {
    return NextResponse.json({ translatedText: "" });
  }

  const cleanText = text.trim();

  if (cleanText.length > 500) {
    return NextResponse.json({ translatedText: cleanText });
  }

  // Engine 1: Google Translate Chrome Extension Endpoint
  try {
    const googleUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const result = Array.isArray(data[0]) ? data[0][0] : data[0];
        if (typeof result === "string" && result.trim()) {
          return NextResponse.json({ translatedText: result });
        }
      }
    }
  } catch (e) {
    console.error("Google proxy engine 1 failed:", e);
  }

  // Engine 2: Google GTX Fallback
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(gtxUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map((x: any) => x[0]).join("");
        if (translated && translated.trim()) {
          return NextResponse.json({ translatedText: translated });
        }
      }
    }
  } catch (e) {
    console.error("Google proxy engine 2 failed:", e);
  }

  // Engine 3: MyMemory API Fallback
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=autodetect|${targetLang}`;
    const res = await fetch(myMemoryUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return NextResponse.json({ translatedText: data.responseData.translatedText });
      }
    }
  } catch (e) {
    console.error("MyMemory proxy engine 3 failed:", e);
  }

  return NextResponse.json({ translatedText: cleanText });
}
