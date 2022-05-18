import mongoose from 'mongoose';

interface PaymentAttrs {
  stripeId: string;
  orderId: string;
}

interface PaymentDoc extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(paymentAttrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    stripeId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__id;
      },
    },
  }
);

paymentSchema.statics.build = (paymentAttrs: PaymentAttrs) => {
  return new Payment(paymentAttrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);
export { Payment };
