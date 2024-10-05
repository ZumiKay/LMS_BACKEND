type message =
  | "Bad Request"
  | "Unauthenticated"
  | "Not Found"
  | "Error Server 500"
  | "No Access";
type code = 0 | 1 | 2 | 3 | 4;

const ErrorCode = (message: message): { code: code; message: message } => ({
  code:
    message === "Bad Request"
      ? 0
      : message === "Unauthenticated"
      ? 1
      : message === "Not Found"
      ? 2
      : message === "Error Server 500"
      ? 3
      : 4,
  message,
});

export default ErrorCode;
