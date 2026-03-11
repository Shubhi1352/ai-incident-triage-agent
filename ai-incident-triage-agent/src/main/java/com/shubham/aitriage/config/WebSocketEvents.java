package com.shubham.aitriage.config;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
public class WebSocketEvents {
    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event){
        System.out.println("SUBSCRIBE RECIEVED: "+event.getMessage());
    }

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event){
        System.out.println("CONNECT RECIEVED");
    }
}
