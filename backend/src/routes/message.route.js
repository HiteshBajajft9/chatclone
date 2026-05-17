import express from 'express';
import { getContacts , getChatByUserId , sendMessage, getChats } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection,protectRoute); // Apply authentication middleware to all routes in this router


router.get("/contacts", getContacts);
router.get("/chats", getChats);
router.get("/chats/:userId",getChatByUserId);
router.post("/send/:userId",  sendMessage);
// router.delete("/delete/:messageId", deleteMessage);

export default router;