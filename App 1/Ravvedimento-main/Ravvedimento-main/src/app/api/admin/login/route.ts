import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        return NextResponse.json({ error: "Admin password not configured" }, { status: 500 });
    }

    if (password !== adminPassword) {
        return NextResponse.json({ error: "Password errata" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 ore
        path: "/",
    });

    return response;
}
