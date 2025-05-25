package com.chatapp.kafka_chat_backend.config;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    @Override
protected Principal determineUser(ServerHttpRequest request,
                                  WebSocketHandler wsHandler,
                                  Map<String, Object> attributes) {
    String query = request.getURI().getQuery(); 
    String user = "anon-" + UUID.randomUUID(); 

    if (query != null) {
        for (String param : query.split("&")) {
            if (param.startsWith("username=")) {
                user = param.substring("username=".length());
                break;
            }
        }
    }

    final String username = user;  

    System.out.println("[HandshakeHandler] Assigning user: " + username);
    return () -> username;
}

}
