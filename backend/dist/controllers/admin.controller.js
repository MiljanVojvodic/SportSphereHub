"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const User_1 = __importDefault(require("../models/User"));
class AdminController {
    constructor() {
        this.getPendingUsers = (req, res) => {
            User_1.default.find({ status: 'pending' }).select('-password').then((users) => {
                res.json(users);
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.getAllUsers = (req, res) => {
            User_1.default.find({ role: { $ne: 'admin' } }).select('-password').then((users) => {
                res.json(users);
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.approveUser = (req, res) => {
            let id = req.params.id;
            User_1.default.findByIdAndUpdate(id, { status: 'approved' }).then(() => {
                res.json({ message: 'Korisnik je odobren' });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.rejectUser = (req, res) => {
            let id = req.params.id;
            User_1.default.findByIdAndUpdate(id, { status: 'rejected' }).then(() => {
                res.json({ message: 'Zahtev je odbijen' });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.blockUser = (req, res) => {
            let id = req.params.id;
            User_1.default.findByIdAndUpdate(id, { status: 'blocked' }).then(() => {
                res.json({ message: 'Korisnik je blokiran' });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.unblockUser = (req, res) => {
            let id = req.params.id;
            User_1.default.findByIdAndUpdate(id, { status: 'approved' }).then(() => {
                res.json({ message: 'Korisnik je odblokiran' });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
        this.deleteUser = (req, res) => {
            let id = req.params.id;
            User_1.default.findByIdAndDelete(id).then(() => {
                res.json({ message: 'Korisnik je obrisan' });
            }).catch(() => {
                res.status(500).json({ message: 'Greška na serveru' });
            });
        };
    }
}
exports.AdminController = AdminController;
