import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@behnamtickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wraper';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments/',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is required.'),
    body('orderId').not().isEmpty().withMessage('Order Id is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.userId !== req.currentUser!.id) {
      throw new NotFoundError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is already canceled.');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({ orderId: order.id, stripeId: charge.id });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      paymentId: payment.id,
      orderId: order.id,
      stripeId: charge.id,
    });

    res.status(201).send({});
  }
);

export { router as createChargeRouter };
