import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!API_KEY) {
      console.error("API key is missing on server");
      return NextResponse.json(
        { error: "API key is missing on server" },
        { status: 500 }
      );
    }
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key in request" },
        { status: 401 }
      );
    }

    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token is not set");
      return NextResponse.json(
        { error: "Mapbox token is not set" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: MAPBOX_TOKEN });
  } catch (error) {
    console.error("🔥 Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
