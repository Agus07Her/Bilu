import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|manifest.json|manifest.webmanifest|icon.png|icon-512.png|favicon.ico|robots.txt).*)"],
};
