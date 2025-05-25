"use client";

import React, { useState, useEffect, useRef } from "react";
import NavBar from "./components/ui/NavBar";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
  user: string;
  receiver?: string;
  message: string;
  type: string;
  fromMe: boolean;
  id: number;
  messageId?: string;
}

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Public");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const stompClient = useRef<Client | null>(null);

  const selectedChatRef = useRef<string | null>(selectedChat);
  const selectedTabRef = useRef<string>(selectedTab);
  const usernameRef = useRef<string | null>(username);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    selectedTabRef.current = selectedTab;
  }, [selectedTab]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let name = prompt("Please enter your username");
    while (!name || name.trim() === "") {
      name = prompt("Username cannot be empty. Please enter your username");
    }
    setUsername(name.trim());
  }, []);

  useEffect(() => {
    if (selectedTab === "Private") {
      if (!selectedChat && onlineUsers.length > 0) {
        setSelectedChat(onlineUsers[0]);
      } else if (selectedChat && !onlineUsers.includes(selectedChat)) {
        setSelectedChat(onlineUsers[0] || null);
      }
    } else {
      setSelectedChat(null);
    }
  }, [selectedTab, onlineUsers, selectedChat]);

  useEffect(() => {
    if (!username) return;

    const socket = new SockJS(`http://192.168.100.19:8080/ws?username=${username}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      onConnect: () => {
        client.publish({
          destination: "/app/chat.join",
          body: JSON.stringify({ user: username }),
        });

        client.subscribe("/topic/public", (message) => {
          const msg: Message = JSON.parse(message.body);
          setMessages((prev) => {
            const exists = msg.messageId ? prev.find((m) => m.messageId === msg.messageId) : false;
            if (exists) return prev;
            return [
              ...prev,
              { ...msg, fromMe: msg.user === usernameRef.current, id: Date.now() + Math.random() },
            ];
          });
        });

        client.subscribe("/user/queue/messages", (message) => {
          const msg: Message = JSON.parse(message.body);
          setMessages((prev) => {
            const exists = msg.messageId ? prev.find((m) => m.messageId === msg.messageId) : false;
            if (exists) return prev;
            return [
              ...prev,
              { ...msg, fromMe: msg.user === usernameRef.current, id: Date.now() + Math.random() },
            ];
          });

          if (
            selectedTabRef.current === "Private" &&
            usernameRef.current &&
            msg.receiver === usernameRef.current &&
            selectedChatRef.current !== msg.user
          ) {
            setSelectedChat(msg.user);
          }
        });

        client.subscribe("/topic/online-users", (message) => {
          const users: string[] = JSON.parse(message.body);
          setOnlineUsers(users.filter((user) => user !== usernameRef.current));
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
      },
      onWebSocketClose: (event) => {
        console.warn("WebSocket closed:", event);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [username]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only image files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", username!);
    formData.append("type", selectedTab);
    if (selectedTab === "Private") {
      formData.append("receiver", selectedChat!);
    }

    try {
      await fetch("http://192.168.100.19:8080/chat/upload", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerFileSelect() {
    fileInputRef.current?.click();
  }

  function sendMessage() {
    if (input.trim() === "") return;

    const message: Omit<Message, "fromMe" | "id"> = {
      user: username!,
      message: input.trim(),
      type: selectedTab,
      receiver: selectedTab === "Private" ? selectedChat! : undefined,
    };

    fetch("http://192.168.100.19:8080/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
      .then(() => setInput(""))
      .catch((err) => console.error("Error sending message:", err));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  const filteredMessages = messages.filter((msg) => {
    if (!msg.type) return false;

    if (selectedTab === "Public" && msg.type.toLowerCase() === "public") return true;

    if (selectedTab === "Private" && msg.type.toLowerCase() === "private") {
      if (!selectedChat) return false;

      const userIsSender = msg.user === username;
      const userIsReceiver = msg.receiver === username;
      const selectedIsSender = msg.user === selectedChat;
      const selectedIsReceiver = msg.receiver === selectedChat;

      return (
        (userIsSender && selectedIsReceiver) ||
        (selectedIsSender && userIsReceiver)
      );
    }

    return false;
  });

  if (!username) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-xl">Please enter your username...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <NavBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <main className="flex flex-1 bg-slate-200">
        {selectedTab === "Private" && (
          <div className="w-64 p-4">
            <h1 className="font-sans">Online users</h1>
            <div className="border-t border-gray-300 mt-2 mb-2"></div>
            <div className="flex flex-col gap-2">
              {onlineUsers.map((user) => (
                <button
                  key={user}
                  onClick={() => setSelectedChat(user)}
                  className={`text-left font-sans px-2 py-1 rounded-md w-full h-12 transition ${
                    selectedChat === user
                      ? "bg-green-100 text-green-800 font-semibold"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {user}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col flex-grow w-full">
          <div className="p-2 flex justify-between items-center">
            <h1 className="text-gray-800 font-semibold font-sans text-lg">
              Chat App - {selectedTab}
              {selectedTab === "Private" && selectedChat ? ` with ${selectedChat}` : ""}
            </h1>

            <button
              onClick={triggerFileSelect}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Upload file
            </button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/gif"
            />
          </div>

          <div className="flex-grow overflow-auto p-2 bg-white shadow-inner">
            {filteredMessages.length === 0 && (
              <p className="text-center text-gray-400 mt-10 font-sans">
                No messages to display.
              </p>
            )}

            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex flex-col max-w-xl rounded-md p-2 ${
                  msg.user === "System"
                    ? "bg-yellow-100 text-center mx-auto italic text-gray-700"
                    : msg.fromMe
                    ? "bg-green-200 ml-auto rounded-tr-none"
                    : "bg-gray-200 mr-auto rounded-tl-none"
                }`}
              >
                {msg.user !== "System" && (
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    {msg.user}
                  </div>
                )}
                {/\.(png|jpe?g|gif)$/i.test(msg.message) && msg.message.startsWith("http") ? (
                  <img
                    src={msg.message}
                    alt="uploaded"
                    className="max-w-xs max-h-64 object-contain rounded"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex p-2 bg-slate-100">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow rounded border border-gray-300 p-2"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              value={input}
            />
            <button
              onClick={sendMessage}
              className="bg-green-400 hover:bg-green-600 text-white px-4 rounded ml-2"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
