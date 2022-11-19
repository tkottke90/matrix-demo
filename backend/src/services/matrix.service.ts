import { Container, Injectable, InjectionToken } from '@decorators/di';
import {
  createClient,
  ClientEvent,
  RoomEvent,
  IContent,
  MatrixClient
} from 'matrix-js-sdk';
import { logger } from 'matrix-js-sdk/lib/logger';

logger.setLevel('silent');

function GetUserCredentials() {
  return {
    id: 1,
    displayName: 'Dungeon Master',
    matrixLogin: { user: '@dm_user:my.matrix.host', password: 'gameon' }
  };
}

@Injectable()
export class MatrixService {
  private client;
  private connections: Map<string, MatrixClient> = new Map();

  constructor() {
    // this.connections = new Cache({ stdTTL: 60 * 60 * 12 /* Twelve Hours */ });
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
      user: 'service_user2',
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
    return this.client.register(username, password, null, { type: 'email' });
  }

  createRoom(roomName: string) {
    return this.client.createRoom({ name: roomName });
  }

  async userLogin(userId: string) {
    // Here we are "getting the users credentials from storage"
    const user = GetUserCredentials();

    // Create a new client
    const client = createClient({ baseUrl: 'http://localhost:8008' });
    await client.login('m.login.password', user.matrixLogin);

    this.connections.set(userId, client);

    return client;
  }

  async enterRoom(roomId: string, userId: string) {
    await this.client.invite(roomId, userId);
  }

  sendMessage(userId: string, roomId: string, message: string) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      let client = this.connections.get(userId);

      if (!client) {
        client = await this.userLogin(userId);
      }

      const content: IContent = {
        body: message,
        msgtype: 'm.text'
      };

      // This client is tied directly to the server
      client
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
