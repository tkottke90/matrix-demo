import { Container, Injectable, InjectionToken } from '@decorators/di';
import { createClient, ClientEvent, RoomEvent, IContent } from 'matrix-js-sdk';
import { logger } from 'matrix-js-sdk/lib/logger';

logger.setLevel('silent');

@Injectable()
export class MatrixService {
  private client;

  constructor() {
    this.client = createClient({ baseUrl: 'http://localhost:8008' });
    this.login().then(() => {
      this.client.startClient();

      this.client.once(ClientEvent.Sync, (state, prevState, res) => {
        // console.log(state); // state will be 'PREPARED' when the client is ready to use
      });

      this.client.on(
        RoomEvent.Timeline,
        function (event, room, toStartOfTimeline) {
          // Uncomment these to see the room events
          // console.log('======================');
          // console.log('RoomEvent Timeline:')
          // console.dir(event.event);
          // console.log('======================');
        }
      );
    });
  }

  private login() {
    return this.client.login('m.login.password', {
      user: 'ROOT',
      password: 'password 1'
    });
  }

  get accessToken() {
    return this.client.getAccessToken();
  }

  get rooms() {
    return this.client.getRooms();
  }

  createUser(username: string, password: string) {
    return this.client.register(username, password, null, { type: 'test' });
  }

  createRoom(roomName: string) {
    return this.client.createRoom({ name: roomName });
  }

  sendMessage(roomId: string, message: string) {
    return new Promise<void>((resolve, reject) => {
      const content: IContent = {
        body: message,
        msgtype: 'm.text'
      };

      this.client
        .sendMessage(roomId, content)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

Container.provide([
  { provide: new InjectionToken('MatrixService'), useClass: MatrixService }
]);
