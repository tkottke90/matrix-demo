import { Container, Injectable, InjectionToken } from '@decorators/di';
import { createClient, ClientEvent, RoomEvent, IContent, EventType } from 'matrix-js-sdk';

@Injectable()
export class MatrixService {
  private client;

  constructor() {
    this.client = createClient({ baseUrl: 'http://localhost:8008' });
    this.login()
      .then(() => {
        this.client.startClient();

        this.client.once(ClientEvent.Sync, (state, prevState, res) => {
          console.log(state); // state will be 'PREPARED' when the client is ready to use
        });;

        this.client.on(RoomEvent.Timeline, function(event, room, toStartOfTimeline) {
          console.log('======================');
          console.log('RoomEvent Timeline:')
          console.dir(event.event);

          console.log('======================');
      });
      }); 
  }

  private login() {
    return this.client
      .login('m.login.password', { user: 'ROOT', password: 'password 1' });
  }

  get accessToken() {
    return this.client.getAccessToken();
  }

  get rooms() {
    return this.client.getRooms();
  }

  createRoom(roomName: string) {
    return this.client.createRoom({ name: roomName })
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
])