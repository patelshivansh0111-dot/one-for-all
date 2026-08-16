import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from './config/passport';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import communityRoutes from './routes/community.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import eventRoutes from './routes/event.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import achievementRoutes from './routes/achievement.routes';
import questionRoutes from './routes/question.routes';
import answerRoutes from './routes/answer.routes';

const app: Application = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'One for All API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
