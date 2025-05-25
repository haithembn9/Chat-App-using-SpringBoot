💬 Kafka-Based Chat App
This is a Next.js + Spring Boot chat application that uses Kafka for real-time message delivery.

🚀 Getting Started
🔧 Frontend (Next.js)
Start the development server:

bash
Copy code
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Then, open your browser and navigate to:

http://localhost:3000

Or access it via network: http://<YOUR-IP>:3002

⚙️ Edit the page at app/page.tsx — it auto-updates on save.

This project uses next/font with Geist, a modern font from Vercel.

☕ Backend (Spring Boot)
Run the backend server:

bash
Copy code
./mvnw spring-boot:run
Make sure Kafka is running before starting the backend.

🐳 Kafka via Docker
To start Kafka with Docker:

bash
Copy code
docker-compose build
docker-compose up -d
This will spin up Kafka and Zookeeper in detached mode.

⚠️ Configuration Note
Don't forget to update your machine IP address in:

The frontend app configuration

The Spring Boot backend

The Kafka Docker setup

Using localhost may not work across Docker containers or devices on your network
