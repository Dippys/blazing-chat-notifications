# Discord Message Sender API

This API allows developers to send direct messages to users in a Discord guild, including embedded content and interactive buttons. 

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Discord Bot Token**: Obtain a bot token from the Discord Developer Portal.
- **API Key**: A key to authenticate your requests.
- **Guild ID**: The ID of the Discord server where the bot operates.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-repo-url.git
    cd your-repo-directory
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:

    ```env
    DISCORD_TOKEN=your_discord_bot_token
    PORT=your_server_port
    API_KEY=your_api_key
    GUILD_ID=your_discord_guild_id
    ```

4. Start the server:

    ```bash
    npm start
    ```

## API Endpoints

### **GET /**

**Description**: Returns a simple message to verify that the server is running.

**Request:**

```
GET / HTTP/1.1
Host: your-server-url:PORT
```

**Response:**

```json
{
  "message": "Never gonna give you up"
}
```

### **POST /send-message**

**Description**: Sends a direct message to a Discord user with embedded content and a button.

**Request:**

```
POST /send-message HTTP/1.1
Host: your-server-url:PORT
Content-Type: application/json
x-api-key: your_api_key

{
  "member": "user_id_or_username",
  "orderID": "your_order_id",
  "message": "Your message content",
  "url": "http://example.com"
}
```

**Parameters:**

- `member` (string): The Discord user ID or username of the member to send the message to.
- `orderID` (string): The order ID related to the message.
- `message` (string): The content of the message to send.
- `url` (string): The URL to include in the embedded content and button.

**Response:**

- **200 OK**: Message sent successfully.

    ```json
    {
      "message": "Message sent successfully"
    }
    ```

- **400 Bad Request**: Missing required parameters or parameters are too long.

    ```json
    {
      "message": "Missing required parameters"  // or "Parameters are too long"
    }
    ```

- **401 Unauthorized**: Invalid API key.

    ```json
    {
      "message": "Unauthorized"
    }
    ```

- **404 Not Found**: Member not found.

    ```json
    {
      "message": "Member not found"
    }
    ```

- **500 Internal Server Error**: Unexpected error occurred.

    ```json
    {
      "message": "Internal server error"
    }
    ```

## Implementation Details

### Middleware

- **JSON Parsing**: The server uses `express.json()` to parse JSON request bodies.
- **API Key Authentication**: Requests are authenticated using the `x-api-key` header. If the key does not match the one in the environment variables, a `401 Unauthorized` response is sent.

### Error Handling

- **Environment Variables**: The server checks for the presence of required environment variables (`DISCORD_TOKEN`, `PORT`, `API_KEY`, and `GUILD_ID`) at startup. If any are missing, an error is thrown.
- **Parameter Validation**: Parameters for the `/send-message` endpoint are validated to ensure they are present and not exceeding 2000 characters. If any parameter is missing or too long, a `400 Bad Request` response is sent.
- **Member Lookup**: Members are looked up by either ID or username. If the member is not found, a `404 Not Found` response is sent.

### Discord.js Integration

- **Client Initialization**: The `discord.js` client is initialized with necessary intents and partials.
- **Message Sending**: Messages are sent to users via direct messages. The message includes an embedded message and a button linking to the provided URL.

## Example Usage

Here is an example of how to use the API with `axios` in a Node.js application:

```javascript
const axios = require('axios');

const apiUrl = 'http://your-server-url:PORT/send-message';
const apiKey = 'your_api_key';

const sendMessage = async (member, orderID, message, url) => {
    try {
        const response = await axios.post(apiUrl, {
            member: member,
            orderID: orderID,
            message: message,
            url: url
        }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

// Usage
sendMessage('user_id_or_username', 'order123', 'Your order has been updated.', 'http://example.com');
```

## Security Considerations

- **API Key Management**: Securely manage and store your API keys. Do not expose them in client-side code or public repositories.
- **Rate Limiting**: Implement rate limiting to prevent abuse and ensure fair use of the API.

## Troubleshooting

- **Invalid API Key**: Verify the `x-api-key` header is correct and matches the key in your environment variables.
- **Member Not Found**: Ensure that the `member` parameter is a valid Discord user ID or username and that the bot has necessary permissions in the guild.

## Contact

For support, please contact me privately.
