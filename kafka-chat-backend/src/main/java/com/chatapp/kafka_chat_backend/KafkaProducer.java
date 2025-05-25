package com.chatapp.kafka_chat_backend;

import com.chatapp.kafka_chat_backend.models.Model;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {
    private final KafkaTemplate<String, Model> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String, Model> kafkaTemplate){
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(Model msg, String type) {
        if (type.equalsIgnoreCase("Public")) {
            kafkaTemplate.send("public-chat", msg);
        } else {
            if (msg.getReceiver() == null || msg.getReceiver().isEmpty()) {
                throw new IllegalArgumentException("Private message must have a recipient");
            }
            kafkaTemplate.send("private-chat", msg);
        }
    }
    
}
