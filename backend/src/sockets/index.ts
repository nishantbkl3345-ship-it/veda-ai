import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initSockets(ioServer: SocketIOServer): void {
  io = ioServer;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("join:assignment", (assignmentId: string) => {
      if (typeof assignmentId !== "string" || !assignmentId.trim()) {
        socket.emit("error", { message: "Invalid assignmentId" });
        return;
      }
      socket.join(assignmentId);
      console.log(`📡 ${socket.id} joined room ${assignmentId}`);
    });

    socket.on("leave:assignment", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId.trim()) {
        socket.leave(assignmentId);
        console.log(`📡 ${socket.id} left room ${assignmentId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialised — call initSockets() first");
  }
  return io;
}

