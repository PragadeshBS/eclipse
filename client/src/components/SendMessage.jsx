const SendMessage = ({ message, onMessageType, sendMessage }) => {
  return (
    <div className="row align-items-center">
      <div className="col-10">
        <input
          placeholder="Enter a message..."
          className="form-control"
          value={message}
          onChange={onMessageType}
        />
      </div>
      <div className="col-2">
        <button className="btn my-3 btn-dark" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};
export default SendMessage;
