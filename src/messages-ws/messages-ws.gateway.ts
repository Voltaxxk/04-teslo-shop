import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors : true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss : Server
  constructor(
    private readonly messagesWsService: MessagesWsService,

    private readonly jwtService : JwtService
  ) {
  }


  async handleConnection(client: Socket) {
    
    const token = client.handshake.headers.auth as string;

    // console.log(token)

    let payload : JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect();
      return; 
    }
    
    // console.log({payload})
    // console.log({conectados : this.messagesWsService.getConnectedClients()})
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())

  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())

  }

  @SubscribeMessage('message-front-client')
  onMessageFrontClient(client : Socket, payload : NewMessageDto){
    
    //Emite solo al cliente
    // client.emit('message-from-server', {
    //   fullName : 'Soy yo',
    //   message : payload.message || 'no-message!!!'
    // })


    //!Emitmir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName : 'Soy yo',
    //   message : payload.message || 'no-message!!!'
    // })

    this.wss.emit('message-from-server', {
      fullName : this.messagesWsService.getUserFullNameBySocketId(client.id),
      message : payload.message || 'no-message!!!'
    })

  }

}
