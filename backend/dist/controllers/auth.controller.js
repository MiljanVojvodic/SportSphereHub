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
        this.checkUsername = (req, res) => {
            let username = req.query['username'];
            if (!username) {
                res.json({ available: true });
                return;
            }
            User_1.default.findOne({ username: username }).then((user) => {
                res.json({ available: !user });
            }).catch(() => {
                res.json({ available: true });
            });
        };
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
        this.register = (req, res) => {
            let { username, password, firstName, lastName, phone, email, role, sports, profilePicture, facilityName, facilityAddress, registrationNumber, taxId } = req.body;
            // Server validation
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
            // Check username and email uniqueness
            User_1.default.findOne({ $or: [{ username: username }, { email: email }] }).then((existing) => {
                if (existing) {
                    if (existing.username === username) {
                        res.status(409).json({ message: 'Korisničko ime je već zauzeto' });
                    }
                    else {
                        res.status(409).json({ message: 'Email adresa je već registrovana' });
                    }
                    return;
                }
                // Check max 2 employees per facility
                const countPromise = role === 'employee'
                    ? User_1.default.countDocuments({ registrationNumber: registrationNumber, role: 'employee' })
                    : Promise.resolve(0);
                countPromise.then((empCount) => {
                    if (role === 'employee' && empCount >= 2) {
                        res.status(409).json({ message: 'Objekat već ima maksimalan broj zaposlenih (2)' });
                        return;
                    }
                    const newUser = {
                        username: username,
                        password: (0, crypto_1.hashPassword)(password),
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone,
                        email: email,
                        role: role,
                        sports: sports || [],
                        profilePicture: profilePicture || '',
                        status: 'pending'
                    };
                    if (role === 'employee') {
                        newUser.facilityName = facilityName;
                        newUser.facilityAddress = facilityAddress;
                        newUser.registrationNumber = registrationNumber;
                        newUser.taxId = taxId;
                    }
                    if (role === 'athlete') {
                        newUser.status = 'approved';
                        User_1.default.create(newUser).then((created) => {
                            const token = (0, crypto_1.createToken)({ id: String(created._id), username: created.username, role: created.role });
                            res.json({
                                token,
                                user: {
                                    id: created._id,
                                    username: created.username,
                                    firstName: created.firstName,
                                    lastName: created.lastName,
                                    email: created.email,
                                    role: created.role,
                                    profilePicture: created.profilePicture
                                },
                                message: 'Registracija uspešna! Dobrodošli u SportSphere.'
                            });
                        }).catch(() => {
                            res.status(500).json({ message: 'Greška pri čuvanju korisnika' });
                        });
                    }
                    else {
                        User_1.default.create(newUser).then(() => {
                            res.json({ message: 'Zahtev za registraciju je uspešno kreiran. Sačekajte odobrenje administratora.' });
                        }).catch(() => {
                            res.status(500).json({ message: 'Greška pri čuvanju korisnika' });
                        });
                    }
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
