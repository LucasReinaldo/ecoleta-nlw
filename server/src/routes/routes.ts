import express from 'express';
import multer from 'multer';
import multerConfig from '../config/multer';
import PointsController from '../infra/http/controllers/PointsController';
import ItemsController from '../infra/http/controllers/ItemsController';

const pointsController = new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/items', itemsController.index);

routes.post('/points', upload.single('image'), pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;
