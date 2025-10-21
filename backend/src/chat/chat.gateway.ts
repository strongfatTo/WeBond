import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { taskId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`task_${data.taskId}`);
    return { event: 'joined_room', data: { taskId: data.taskId } };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { taskId: string; senderId: string; message: string },
  ) {
    const savedMessage = await this.chatService.saveMessage(data);
    
    this.server.to(`task_${data.taskId}`).emit('new_message', savedMessage);
    
    return { event: 'message_sent', data: savedMessage };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { taskId: string; userId: string; isTyping: boolean },
  ) {
    this.server.to(`task_${data.taskId}`).emit('user_typing', data);
  }
}

