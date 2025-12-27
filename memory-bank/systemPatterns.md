# System Patterns: Onyx

## System Architecture

The application follows a standard React Native / Expo architecture with a focus on modularity and clear separation of concerns.

## Key Technical Decisions

- **Context API for State:** Used for managing global state like User, Habits, and Theme. This avoids the complexity of Redux for a project of this scale.
- **Service-Oriented Hooks:** Logic for data fetching, habit management, and monetization is likely encapsulated in hooks or specialized contexts.
- **Component Localization:** All strings are externalized into `src/i18n` for multi-language support.

## Project Structure

- `src/context/`: Contains React Context providers for global state.
- `src/navigation/`: Navigation configuration using React Navigation.
- `src/screens/`: Individual UI screens (Dashboard, Focus, Settings, etc.).
- `src/config/`: App-wide configurations (Firebase, API keys).
- `src/i18n/`: Translation files for the 7 supported languages.
- `src/theme/`: Global theme definitions for Light and Dark modes.
- `src/ads/`: AdMob integration logic.

## Design Patterns

- **Provider Pattern:** Using Context Providers at the root of the app (`App.js`) to share data across components.
- **Atomic-ish Components:** Complex screens are broken down into smaller, reusable parts within their respective screen directories (or a separate `components` folder if it exists).
- **Observable Patterns:** Local storage updates often trigger state updates in the Context.
