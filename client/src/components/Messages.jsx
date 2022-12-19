const Messages = ({ messages }) => {
  return (
    <div
      style={{ height: "300px", overflowY: "scroll" }}
      className="border my-3 p-3 rounded"
    >
      {messages.length == 0 && (
        <div className="text-center mt-5 pt-5">
          <h6>Your messages appear here</h6>
        </div>
      )}
      {messages.length > 0 &&
        messages.map((message, index) => {
          if (!message || message === "") return <></>;
          return message.isAuthor ? (
            <div className="text-end my-3" key={index}>
              <span className="bg-success text-light px-3 py-2 rounded">
                {message.content}
              </span>
            </div>
          ) : (
            <div key={index} className="my-3">
              <span className="bg-primary text-light px-3 py-2 rounded">
                {message.content}
              </span>
            </div>
          );
        })}
    </div>
  );
};
export default Messages;
