const errorHandling = (statusCode) => {
  switch (statusCode) {
    case 400:
      return "Bad Request. Please check your input and try again.";
    case 401:
      return "Unauthorized. Please login to continue.";
    case 403:
      return "Forbidden. You don't have permission to access this resource.";
    case 404:
      return "Resource not found.";
    case 408:
      return "Request timed out. Please try again.";
    case 409:
      return "Conflict. The request could not be processed due to a conflict.";
    case 413:
      return "Payload too large.";
    case 429:
      return "Too many requests. Please slow down.";
    case 500:
      return "Internal Server Error. Something went wrong on our side.";
    case 502:
      return "Bad Gateway. Upstream service error.";
    case 503:
      return "Service Unavailable. Please try again later.";
    case 504:
      return "Gateway Timeout.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
};

module.exports = errorHandling;
