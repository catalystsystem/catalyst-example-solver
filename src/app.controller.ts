import { Controller, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RawData, WebSocket } from "ws";
import { CatalystEvent, CatalystOrder } from "./types";

import { handleVmOrder } from "./handlers/vm-order.handler";
import { CatalystWsEvent, CommonWsEvent } from "./types/events";

@Controller()
export class AppController implements OnModuleInit {
  constructor(private config: ConfigService) {}
  private ws: WebSocket;
  private reconnectInterval = 5000; // Reconnect interval in milliseconds

  async onModuleInit() {
    await this.listenToOrderServer();
  }

  async listenToOrderServer() {
    const wsUri = this.config.getOrThrow("ORDER_SERVER_WS_URI");
    const apiKey = this.config.getOrThrow("ORDER_SERVER_API_KEY");

    this.ws = new WebSocket(wsUri, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    this.ws.on("open", () => {
      console.log("Connected to WebSocket server");
    });

    this.ws.on("message", (data: RawData) => {
      try {
        const parsedData: CatalystEvent<unknown> = JSON.parse(data.toString());
        switch (parsedData.event) {
          case CommonWsEvent.PING:
            this.handleReceivePing();
            break;
          case CatalystWsEvent.USER_ORDER_VM:
            console.log(`[${CatalystWsEvent.USER_ORDER_VM}]`, parsedData);
            handleVmOrder(parsedData as CatalystEvent<CatalystOrder>);
            break;
          default:
            console.log("Unknown message type:", parsedData);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    this.ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });

    this.ws.on("close", async () => {
      console.error("Disconnected from WebSocket");
      await this.reconnect();
    });
  }

  async reconnect() {
    console.log("Attempting to reconnect...");
    setTimeout(async () => {
      this.ws.close();
      await this.listenToOrderServer();
    }, this.reconnectInterval);
  }

  async handleReceivePing() {
    this.ws.send(
      JSON.stringify({
        event: CommonWsEvent.PONG,
      }),
    );
  }
}
