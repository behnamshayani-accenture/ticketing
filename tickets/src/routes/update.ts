import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wraper';
import {
  BadRequestError,
  NotAuthorized,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@behnamtickets/common';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required.'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be decimal and greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorized();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Ticket is locked for editting.');
    }

    const { title, price } = req.body;

    ticket.set({
      title,
      price,
    });
    await ticket.save();
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      cost: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
