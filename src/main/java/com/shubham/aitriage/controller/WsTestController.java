package com.shubham.aitriage.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WsTestController {
    private final SimpMessagingTemplate template;

    public WsTestController(SimpMessagingTemplate template){
        this.template = template;
    }

    @GetMapping("/ws-test")
    public String test(){
        System.out.println("Sending message to /topic/incidents/8");
        template.convertAndSend("/topic/incidents/8","HELLO_FROM_SERVER");
        return "sent";
    }

}
