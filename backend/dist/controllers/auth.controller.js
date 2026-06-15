"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = require("../utils/crypto");
class AuthController {
    constructor() {
        this.login = (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            if (!username || !password) {
                res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni' });
                return;
            }
            User_1.default.findOne({ username: username }).then((user) => {
                if (!user) {
                    res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka' });
                    return;
                }
                if (user.status === 'pending') {
                    res.status(403).json({ message: 'Nalog čeka odobrenje administratora' });
                    return;
                }
                if (user.status === 'rejected') {
                    res.status(403).json({ message: 'Zahtev za registraciju je odbijen' });
                    return;
                }
                if (user.status === 'blocked') {
                    res.status(403).json({ message: 'Nalog je blokiran' });
                    return;
                }
                if (!(0, crypto_1.comparePassword)(password, user.password)) {
                    res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka' });
                    return;
                }
                const token = (0, crypto_1.createToken)({ id: String(user._id), username: user.username, role: user.role });
                res.json({
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture
                    }
                });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
    }
}
exports.AuthController = AuthController;
