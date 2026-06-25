import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private gpsService: GpsService) {}

  afterInit() {
    console.log('GPS WebSocket gateway initialized');
  }

  @SubscribeMessage('join-trip')
  handleJoinTrip(@ConnectedSocket() client: Socket, @MessageBody() data: { tripId: string }) {
    client.join(`trip:${data.tripId}`);
    return { event: 'joined', data: { tripId: data.tripId } };
  }

  @SubscribeMessage('location-update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string; lat: number; lng: number; timestamp: string },
  ) {
    await this.gpsService.storePosition(data.tripId, data.lat, data.lng);
    this.server.to(`trip:${data.tripId}`).emit('trip-location', {
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    return { event: 'ack' };
  }

  async broadcastTripStatus(tripId: string, status: string) {
    this.server.to(`trip:${tripId}`).emit('trip-status', { status });
  }
}
