class ApplicationException extends Error {
  constructor(httpStatusCode, message) {
    super(message);
    this.name = 'ApplicationException';
    this.httpStatusCode = httpStatusCode;
  }
}

class NotFoundException extends ApplicationException {
  constructor(message) {
    super(404, message);
    this.name = 'NotFoundException';
  }
}

module.exports = {
  ApplicationException : ApplicationException,
  NotFoundException : NotFoundException
};
