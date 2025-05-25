package com.chatapp.kafka_chat_backend;

import com.chatapp.kafka_chat_backend.models.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumer {

    private final SimpMessagingTemplate template;

    @Autowired
    public KafkaConsumer(SimpMessagingTemplate template) {
        this.template = template;
    }

    @KafkaListener(topics = "public-chat", groupId = "chat-group")
    public void listenPublic(Model msg) {
        System.out.println("Received message from Kafka: " + msg);
        template.convertAndSend("/topic/public", msg);
    }

    @KafkaListener(topics = "private-chat", groupId = "chat-group")
public void listenPrivate(Model msg) {
    System.out.println("Private message received for user: " + msg.getReceiver() + ": " + msg.getMessage());
    template.convertAndSendToUser(msg.getReceiver(), "/queue/messages", msg);
    template.convertAndSendToUser(msg.getUser(), "/queue/messages", msg);
}


}
