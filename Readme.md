# Video Platform Backend

This is the backend for a video platform application. It provides APIs for user authentication, video management, comments, likes, subscriptions, and more.

## Project Structure


## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd video-platform-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```
    MONGODB_URI=<your-mongodb-uri>
    PORT=<your-port>
    =<CORS_ORIGINyour-cors-origin>
    ACCESS_TOKEN_SECRET=<your-access-token-secret>
    ACCESS_TOKEN_EXPIRY=<your-access-token-expiry>
    REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
    REFRESH_TOKEN_EXPIRY=<your-refresh-token-expiry>
    CLOUDINARY_NAME=<your-cloudinary-name>
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
    CLOUDINARY_SECRET=<your-cloudinary-secret>
    ```

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```

2. The server will start on the port specified in the `.env` file. You can access the APIs at `http://localhost:<port>/api/v1`.

## API Endpoints

### User Routes

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login a user
- `POST /api/v1/users/logout` - Logout a user
- `POST /api/v1/users/refresh-token` - Refresh access token
- `POST /api/v1/users/change-password` - Change user password
- `GET /api/v1/users/current-user` - Get current user details
- `PATCH /api/v1/users/update-account` - Update user account details
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/update-cover-image` - Update user cover image
- `GET /api/v1/users/channel/:username` - Get user channel profile
- `GET /api/v1/users/watch-history` - Get user watch history

### Video Routes

- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload a new video
- `GET /api/v1/videos/:id` - Get video details
- `PATCH /api/v1/videos/:id` - Update video details
- `DELETE /api/v1/videos/:id` - Delete a video

### Comment Routes

- `GET /api/v1/comments` - Get all comments
- `POST /api/v1/comments` - Add a new comment
- `GET /api/v1/comments/:id` - Get comment details
- `PATCH /api/v1/comments/:id` - Update comment details
- `DELETE /api/v1/comments/:id` - Delete a comment

### Like Routes

- `POST /api/v1/likes` - Like a video or comment
- `DELETE /api/v1/likes/:id` - Unlike a video or comment

### Subscription Routes

- `POST /api/v1/subscriptions` - Subscribe to a channel
- `DELETE /api/v1/subscriptions/:id` - Unsubscribe from a channel

### Playlist Routes

- `GET /api/v1/playlist` - Get all playlists
- `POST /api/v1/playlist` - Create a new playlist
- `GET /api/v1/playlist/:id` - Get playlist details
- `PATCH /api/v1/playlist/:id` - Update playlist details
- `DELETE /api/v1/playlist/:id` - Delete a playlist

### Tweet Routes

- `GET /api/v1/tweets` - Get all tweets
- `POST /api/v1/tweets` - Create a new tweet
- `GET /api/v1/tweets/:id` - Get tweet details
- `PATCH /api/v1/tweets/:id` - Update tweet details
- `DELETE /api/v1/tweets/:id` - Delete a tweet

### Dashboard Routes

- `GET /api/v1/dashboard` - Get dashboard data

### Healthcheck Routes

- `GET /api/v1/healthcheck` - Check API health


