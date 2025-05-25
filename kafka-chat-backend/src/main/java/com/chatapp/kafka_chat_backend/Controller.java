package com.chatapp.kafka_chat_backend;
import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.chatapp.kafka_chat_backend.models.Model;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/chat")
public class Controller {
    private final KafkaProducer producer;

    public Controller(KafkaProducer producer) {
        this.producer = producer;
    }

    @PostMapping("/send")
    public String send(@RequestBody Model msg) {
        producer.send(msg, msg.getType());
        return msg.getUser() + ": " + msg.getMessage();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("user") String user,
            @RequestParam("type") String type,
            @RequestParam(value = "receiver", required = false) String receiver) {
        try {
            System.out.println("Uploading file: " + file.getOriginalFilename());
            System.out.println("User: " + user);
            System.out.println("Type: " + type);
            System.out.println("Receiver: " + receiver);

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get("uploads/" + filename);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "http://localhost:8080/uploads/" + filename;

            Model msg = new Model();
            msg.setUser(user);
            msg.setType(type);
            msg.setReceiver(receiver);
            msg.setMessage(fileUrl);

            producer.send(msg, type);

            System.out.println("File uploaded successfully: " + fileUrl);

            return ResponseEntity.ok(msg);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("file upload failed");
        }
    }

}
