const Logs = ({ logs }) => {
  return (
    <div>
      <h1>Logs</h1>
      <div
        style={{ height: "300px", overflowY: "scroll" }}
        className="border my-3 p-3 rounded"
      >
        {logs.length > 0 &&
          logs.map((log, index) => {
            return (
              <div key={index} className="my-3">
                {log}
              </div>
            );
          })}
      </div>
    </div>
  );
};
export default Logs;
