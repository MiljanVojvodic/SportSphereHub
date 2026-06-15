import express from 'express';
import UserModel from '../models/User';
import { comparePassword, createToken } from '../utils/crypto';

export class AuthController {

    login = (req: express.Request, res: express.Response) => {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password) {
            res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni' });
            return;
        }

        UserModel.findOne({ username: username }).then((user: any) => {
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

            if (!comparePassword(password, user.password)) {
                res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka' });
                return;
            }

            const token = createToken({ id: String(user._id), username: user.username, role: user.role });

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
    }
}
