import express from 'express';
import UserModel from '../models/User';

export class AdminController {

    getPendingUsers = (req: express.Request, res: express.Response) => {
        UserModel.find({ status: 'pending' }).select('-password').then((users: any) => {
            res.json(users);
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    getAllUsers = (req: express.Request, res: express.Response) => {
        UserModel.find({ role: { $ne: 'admin' } }).select('-password').then((users: any) => {
            res.json(users);
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    approveUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id;
        UserModel.findByIdAndUpdate(id, { status: 'approved' }).then(() => {
            res.json({ message: 'Korisnik je odobren' });
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    rejectUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id;
        UserModel.findByIdAndUpdate(id, { status: 'rejected' }).then(() => {
            res.json({ message: 'Zahtev je odbijen' });
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    blockUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id;
        UserModel.findByIdAndUpdate(id, { status: 'blocked' }).then(() => {
            res.json({ message: 'Korisnik je blokiran' });
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    unblockUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id;
        UserModel.findByIdAndUpdate(id, { status: 'approved' }).then(() => {
            res.json({ message: 'Korisnik je odblokiran' });
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }

    deleteUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id;
        UserModel.findByIdAndDelete(id).then(() => {
            res.json({ message: 'Korisnik je obrisan' });
        }).catch(() => {
            res.status(500).json({ message: 'Greška na serveru' });
        });
    }
}
