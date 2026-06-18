import { Router } from 'express';
import { HomeController } from '../controllers/home.controller';

const router = Router();
const homeController = new HomeController();

router.get('/', homeController.getHomeData);
router.get('/sports', homeController.getSports);

export default router;
