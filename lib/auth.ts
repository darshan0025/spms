import { SignJWT, jwtVerify } from "jose";

const secretKey = new TextEncoder().encode("secret-key-change-me"); // Ideally use process.env.JWT_SECRET

export async function signJWT(payload: any, expiresIn: string = "24h") {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secretKey);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}
