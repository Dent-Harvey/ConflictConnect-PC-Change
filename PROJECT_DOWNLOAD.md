# Project Download Information

## Project Details
- **Project Name**: Conflict Intelligence & Resource Allocation App
- **Type**: React Native Expo Application
- **Project ID**: 4e5617ee-08cd-4dcb-be30-a0923ebd5e6c
- **Framework**: Expo SDK 53, React Native 0.79.4

## Project Description
This is a mobile application built with React Native and Expo that provides real-time conflict intelligence and resource allocation capabilities. The app includes:

### Key Features
- **Conflict Zone Monitoring**: Real-time tracking of conflicts, wars, and famines worldwide
- **Interactive Maps**: Visual representation of conflict zones with detailed markers
- **Resource Management**: Track and allocate humanitarian resources
- **Needs Assessment**: Identify and manage resource needs in affected areas  
- **Intelligence Sources**: Integration with UN sources and think tanks like Institute for the Study of War
- **Multi-language Support**: Internationalization with react-i18next
- **Offline Capabilities**: Data persistence with AsyncStorage

### Technical Stack
- **Frontend**: React Native 0.79.4, Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand, TanStack Query, React Context
- **Database**: 9gen Database API integration
- **Maps**: React Native Maps
- **Forms**: React Hook Form with Zod validation
- **Styling**: Custom theme system with TypeScript
- **Animations**: React Native Reanimated
- **Testing**: ESLint, TypeScript type checking

### Project Structure
```
apps/expo-app/
├── app/                    # Expo Router pages
├── components/             # Reusable UI components  
├── hooks/                  # Custom React hooks
├── services/              # API service layers
├── entities/              # Database entity schemas
├── theme/                 # Theme and styling system
├── i18n/                  # Internationalization
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions
└── assets/                # Images, fonts, icons
```

## Download Instructions

### Option 1: Manual File Export
Since this project doesn't have a GitHub repository, you'll need to:

1. **Export from your development environment**:
   - If using VS Code or similar IDE, use "Export Project" or "Archive Project"
   - Create a ZIP archive of the entire `apps/expo-app` directory
   - Exclude `node_modules/` and `.expo/` directories to reduce size

2. **Essential files to include**:
   - All source code in `app/`, `components/`, `hooks/`, `services/`
   - Configuration files: `package.json`, `app.json`, `9gen_config.json`
   - Assets in `assets/` directory
   - Entity schemas in `entities/`
   - Theme and styling in `theme/`

### Option 2: Create GitHub Repository
To make this project easily shareable:

1. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Conflict Intelligence App"
   ```

2. **Create GitHub repository**:
   - Go to [github.com](https://github.com) and create new repository
   - Follow GitHub's instructions to push existing code

3. **Add repository info to package.json**:
   ```json
   {
     "repository": {
       "type": "git",
       "url": "https://github.com/yourusername/conflict-intelligence-app.git"
     },
     "homepage": "https://github.com/yourusername/conflict-intelligence-app#readme"
   }
   ```

## Installation Instructions

### Prerequisites
- Node.js 18+ 
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio (for Android development)

### Setup Steps
1. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

2. **Start development server**:
   ```bash
   npm start
   # or
   expo start
   ```

3. **Run on device**:
   - Download Expo Go app on your mobile device
   - Scan QR code from terminal
   - Or use iOS Simulator / Android Emulator

### Environment Setup
- Ensure `9gen_config.json` contains your project ID
- Database API endpoints are configured for https://api.9gen.dev
- Font files are properly loaded in `_layout.tsx`

## Key Dependencies
- **expo**: ~53.0.13 - Core Expo SDK
- **react-native**: 0.79.4 - React Native framework  
- **@tanstack/react-query**: ^5.81.2 - Server state management
- **react-native-maps**: 1.20.1 - Map integration
- **react-hook-form**: ^7.62.0 - Form handling
- **zod**: ^4.1.5 - Schema validation
- **zustand**: ^5.0.6 - State management
- **react-native-reanimated**: ~3.17.4 - Animations

## Development Notes
- Uses Expo managed workflow
- TypeScript throughout the project
- Custom theme system with dark/light mode support
- Real data integration (no mock data)
- Entity-based database architecture
- Comprehensive error handling with custom errorHandler utility

## Support & Documentation
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **9gen Database API**: Contact project maintainers for API documentation

---
**Last Updated**: January 2025  
**Version**: 1.0.0