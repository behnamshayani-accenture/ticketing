import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderDetails = ({ currentUser, order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => {
      Router.push('/orders');
    },
  });

  useEffect(() => {
    const updateTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51ISTGsEgwm5OnwIDyLTpjpTScgg6uSLCGOqsKKBdgcmkDf04hMjSwm46XRj0xgdUnur1FjyqhwuF3OepWlAch3Iv00AROi3SoU"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderDetails.getInitialProps = async (context, client) => {
  const { data } = await client.get(`/api/orders/${context.query.orderId}`);

  return { order: data };
};

export default OrderDetails;
