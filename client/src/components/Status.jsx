const Status = ({ users, keyExchangeSuccess }) => {
  return (
    <>
      <h3>Status</h3>
      {users.length == 0 ? (
        <p>Other client is online</p>
      ) : users.length == 1 ? (
        <p>Other client is online with id: {users[0]}</p>
      ) : (
        <p>
          Something went wrong, or more than one other clients are running :/
        </p>
      )}
      {keyExchangeSuccess ? (
        <p className="alert alert-success">Key Exchange successful</p>
      ) : (
        <p className="alert alert-danger">Key exchange failed, try again</p>
      )}
    </>
  );
};
export default Status;
