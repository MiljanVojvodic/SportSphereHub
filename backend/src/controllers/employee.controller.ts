import express from 'express';
import fs from 'fs';
import path from 'path';
import UserModel from '../models/User';
import SportFacilityModel from '../models/SportFacility';
import { AuthRequest } from '../middleware/auth.middleware';

function savePicture(base64Data: string, username: string): string {
    if (!base64Data || !base64Data.startsWith('data:')) return '';
    const match = base64Data.match(/^data:([a-zA-Z+/\-]+);base64,(.+)$/);
    if (!match) return '';
    const ext = match[1].includes('png') ? 'png' : 'jpg';
    const filename = `${username}_${Date.now()}.${ext}`;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    try {
        fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(match[2], 'base64'));
        return `/uploads/${filename}`;
    } catch { return ''; }
}

function validateFacilityData(data: any): string | null {
    if (!data.name || !data.city || !data.address) {
        return 'Naziv, grad i adresa su obavezni';
    }
    const courts = Array.isArray(data.courts) ? data.courts : [];
    if (courts.length === 0) {
        return 'Objekat mora imati najmanje jedan teren';
    }
    const hasOpenCourt = courts.some((c: any) => c.type === 'open' && Number(c.capacity) >= 4);
    if (!hasOpenCourt) {
        return 'Objekat mora imati najmanje jedan otvoreni teren sa kapacitetom ≥ 4';
    }
    const names = courts.map((c: any) => c.name);
    if (new Set(names).size !== names.length) {
        return 'Nazivi terena moraju biti jedinstveni';
    }
    return null;
}

export class EmployeeController {

    getProfile = (req: AuthRequest, res: express.Response) => {
        UserModel.findById(req.user!.id).select('-password').then((user: any) => {
            if (!user) { res.status(404).json({ message: 'Korisnik nije pronađen' }); return; }
            res.json(user);
        }).catch(() => res.status(500).json({ message: 'Greška na serveru' }));
    }

    updateProfile = (req: AuthRequest, res: express.Response) => {
        const { firstName, lastName, phone, email, profilePicture, sports } = req.body;
        const update: any = {};
        if (firstName !== undefined) update.firstName = firstName;
        if (lastName !== undefined) update.lastName = lastName;
        if (phone !== undefined) update.phone = phone;
        if (email !== undefined) update.email = email;
        if (sports !== undefined) update.sports = sports;

        const checkEmail = email
            ? UserModel.findOne({ email, _id: { $ne: req.user!.id } })
            : Promise.resolve(null);

        checkEmail.then((existing: any) => {
            if (existing) {
                res.status(409).json({ message: 'Email adresa je već u upotrebi' });
                return null;
            }
            if (profilePicture && profilePicture.startsWith('data:')) {
                const picPath = savePicture(profilePicture, req.user!.username);
                if (picPath) update.profilePicture = picPath;
            }
            return UserModel.findByIdAndUpdate(req.user!.id, update, { new: true }).select('-password');
        }).then((user: any) => {
            if (user) res.json(user);
        }).catch(() => res.status(500).json({ message: 'Greška na serveru' }));
    }

    getFacilities = (req: AuthRequest, res: express.Response) => {
        SportFacilityModel.find({ employees: req.user!.id }).then((facilities: any) => {
            res.json(facilities);
        }).catch(() => res.status(500).json({ message: 'Greška na serveru' }));
    }

    createFacility = (req: AuthRequest, res: express.Response) => {
        const err = validateFacilityData(req.body);
        if (err) { res.status(400).json({ message: err }); return; }

        const { name, city, address, sports, hourlyRate, workingHours, maxNoShows, description, courts } = req.body;

        const newFacility = {
            name,
            city,
            address,
            sports: sports || [],
            status: 'pending',
            likes: 0,
            dislikes: 0,
            images: [],
            hourlyRate: hourlyRate || 0,
            workingHours: workingHours || { from: '08:00', to: '22:00' },
            maxNoShows: maxNoShows || 3,
            courts: courts || [],
            description: description || '',
            employees: [req.user!.id]
        };

        SportFacilityModel.create(newFacility).then((facility: any) => {
            res.json(facility);
        }).catch(() => res.status(500).json({ message: 'Greška pri čuvanju objekta' }));
    }

    updateFacility = (req: AuthRequest, res: express.Response) => {
        const { id } = req.params;
        const { name, city, address, sports, hourlyRate, workingHours, maxNoShows, description } = req.body;

        SportFacilityModel.findOne({ _id: id, employees: req.user!.id }).then((facility: any) => {
            if (!facility) {
                res.status(404).json({ message: 'Objekat nije pronađen' });
                return null;
            }
            const update: any = {};
            if (name !== undefined) update.name = name;
            if (city !== undefined) update.city = city;
            if (address !== undefined) update.address = address;
            if (sports !== undefined) update.sports = sports;
            if (hourlyRate !== undefined) update.hourlyRate = hourlyRate;
            if (workingHours !== undefined) update.workingHours = workingHours;
            if (maxNoShows !== undefined) update.maxNoShows = maxNoShows;
            if (description !== undefined) update.description = description;
            return SportFacilityModel.findByIdAndUpdate(id, update, { new: true });
        }).then((updated: any) => {
            if (updated) res.json(updated);
        }).catch(() => res.status(500).json({ message: 'Greška pri ažuriranju' }));
    }

    addCourt = (req: AuthRequest, res: express.Response) => {
        const { id } = req.params;
        const court = req.body;

        if (!court.name || !court.type || court.capacity === undefined) {
            res.status(400).json({ message: 'Naziv, tip i kapacitet terena su obavezni' });
            return;
        }
        if (court.type === 'open' && Number(court.capacity) < 4) {
            res.status(400).json({ message: 'Otvoreni teren mora imati kapacitet ≥ 4' });
            return;
        }
        if (court.description && court.description.length > 300) {
            res.status(400).json({ message: 'Opis ne sme biti duži od 300 karaktera' });
            return;
        }

        SportFacilityModel.findOne({ _id: id, employees: req.user!.id }).then((facility: any) => {
            if (!facility) {
                res.status(404).json({ message: 'Objekat nije pronađen' });
                return null;
            }
            const nameExists = facility.courts.some((c: any) => c.name === court.name);
            if (nameExists) {
                res.status(409).json({ message: 'Teren sa tim nazivom već postoji u ovom objektu' });
                return null;
            }
            facility.courts.push({
                name: court.name,
                type: court.type,
                capacity: Number(court.capacity),
                sport: court.sport || '',
                description: court.description || ''
            });
            return facility.save();
        }).then((saved: any) => {
            if (saved) res.json(saved);
        }).catch(() => res.status(500).json({ message: 'Greška pri dodavanju terena' }));
    }

    removeCourt = (req: AuthRequest, res: express.Response) => {
        const { id, courtName } = req.params;
        const name = decodeURIComponent(courtName as string);

        SportFacilityModel.findOne({ _id: id, employees: req.user!.id }).then((facility: any) => {
            if (!facility) {
                res.status(404).json({ message: 'Objekat nije pronađen' });
                return null;
            }
            facility.courts = facility.courts.filter((c: any) => c.name !== name);
            return facility.save();
        }).then((saved: any) => {
            if (saved) res.json(saved);
        }).catch(() => res.status(500).json({ message: 'Greška pri brisanju terena' }));
    }

    uploadFacilityJson = (req: AuthRequest, res: express.Response) => {
        const data = req.body;
        const err = validateFacilityData(data);
        if (err) { res.status(400).json({ message: err }); return; }

        const newFacility = {
            name: data.name,
            city: data.city,
            address: data.address,
            sports: data.sports || [],
            status: 'pending',
            likes: 0,
            dislikes: 0,
            images: [],
            hourlyRate: data.hourlyRate || 0,
            workingHours: data.workingHours || { from: '08:00', to: '22:00' },
            maxNoShows: data.maxNoShows || 3,
            courts: data.courts || [],
            description: data.description || '',
            employees: [req.user!.id]
        };

        SportFacilityModel.create(newFacility).then((facility: any) => {
            res.json(facility);
        }).catch(() => res.status(500).json({ message: 'Greška pri čuvanju objekta iz JSON-a' }));
    }
}
