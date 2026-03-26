import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotte pubbliche per Clerk
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/_not-found"
]);

// Rotte admin (gestite con cookie, non Clerk)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminLoginPage = createRouteMatcher(["/admin/login"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
    // Protezione rotte ADMIN (cookie-based, nessun Clerk)
    if (isAdminRoute(request) && !isAdminLoginPage(request)) {
        const adminSession = request.cookies.get("admin_session");
        if (!adminSession || adminSession.value !== "authenticated") {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        return NextResponse.next();
    }

    // Protezione rotte utente con Clerk (escluse rotte admin)
    if (!isAdminRoute(request) && !isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
