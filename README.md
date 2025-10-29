# LetsConnect - P2P Video Conferencing

LetsConnect is a peer-to-peer video conferencing application built with React and WebRTC. It allows users to create and join meeting rooms for real-time video and audio communication.

## Features

- Peer-to-peer video and audio communication
- Create and join meeting rooms
- Chat functionality within meeting rooms
- Mute/unmute microphone
- Turn on/off camera
- Screen sharing (planned)

## Technologies Used

- React
- TypeScript
- WebRTC
- Vite (for development)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or Yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sagarmemane135/LetsConnect.git
   cd LetsConnect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000/`.

### Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be located in the `dist` directory.

## Deployment

### Docker

To build the Docker image:

```bash
docker build -t letsconnect .
```

To run the Docker container:

```bash
docker run -p 80:80 letsconnect
```

The application will be available at `http://localhost:80/`.

### GitHub Pages CI/CD

This section will detail the GitHub Actions workflow for deploying the application to GitHub Pages.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

[Specify your license here, e.g., MIT License]
