type Response<T = any> = {
  code: number;
  data?: T;
  message: string;
};

export class ResponseError extends Error {
  data;
  constructor(data: unknown, message: string) {
    super('ResponseError');
    this.data = data;
    this.message = message;
  }

  public toString = () =>
    JSON.stringify({
      data: this.data,
      message: this.message,
    });
}

class Reply {
  static promise = async <T>(v: Promise<T>): Promise<Response<T>> =>
    v
      .then((res) => this.success(res))
      .catch((err) =>
        err instanceof ResponseError
          ? this.errorWithData(err.data, err.message)
          : this.errorWithData(err),
      );

  static result = (data: Response): Response => data;

  static success = (data?: unknown, message = 'success'): Response => ({
    code: 0,
    data,
    message,
  });

  static error = (message = 'error'): Response => ({
    code: -1,
    message,
  });

  static errorWithData = (data?: unknown, message = 'error'): Response => ({
    code: -1,
    data,
    message,
  });
}

export default Reply;
