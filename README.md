# Chat Application Backend

This project serves as the backend for the **Personal Anonymous Chats** application. It provides a simple and secure chat platform using Express.js for server management and SQLite3 for database storage. This backend is responsible for creating and managing chat rooms, handling user connections, and facilitating real-time communication between users.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

## Installation

1. **Clone the Repository:**

    ```sh
    git clone https://github.com/your-username/chat-application.git
    cd chat-application
    ```

2. **Install Dependencies:**

   Navigate to the project directory and install the required npm packages:

    ```sh
    npm install
    ```

3. **Set Up the SQLite Database:**

   Create the necessary SQLite database and tables by running the following command:

    ```sh
    node -e "require('./config/database').createTables().then(() => console.log('Tables created')).catch(console.error)"
    ```

## Running the Project

1. **Start the Server:**

   Start the Express.js server by running:

    ```sh
    npm start
    ```

2. **Access the Server:**

   The server will be running at `http://localhost:3000`. You can use this URL to interact with the API or connect your frontend application to the backend.

## Docker Setup
1. **Docker Setup:**

   Pull the Docker image from Docker Hub:

    ```sh
    docker pull inginer/p2p-backend:latest
    ```

   Run the Docker container with the necessary ports:

    ```sh
    docker run -p 3000:3000 -p 3478:3478 inginer/p2p-backend:latest
    ```


## API Endpoints

### 1. **Check Chat**

- **URL:** `/check-chat/:roomId`
- **Method:** `GET`
- **Description:** Checks if a chat room with the specified ID exists and whether it requires a PIN for access.
- **Response:**
    - `200 OK` with JSON `{ "pin": true/false }` indicating whether a PIN is required.
    - `404 Not Found` if the chat room does not exist.
    - `500 Internal Server Error` in case of server errors.

**Example Request:**

    ```sh
    curl -X GET http://localhost:3000/check-chat/room-id
    ```

### 2. **Create Chat**

- **URL:** `/create-chat`
- **Method:** `POST`
- **Description:** Creates a new chat room with an optional PIN for added security.
- **Request Body:**

  ```json
  {
      "withPin": true/false
  }
  ```

- **Response:**
    - `200 OK` with JSON `{ "roomId": "room-id", "pin": "pin" }` providing the unique room ID and the generated PIN (if any).
    - `500 Internal Server Error` in case of server errors.

**Example Request:**

    ```sh
    curl -X POST http://localhost:3000/create-chat -H "Content-Type: application/json" -d '{"withPin": true}'
    ```

## Project Purpose

This project is designed as the backend for **Personal Anonymous Chats**, a secure and private chat platform. The backend manages the creation of chat rooms, user authentication, and real-time messaging. It leverages SQLite3 for lightweight database storage and Express.js for robust server-side logic. The goal is to provide a reliable and secure environment for users to communicate anonymously.

## Privacy and Security

All communications within this platform, including text messages, audio, video, and files, are transmitted directly from person to person (peer-to-peer). None of the messages, media, or files are stored on the server or any other location. This ensures that your conversations remain private and secure, with no data being saved or accessible by third parties.

---

This README provides a comprehensive guide to setting up and running the chat application backend, ensuring that developers can easily understand the purpose, functionality, and privacy features of the project.
