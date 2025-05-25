package com.chatapp.kafka_chat_backend.models;

public class Model {
    private String user;
    private String receiver;
    private String message;
    private String type;
    private String fileUrl;

    public Model() {
    }

    public Model(String user, String message) {
        this.user = user;
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getfileUrl() {
        return fileUrl;
    }

    public void setfileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "From: " + user + ", To: " + receiver + ", Message: " + message;
    }

}
