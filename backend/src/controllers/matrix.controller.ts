import { Inject } from '@decorators/di';
import { Body, Controller, Get, Next, Post, Response } from '@decorators/express';
import express from 'express';
import pgk from '../../package.json';
import { LoggerService, MatrixService } from '../services';

@Controller('/matrix')
export class MatrixController {

  constructor(
    @Inject(MatrixService) private readonly matrixService: MatrixService
  ) {}

  @Get('/')
  getRoot(@Response() res: express.Response) {
    
    res.json({ token: this.matrixService.accessToken });
  }

  @Get('/rooms')
  getRooms(@Response() res: express.Response) {


    res.json({ rooms: this.matrixService.rooms })
  }

  @Post('/rooms')
  async createRoom(
    @Body() body: { roomName: string },
    @Response() res: express.Response,
    @Next() next: express.NextFunction
  ) {
    try {
      const newRoom = await this.matrixService.createRoom(body.roomName);

      res.json({ roomId: newRoom.room_id })
    } catch (error) {
      next(error);
    }
  }

  @Post('/message')
  async sendMessage(
    @Body() body: { roomId: string, message: string },
    @Response() res: express.Response,
    @Next() next: express.NextFunction
  ) {
    try {
      LoggerService.log('info', 'Sending new message', { ...body })
      await this.matrixService.sendMessage(body.roomId, body.message);

      res.json({ message: 'Success' });
    } catch (error) {
      next(error)
    }
  }
}
