import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketsRendered = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a className="nav-link">{ticket.title}</a>
          </Link>
        </td>
        <td>{ticket.price}</td>
      </tr>
    );
  });
  return (
    <div>
      <h1>{currentUser ? 'You are logged in' : 'You are logged out'}</h1>
      <div>
        <h1>Tickets</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>{ticketsRendered}</tbody>
        </table>
      </div>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
