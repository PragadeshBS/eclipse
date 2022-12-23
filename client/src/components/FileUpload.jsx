const FileUpload = ({ fileUploadSuccess, onFileUpload }) => {
  return (
    <div>
      <h1 className="display-6">Upload file</h1>
      <div className="border rounded p-3">
        <div className="my-3">
          Upload a file to the server with socket connection
        </div>
        <input
          type="file"
          className="form-control"
          onChange={(event) => onFileUpload(event)}
        />
        {fileUploadSuccess && (
          <div className="mt-3 alert alert-success">
            File uploaded successfully
          </div>
        )}
      </div>
    </div>
  );
};
export default FileUpload;
