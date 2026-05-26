import { Router } from 'express';
import multer from 'multer';
import uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage);
router.delete('/:key', authenticate, uploadController.deleteImage);

export default router;
