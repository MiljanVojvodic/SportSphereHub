"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = exports.comparePassword = exports.hashPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const PASSWORD_SECRET = 'sportsphere_pwd_2025';
const JWT_SECRET = 'sportsphere_jwt_2025';
function hashPassword(password) {
    return crypto_1.default.createHmac('sha256', PASSWORD_SECRET).update(password).digest('hex');
}
exports.hashPassword = hashPassword;
function comparePassword(plain, hashed) {
    return hashPassword(plain) === hashed;
}
exports.comparePassword = comparePassword;
function createToken(payload, expiresInHours = 24) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const sig = crypto_1.default.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}
exports.createToken = createToken;
function verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3)
        throw new Error('Invalid token format');
    const [header, body, sig] = parts;
    const expected = crypto_1.default.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected)
        throw new Error('Invalid token signature');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
    }
    return payload;
}
exports.verifyToken = verifyToken;
