import { Inject } from '@decorators/di';
import {
  Body,
  Controller,
  Get,
  Next,
  Post,
  Response
} from '@decorators/express';
import express from 'express';
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
    const rooms = this.matrixService.rooms;

    res.json({
      rooms: rooms.map((r) => ({
        id: r.roomId,
        summary: r.summary,
        memberCount: r.getJoinedMemberCount(),
        timeline: r.timeline
      }))
    });
  }

  @Post('/users')
  async registerUser(
    @Body() body: { username: string; password: string },
    @Response() res: express.Response,
    @Next() next: express.NextFunction
  ) {
    try {
      // Not working currently, registration disabled on the matrix server
      const newUser = await this.matrixService.createUser(
        body.username,
        body.password
      );

      res.json({ user: newUser.user_id });
    } catch (error) {
      next(error);
    }
  }

  @Post('/rooms')
  async createRoom(
    @Body() body: { roomName: string },
    @Response() res: express.Response,
    @Next() next: express.NextFunction
  ) {
    try {
      const newRoom = await this.matrixService.createRoom(body.roomName);

      res.json({ roomId: newRoom.room_id });
    } catch (error) {
      next(error);
    }
  }

  @Post('/message')
  async sendMessage(
    @Body() body: { roomId: string; message: string },
    @Response() res: express.Response,
    @Next() next: express.NextFunction
  ) {
    try {
      LoggerService.log('info', 'Sending new message', { ...body });
      await this.matrixService.sendMessage(body.roomId, body.message);

      res.json({ message: 'Success' });
    } catch (error) {
      next(error);
    }
  }
}
