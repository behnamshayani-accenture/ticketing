import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketDetails = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) => {
      Router.push('/orders/[orderId]', `/orders/${order.id}`);
    },
  });

  return (
    <div>
      <h2>Title: {ticket.title}</h2>
      <h3>Price: {ticket.price}</h3>
      {errors}
      <button
        onClick={() => {
          doRequest();
        }}
        className="btn btn-primary"
      >
        Purchase
      </button>
    </div>
  );
};

TicketDetails.getInitialProps = async (context, client) => {
  const { data } = await client.get(`/api/tickets/${context.query.ticketId}`);

  return { ticket: data };
};

export default TicketDetails;
