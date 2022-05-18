import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@behnamtickets/common';
import { createOrderRoute } from './routes/new';
import { showOrderRouter } from './routes/show';
import { listOrdersRouter } from './routes/list';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
app.use(createOrderRoute);
app.use(showOrderRouter);
app.use(listOrdersRouter);
app.use(deleteOrderRouter);
app.all('*', () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
