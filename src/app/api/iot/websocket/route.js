import { NextRequest } from 'next/server';

export async function GET(request) {
  // This route is handled by the WebSocket server
  // The actual WebSocket connection is established at /api/iot/websocket
  return new Response('WebSocket endpoint - connect via ws://your-domain:3000/api/iot/websocket', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}