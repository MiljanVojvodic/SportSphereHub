"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = require("../utils/crypto");
function savePicture(base64Data, username) {
    if (!base64Data || !base64Data.startsWith('data:'))
        return '';
    const match = base64Data.match(/^data:([a-zA-Z+/\-]+);base64,(.+)$/);
    if (!match)
        return '';
    const ext = match[1].includes('png') ? 'png' : 'jpg';
    const filename = `${username}_${Date.now()}.${ext}`;
    const uploadsDir = path_1.default.join(__dirname, '..', '..', 'uploads');
    if (!fs_1.default.existsSync(uploadsDir))
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    try {
        fs_1.default.writeFileSync(path_1.default.join(uploadsDir, filename), Buffer.from(match[2], 'base64'));
        return `/uploads/${filename}`;
    }
    catch {
        return '';
    }
}
class AuthController {
    constructor() {
        this.checkUsername = (req, res) => {
            const username = req.query['username'];
            if (!username) {
                res.json({ available: true });
                return;
            }
            User_1.default.findOne({ username }).then((user) => {
                res.json({ available: !user });
            }).catch(() => {
                res.json({ available: true });
            });
        };
        this.login = (req, res) => {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni' });
                return;
            }
            User_1.default.findOne({ username }).then((user) => {
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
        this.register = (req, res) => {
            const { username, password, firstName, lastName, phone, email, role, sports, profilePicture, facilityName, facilityAddress, registrationNumber, taxId } = req.body;
            if (!username || !password || !firstName || !lastName || !phone || !email || !role) {
                res.status(400).json({ message: 'Sva obavezna polja moraju biti popunjena' });
                return;
            }
            const pwdLen = password.length;
            const pwdOk = pwdLen >= 8 && pwdLen <= 12
                && /^[a-zA-Z]/.test(password)
                && /[A-Z]/.test(password)
                && /\d/.test(password)
                && /[!@#$%^&*()\-_+=<>?;:,.'"\\|]/.test(password);
            if (!pwdOk) {
                res.status(400).json({ message: 'Lozinka ne ispunjava zahteve (8-12 kar., počinje slovom, veliko slovo, broj, specijalni karakter)' });
                return;
            }
            if (role === 'employee') {
                if (!/^\d{8}$/.test(registrationNumber)) {
                    res.status(400).json({ message: 'Matični broj mora imati tačno 8 cifara' });
                    return;
                }
                if (!/^[1-9]\d{8}$/.test(taxId)) {
                    res.status(400).json({ message: 'PIB mora imati tačno 9 cifara i ne sme počinjati nulom' });
                    return;
                }
            }
            User_1.default.findOne({ $or: [{ username }, { email }] }).then((existing) => {
                if (existing) {
                    if (existing.username === username) {
                        res.status(409).json({ message: 'Korisničko ime je već zauzeto' });
                    }
                    else {
                        res.status(409).json({ message: 'Email adresa je već registrovana' });
                    }
                    return;
                }
                const countPromise = role === 'employee'
                    ? User_1.default.countDocuments({ registrationNumber, role: 'employee' })
                    : Promise.resolve(0);
                countPromise.then((empCount) => {
                    if (role === 'employee' && empCount >= 2) {
                        res.status(409).json({ message: 'Objekat već ima maksimalan broj zaposlenih (2)' });
                        return;
                    }
                    const picturePath = savePicture(profilePicture || '', username);
                    const newUser = {
                        username,
                        password: (0, crypto_1.hashPassword)(password),
                        firstName,
                        lastName,
                        phone,
                        email,
                        role,
                        sports: sports || [],
                        profilePicture: picturePath,
                        status: 'pending'
                    };
                    if (role === 'employee') {
                        newUser.facilityName = facilityName;
                        newUser.facilityAddress = facilityAddress;
                        newUser.registrationNumber = registrationNumber;
                        newUser.taxId = taxId;
                    }
                    User_1.default.create(newUser).then(() => {
                        res.json({ message: 'Zahtev za registraciju je uspešno kreiran. Sačekajte odobrenje administratora.' });
                    }).catch(() => {
                        res.status(500).json({ message: 'Greška pri čuvanju korisnika' });
                    });
                }).catch(() => {
                    res.status(500).json({ message: 'Greška na serveru' });
                });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
    }
}
exports.AuthController = AuthController;
