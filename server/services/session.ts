import {Request, Response} from 'express';

export class Session {
  constructor(private req: Request, private res: Response) {}
}
