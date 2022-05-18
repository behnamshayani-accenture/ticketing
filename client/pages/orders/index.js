const OrdersIndex = ({ orders }) => {
  console.log(orders);
  const renderesOrders = orders.map((order) => {
    return (
      <tr key={order.id}>
        <td>{order.ticket.title}</td>
        <td>{order.ticket.price}</td>
        <td>{order.expiresAt}</td>
        <td>{order.status}</td>
      </tr>
    );
  });

  return (
    <div>
      Your orders
      <table className="table">
        <thead>
          <tr>
            <th>Ticket title</th>
            <th>Price</th>
            <th>Expires At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{renderesOrders}</tbody>
      </table>
    </div>
  );
};

OrdersIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrdersIndex;
