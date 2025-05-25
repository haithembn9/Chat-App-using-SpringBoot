package com.chatapp.kafka_chat_backend.config;

import com.chatapp.kafka_chat_backend.models.Model;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate template;

    
    private static final Set<String> onlineUsers = Collections.synchronizedSet(new HashSet<>());

    public WebSocketController(SimpMessagingTemplate template) {
        this.template = template;
    }

    @MessageMapping("/private")
    public void sendPrivateMessage(Model msg) {
        template.convertAndSendToUser(msg.getReceiver(), "/queue/messages", msg);
    }

    @MessageMapping("/chat.join")
    public void join(Model msg, Principal principal) {
        String username = principal.getName();
        onlineUsers.add(username);

        
        template.convertAndSendToUser(username, "/queue/online-users", onlineUsers);


        template.convertAndSend("/topic/online-users", onlineUsers);


        Model systemMessage = new Model();
        systemMessage.setType("public");
        systemMessage.setUser("System");
        systemMessage.setMessage(username + " joined the chat");
        template.convertAndSend("/topic/public", systemMessage);
    }




    public static void removeUser(String username, SimpMessagingTemplate template) {
        onlineUsers.remove(username);
        template.convertAndSend("/topic/online-users", onlineUsers);

        Model systemMessage = new Model();
        systemMessage.setType("public");
        systemMessage.setUser("System");
        systemMessage.setMessage(username + " left the chat");
        template.convertAndSend("/topic/public", systemMessage);
    }
}
