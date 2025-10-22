import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '\\.env') });  // Load .env from root

export const config = {
    GAME_URI: process.env.GAME_URI || null,
    MONGO_URI: process.env.MONGO_URI || null,
    MONGODB_URI: process.env.MONGODB_URI || null,
    JWT_SECRET: process.env.JWT_SECRET || null,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || null,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET || null,
    PORT: process.env.PORT || null,
    DEBUG: process.env.DEBUG || null,
}