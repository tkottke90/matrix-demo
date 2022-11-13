import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../services';

export function ErrorLogger(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  LoggerService.error(error);

  next(error);
}

export function ErrorResponder(
  error: Record<string, any>,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (error.type === 'redirect') {
    return response.redirect('/error');
  } else if (error.code) {
    response.status(error.code).send(error);
  } else {
    next(error);
  }
}

export function SafeErrorHandler(
  error: Record<string, any>,
  request: Request,
  response: Response,
  next: NextFunction
) {
  response.status(500).send(error);
}
