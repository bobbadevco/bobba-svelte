# nitro-svelte

Habbo Hotel Nitro client rebuilt in Svelte 5 / SvelteKit (SPA, no SSR).

## Setup

- Copy `static/renderer-config.json.example` → `static/renderer-config.json` (required)
- Copy `static/ui-config.json.example` → `static/ui-config.json` (required)
- Both are in `.gitignore` — agents must create them locally
- `engine-strict=true` in `.npmrc`

## Commands

| Command | Action |
|---|---|
| `npm run dev` | runs `check-configs.js` first, then `vite dev` |
| `npm run build` | `vite build` |
| `npm run check` | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json` |
| `npm run format` | `prettier --write .` |
| `npm run lint` | `prettier --check . && eslint .` |

Run `check` before committing — it catches type errors and Svelte issues.  
`lint` requires `check` to have been run first (generates `.svelte-kit` types).

## Architecture

- **SPA**: `src/routes/+layout.server.ts` exports `export const ssr = false`
- **Async components enabled**: `svelte.config.js` sets `compilerOptions.experimental.async: true`
- **Initialization**: `src/lib/initialize.svelte.ts` — bootstrap sequence, nitro-renderer event pipeline
- **Entrypoint**: `src/routes/+page.svelte` — calls `Nitro.bootstrap()`, dynamically loads theme's `LoadingView`/`MainView`
- **Logic layer**: `src/lib/components/logic/*.svelte` — script-only components that wire Nitro events to reactive state
- **View layer**: `src/lib/themes/{theme}/views/*` — purely presentational Svelte components
- **Theme system**: Theme name read from `ui-config.json` (`theme` key), dynamic `import()` in `+page.svelte`
- **Event system**: `src/lib/events/registration.ts` — typed wrappers around Nitro's `EventDispatcher` + custom UI event bus
- **API layer**: `src/lib/api/` — typed getter functions wrapping `@nitrots/nitro-renderer` singletons
- **Listeners**: `src/lib/listeners/` — register message events for specific subsystems (catalog, friends, etc.)
- **State**: Svelte 5 runes (`$state`, `$derived`) exposed via getter functions in `.svelte.ts` files

## Conventions

- Svelte 5 runes only — no legacy `$:`, `export let`, or `on:click` event handlers
- Prettier: tabs, single quotes, no trailing commas, printWidth 100, tailwindcss plugin sorts classes
- ESLint: `@typescript-eslint/no-unused-vars` on with `_` prefix ignore
- CSS cascade in `src/routes/app.css`: `tailwind.css` → `../lib/themes/themes.scss` → `../lib/assets/styles/main.scss` (relative paths, not `$lib` alias — `@tailwindcss/vite` doesn't resolve it)
- Logic components are Svelte files (for `onMount`/lifecycle) but render nothing visible
- All Nitro renderer imports from `@nitrots/nitro-renderer`
- `svelte-fa` for Font Awesome icons, `@fortawesome/free-solid-svg-icons` and `@fortawesome/free-brands-svg-icons` available
- `svelte-portal` for portal rendering

## Best Practices

### TypeScript

- **Use interfaces for object shapes, `type` for unions/aliases only** — Props interfaces (`XxxProps`) are preferred for component props; `type` only for union types and external type imports (`type Snippet`, `type ILinkEventTracker`)
- **Prefer classes with static fields over `enum`** — Use `export class DoorStateType { public static OPEN: number = 0; ... }` instead of TypeScript `enum` (matches codebase convention)
- **Use data classes with `populate(parser)` pattern** — Constructor takes a parser, calls `populate()` which assigns all fields from the parser object; initialize all properties with sensible defaults (`-1`, `false`, `undefined`)
- **Named exports only** — No default exports anywhere; export factory functions for singletons (`getXxxListener()`), named functions for utilities
- **Use `$lib` alias for internal imports** — `import { MessengerFriend } from '$lib/api/friends/MessengerFriend'`; relative imports only within the same directory
- **Organize imports: externals first, then `$lib`, then relative** — Group: `@nitrots/nitro-renderer` / `svelte` packages → `$lib/...` → `./relative`
- **Use guard clauses with early returns** — Check nulls/undefineds at function top: `if (!this.friends?.length) return;` before proceeding
- **Use boolean state flags for errors** — `isError = $state(false)` instead of try/catch in most places; errors set flags, UI reacts
- **Prefer arrow functions for utility exports** — `export const CloneObject = <T>(object: T): T => { ... }` with explicit return type
- **Bind event handlers with `.bind(this)`** — When passing class methods as Nitro event callbacks: `registerMessageEvent(EventClass, this.onEvent.bind(this))`

### JavaScript / General

- **No semicolons** — Prettier enforces this; omit `;` at statement ends
- **Tabs for indentation, single quotes, no trailing commas** — Prettier config: `useTabs: true`, `singleQuote: true`, `trailingComma: "none"`, `printWidth: 100`
- **K&R brace style** — Opening curly brace on same line as control flow statement
- **Single-line `if` without braces for early returns** — `if (!roomName) return;` is acceptable
- **No type annotations on obvious expressions** — Omit types when the compiler can infer (e.g., `let count = $state(0)` not `let count: number = $state(0)`)
- **Prefer `??=` (logical nullish assignment)** — For singleton lazy init: `return (instance ??= new XxxListener())`

### Svelte 5

- **Use runes exclusively** — No legacy `$:`, `export let`, `on:click`, or `on:submit` event handlers; always use `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`
- **Define props interface at top of `<script>`** — Right after imports, declare `interface XxxProps { ... }` then destructure with defaults in `$props()`
- **Use `children?: Snippet` for slot content** — Render with `{@render children?.()}` in markup
- **Use `$bindable()` for two-way binding props** — `let { element = $bindable<HTMLElement | null>(null), ...p }: FlexProps = $props()`
- **Use `$derived.by(() => { ... })` for multi-statement derived state** — When you need branching or complex logic in computed values
- **Use `$effect()` sparingly** — Only for side effects that don't fit into derived state (e.g., syncing dimensions); prefer `$derived` for computed values
- **Keep logic components script-only** — Components under `logic/` render nothing; use `onMount` for setup and return a cleanup function for teardown
- **Keep view components purely presentational** — Views under `views/` should not contain business logic; they read state from listener getters and call API functions
- **Use Tailwind utility classes exclusively** — Avoid custom CSS files; use `:global()` for overriding child component styles when needed
- **Use `Flex` component for layout** — Compose layouts using `<Flex column>` / `<Flex center>` etc. instead of raw divs with flex classes
- **Use sprite-based graphics via `theme.scss` variables** — Icons use background-position on spritesheets referenced via CSS variables (`--toolbar-spritesheet`, `--navigator-spritesheet`)
- **Localize all user-facing strings** — Use `LocalizeText('key')` for window titles, labels, and messages exposed to users

## Key files

| File | Purpose |
|---|---|
| `src/lib/initialize.svelte.ts` | Loading state machine (percent, message, isError, isReady) |
| `src/lib/events/registration.ts` | Event registration helpers: `registerMainEvent`, `registerMessageEvent`, `DispatchUiEvent`, etc. |
| `src/lib/events/room.svelte.ts` | Room engine lifecycle, WebGL canvas setup, resize handling |
| `src/lib/events/session.svelte.ts` | Session/user state (avatar, chat style, respects, screen size) |
| `src/lib/actions/truffleText.svelte.ts` | `use:truffleText` action — TreeWalker text replacement, MutationObserver, input editable creation |
| `check-configs.js` | Pre-flight check that `renderer-config.json` and `ui-config.json` exist |

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## DeepWiki — Complete Project Documentation

Source: https://deepwiki.com/bobbadevco/bobba-svelte (indexed at commit `4f37bb1c`)

---

### 1. Overview

bobba-svelte is a reimplementation of the Habbo Hotel Nitro client using Svelte 5 / SvelteKit (SPA mode, no SSR). It connects to a compatible game server via WebSocket using the `@nitrots/nitro-renderer` package for rendering, asset loading, and server communication.

**Key technologies:** Svelte 5 (runes `$state`, `$derived`, `$effect`, `$props`), SvelteKit (SPA), TypeScript, Tailwind CSS, SCSS, `@nitrots/nitro-renderer`, `svelte-fa` (Font Awesome), `svelte-portal`.

**Architecture — 3-tier separated by directory:**
- **UI Layer**: `src/lib/themes/` — purely presentational Svelte components (views, windows, generic components)
- **State Layer**: `src/lib/listeners/` — singleton classes using $state runes, registered as Nitro message event handlers
- **Communication Layer**: `src/lib/events/` — typed wrappers around Nitro's EventDispatcher, and `src/lib/api/` — getter functions wrapping Nitro singletons

---

### 2. Getting Started

1. Copy `static/renderer-config.json.example` → `static/renderer-config.json`
2. Copy `static/ui-config.json.example` → `static/ui-config.json`
3. `npm install`
4. `npm run dev` (runs `check-configs.js` then `vite dev`)

Build: `npm run build` | Type-check: `npm run check` | Lint: `npm run lint` | Format: `npm run format`

#### 2.1 Build Configuration and Dependencies

- **Build tool**: Vite via SvelteKit
- **Svelte 5**: `compilerOptions.experimental.async: true` in svelte.config.js
- **Key dependencies**:
  - `@nitrots/nitro-renderer` (core renderer, asset system, server communication)
  - `svelte-fa` + `@fortawesome/free-solid-svg-icons` + `@fortawesome/free-brands-svg-icons` (icons)
  - `svelte-portal` (portal rendering for dropdowns/modals)
  - `tailwindcss` + `postcss` + `autoprefixer` (styling)
  - `sass` (SCSS support)
  - `prettier` + `eslint` + `prettier-plugin-svelte` + `prettier-plugin-tailwindcss` (formatting/lint)

#### 2.2 Project Structure

```
src/
├── app.html                 # SPA shell
├── app.d.ts                 # Global type declarations
├── routes/
│   ├── +layout.server.ts    # ssr = false
│   ├── +layout.svelte       # Layout shell
│   └── +page.svelte         # Entry: Nitro.bootstrap(), dynamic theme import
├── lib/
│   ├── initialize.svelte.ts     # Bootstrap state machine (phase %, messages, error/ready)
│   ├── components/
│   │   ├── actions/             # Svelte use:actions (truffleText)
│   │   ├── common/              # Shared primitives (Flex, Select, Draggable, ProfileButton, LoadingView)
│   │   └── logic/               # Script-only lifecycle components (FriendsLogic, MessengerLogic, etc.)
│   ├── events/
│   │   ├── index.ts             # Exports registration helpers
│   │   ├── registration.ts      # registerMainEvent, registerMessageEvent, registerRoomSessionEvent, DispatchUiEvent
│   │   ├── room.svelte.ts       # Room engine lifecycle, WebGL canvas, resize
│   │   └── session.svelte.ts    # Session/user state (avatar look, chat style, respects, screen size)
│   ├── listeners/               # Singleton state managers per subsystem
│   │   ├── AlertListener.svelte.ts
│   │   ├── CatalogListener.svelte.ts
│   │   ├── ChatInputListener.svelte.ts
│   │   ├── FriendListener.svelte.ts
│   │   ├── MessengerListener.svelte.ts
│   │   ├── NavigatorListener.svelte.ts
│   │   └── WindowListener.svelte.ts
│   ├── api/
│   │   ├── client/              # GetNitroInstance, GetCommunication, link trackers
│   │   ├── navigator/           # DoorStateType, INavigatorSearchFilter, SearchOptions, IRoomChatSettings
│   │   ├── friends/             # MessengerFriend, MessengerRequest, MessengerSettings
│   │   ├── session/             # GetSessionDataManager, GetUserDataManager
│   │   ├── rooms/               # TryVisitRoom, RoomDataParser
│   │   └── utils/               # CloneObject, LocalizeText, PlaySound, RoomChatFormatter, GetLocalStorage
│   └── themes/
│       └── default/
│           ├── assets/styles/theme.scss    # CSS variables, spritesheet references
│           ├── generic/window/             # BobbaWindow, BobbaTabs, BobbaTabsItem
│           ├── views/                      # Feature views (navigator, catalog, messenger, friends, etc.)
│           ├── LoadingView.svelte          # Loading screen
│           └── MainView.svelte             # Root layout: toolbar + feature views
config/                     # Nitro renderer external variables
static/
├── assets/truffle/           # Pre-extracted truffle font glyphs (data/, fonts/, raster/, manifest.json)
├── renderer-config.json.example
└── ui-config.json.example
```

---

### 3. Architecture

#### 3.1 Application Lifecycle and Bootstrapping

**Entry point**: `src/routes/+page.svelte` calls `Nitro.bootstrap()` then dynamically imports the theme.

**6-phase bootstrap sequence** in `initialize.svelte.ts`:

| Phase | % | Description |
|-------|---|-------------|
| PHASE_NONE | 0% | Initial state, waiting to begin |
| PHASE_INIT | 20% | Initialize Nitro core, load configurations |
| PHASE_CONNECTION | 40% | Establish WebSocket connection to server |
| NEXT_PHASE | 60% | Advance to next stage (reserved for auth/handshake) |
| PHASE_MESSAGES | 80% | Register message event handlers |
| PHASE_COMPLETE | 100% | Ready, show MainView |

**Error handling**: Each phase has try/catch. Errors set `isError = true` with a descriptive message. The `LoadingView` displays error state with message.

#### 3.2 Event System

7 dispatcher types, managed in `src/lib/events/registration.ts`:

| Dispatcher | Registration | Purpose |
|------------|-------------|---------|
| Nitro Main | `registerMainEvent(type, handler)` | Core Nitro lifecycle events |
| Configuration | `registerConfigurationEvent(type, handler)` | Configuration load events |
| RoomEngine | `registerRoomEngineEvent(type, handler)` | Room rendering events |
| RoomSession | `registerRoomSessionEvent(type, handler)` | Room session events |
| Localization | `registerLocalizationEvent(type, handler)` | Language/localization events |
| MessageEvents | `registerMessageEvent(eventClass, handler)` | Server messages (habbo packets) |
| UI Events | `DispatchUiEvent(type, data)` | Custom UI event bus |

#### 3.3 State Management with Listeners

**Pattern**: Singleton class in `.svelte.ts` file using Svelte 5 runes, accessed via getter function.

```typescript
// Example: NavigatorListener
let instance: NavigatorListener;
export function getNavigatorListener() {
    return (instance ??= new NavigatorListener());
}
```

**NavigatorListener state variables:**
- `selectedRoomId: $state<number>(-1)` — Currently selected room
- `rooms: $state<RoomData[]>([])` — Current search results
- `roomsReady: $state<boolean>(false)` — Results loaded
- `homeRoom: $state<RoomData | null>(null)` — User's home room
- `categories: $state<RoomCategory[]>([])` — Navigator categories
- `searchQuery: $state<string>('')` — Current search text
- `filterMode: $state<number>(0)` — Active search filter
- `isLoading: $state(true)` — Loading state
- And more: `enterRoom`, `enteringRoom`, `currentRoomId`, visibility, etc.

**Derived state:**
- `categoriesOfRooms: $derived` — Categorized room list grouped by parentId
- `filteredRooms: $derived` — Rooms matching current filter

**MessengerListener state variables:**
- `messages: $state<MessageData[]>([])` — Chat messages
- `chats: $state<UserChatData[]>([])` — Active conversations
- `currentChatId: $state<number>(-1)` — Active conversation
- `chatInput: $state<string>('')` — Input text
- `visible: $state(false)` — Window visibility
- `isLoading: $state(true)` — Loading state
- `chatsReady: $state(false)` — Data loaded
- `latestMessageId: $state(-1)` — For tracking new messages
- `followingFriend: $state<number | null>(null)` — Follow friend room ID

#### 3.4 Theme System

**Dynamic import**: Theme name read from `ui-config.json` (`theme` key), loaded in `+page.svelte`:
```typescript
const theme = config.theme;
const { LoadingView, MainView } = await import(`$lib/themes/${theme}/index.js`);
```

**Structure per theme:**
```
themes/{theme}/
├── assets/
│   └── styles/
│       └── theme.scss     # CSS variables, spritesheet URLs, font declarations
├── generic/
│   └── window/
│       ├── BobbaWindow.svelte
│       ├── tabs/BobbaTabs.svelte
│       └── tabs/BobbaTabsItem.svelte
├── views/
│   ├── toolbar/            # ToolbarLeftComponent, ChatInputComponent
│   ├── navigator/          # NavigatorView, RoomCreatorView, search components
│   ├── catalog/            # CatalogView, purchase components
│   ├── messenger/          # MessengerView, ChatView
│   ├── friends/            # FriendsView, FriendListItem
│   ├── profile/            # UserProfileView, BadgesComponent
│   └── alert/              # AlertView
├── LoadingView.svelte
└── MainView.svelte
```

**Theme.scss** defines CSS variables (`--color-primary`, `--color-secondary`, `--toolbar-spritesheet`, `--navigator-spritesheet`, etc.) and font family (`--font-sans: Ubuntu`).

---

### 4. Core Features

#### 4.1 Navigator — Room Discovery

The Navigator is the main room discovery interface, organized into: NavigatorView (window shell), RoomListView (search results), RoomListItemView (individual room entries), RoomCreatorView (create rooms), SearchComponent (search + filter).

**RoomData** model: `roomId`, `name`, `ownerName`, `ownerId`, `description`, `users`, `maxUsers`, `doorMode`, `categoryId`, `tags`, `groupName`, `groupBadge`, etc.

**Search filters** (`SearchOptions`): `anything` (null), `room.name` (roomname), `owner` (owner), `tag` (tag), `group` (group).

**Door state types**: `OPEN (0)`, `LOCKED (1)`, `DOORBELL (2)`, `PASSWORD (3)`, `INVISIBLE (4)`, `NOOBS_ONLY (5)`.

**Room creation flow**: `RoomCreatorView` → collects name/description/door state/password/category/users max → `RoomDataParser` → `GetNavigator().createRoom()` → server response via `RoomCreatedEvent`.

**Room entry flow**: `selectedRoomId` → `TryVisitRoom(roomId)` → `RoomSessionManager` → door state check → password prompt if `DOORBELL` or `PASSWORD` → entry/error callback.

#### 4.2 Catalog — Shopping System

The Catalog is the in-game shop for purchasing furniture, clothes, effects, and bundles.

**CatalogListener state:**
- `navigation: $state<CatalogNavigation[]>([])` — Tree of catalog pages
- `currentPage: $state<CatalogPage | null>(null)` — Active catalog page
- `offers: $state<CatalogOffer[]>([])` — Items on current page
- `isLoading: $state<boolean>(true)`
- `visible: $state<boolean>(false)`

**Page navigation**: Tree structure with `pageId`, `parentId`, `caption`, `icon`, `children`. Clicking a page fetches `CatalogPageEvent` with offers.

**Purchase flow**: Select offer → `PurchaseFromCatalogComposer` → server validates → `PurchaseOkEvent` or `PurchaseErrorEvent` → UI feedback.

#### 4.3 Rooms

Room system covers rendering (WebGL canvas via Nitro renderer), chat (bubbles, input, flood control), and session management (enter/leave lifecycle).

**ChatSystem**: `ChatInputListener` manages `chatInput`, `isTyping`, `floodTimer`. Messages sent via `ChatComposer`. Flood protection: escalating timers (5s → 30s → 60s → 300s), visual countdown in input.

**Room session lifecycle**: Enter → door check → `RoomSessionCreatedEvent` → canvas mounting → chat enabled → `RoomSessionStartedEvent` → user interaction. Leave → cleanup listeners → canvas unmount → UI reset.

#### 4.4 Messenger — Private Chat

**MessengerListener** manages private conversations with users.

**Key methods**: `sendMsg()` (sends via `SendMsgComposer`), `openChat(userId)` (creates/opens chat), `closeChat(chatId)`, `followFriend(userId)` (navigates to friend's room).

**States**: `chats` (active conversations, max 30), `messages` per chat, `currentChatId` (active window), `latestMessageId` (new message tracking).

**Deep link patterns**: `messenger/open/{userId}/{userName}`, `messenger/close/{userId}`, `messenger/toggle`.

#### 4.5 Friends System

**FriendListener** singleton manages friends list via `$state` runes.

**Core state**: `friends: MessengerFriend[]`, `requests: MessengerRequest[]`, `sentRequests: number[]`, `settings: MessengerSettings`, `visible: boolean`, `selectedFriendsIds: number[]`, `onlineFriends`/`offlineFriends` (derived).

**Data models:**
- `MessengerFriend`: `id`, `name`, `figure`, `online`, `followingAllowed`, `relationshipStatus` (NONE=0, HEART=1, SMILE=2, BOBBA=3), `motto`, `lastAccess`, `vipMember`, `unread`
- `MessengerRequest`: `requestId`, `requesterUserId`, `requesterName`, `figureString`
- `MessengerSettings`: `userFriendLimit`, `normalFriendLimit`, `extendedFriendLimit`, `categories`

**Friend actions**: follow (if `followingAllowed`), message, profile, remove, invite to room, accept/decline requests.

**Bulk operations**: Select multiple friends → remove or room invite.

**Deep link patterns**: `friends/show`, `friends/hide`, `friends/toggle`, `friends/request/{userId}/{userName}`.

**Periodic updates**: `FriendListUpdateComposer` every 2 minutes.

#### 4.6 Toolbar

Persistent navigation controls: collapsible left sidebar (ToolbarLeftComponent) + bottom chat input (ChatInputComponent, visible only in rooms).

**Left toolbar buttons** (sprite-based from spritesheet):
- Home/Hotel View (context-dependent: outside room = navigator/goto/home, inside room = GoToHotelView)
- Rooms (navigator/toggle)
- Catalog (not implemented)
- Inventory (not implemented)
- Camera (not implemented)

**Collapse/expand**: `isVisible` state, slide animation via Tailwind conditional `-left-18.25` / `left-0`.

**Chat input**: Conditional on `getRoomSession()`, shows AvatarImage (headOnly) + ChatInputWidget.

#### 4.7 User Profiles

**UserProfileView** displays user info in a BobbaWindow: basic data, badges (5-column grid via BadgesComponent), relationships.

**Profile listener state**: `userProfile: UserProfile | null`, `userBadges: string[]`, `userRelationships: UserRelationships | null`.

**Actions**: Close profile (clears state), Leave Group (only for own profile, calls `GetUserProfile()` after).

#### 4.9 Truffle Text Rendering

All visible text in the client is rendered via `truffle-text` — a pixel-accurate Habbo font renderer using canvas-based text replacement.

**Integration approach**: A single Svelte 5 `use:truffleText` action on the root `<div class="contents">` in `+layout.svelte` recursively processes the entire DOM tree:

- **Text nodes**: Replaced with `<span>` overlays positioned above invisible `<canvas>` elements. The canvas renders the text using truffle's packed font data for exact pixel rendering matching the original Habbo client.
- **Input/Textarea elements**: Wrapped with `createTruffleEditable()` — a transparent input overlaid by a canvas that renders typed text in the Habbo font. Typing still hits the real input element.
- **Dynamic content**: A `MutationObserver` watches for new nodes (from SPA navigation, window opens, chat messages, etc.) and processes them on insertion.
- **Preloading**: `initialize.svelte.ts` calls `loadPackedTruffle()` during PHASE_INIT which fetches `static/assets/truffle/manifest.json` and preloads all font glyphs. A `getTruffle()` getter and `onTruffleReady()` callback provide access to the truffle singleton.



**Notes**:
- truffle overrides font-family globally via `truffle.resolveStyle()` mapping CSS font/weight/style to truffle style names (e.g., `u_regular`, `b_regular`)
- The action does NOT process nodes inside elements with `data-truffle-ignore` attribute
- Input height/width changes detected via `ResizeObserver` trigger canvas resize
- Accessibility: canvas-based text is not directly selectable or screen-reader-visible; real text nodes remain hidden (`opacity: 0; position: absolute; pointer-events: none`) for screen readers

#### 4.8 Alerts and Notifications (unchanged)

Modal popup system using BobbaWindow instances.

**Alert data**: `{ id, title?, alertType, messages: string[] }`. Each alert renders as a separate draggable window.

**Alert listener state**: `alerts: Alert[]` (reactive array).

**Lifecycle**: Add to `alerts` array → AlertView renders BobbaWindow per alert → close via `closeAlert(alert)`.

**Features**: Multiple concurrent alerts, z-index management via WindowListener, uniqueness control via `alertType`.

---

### 5. UI Component Library

#### 5.1 Layout Components

**Flex component**: Fundamental layout primitive. Props: `children` (Snippet), `element` (bindable), `fit`, `fullWidth`, `fullHeight`, `column`, `reverse`, `center`, `wrap` (default true), `shrink`, `inline`, `grow`, `pointer`, `class`, `onclick`. Dynamically renders as `<div>` or `<button>` if onclick provided.

**Select component**: Custom dropdown with portal-based rendering (`svelte-portal`). Interfaces: `ISelectOption` (`value`, `display`) and `SelectProps` (`options`, `selected`, `onSelect`, `searchable?`, `placeholder?`, `disabled?`, `class`). Positioning uses `getBoundingClientRect()` with scroll/resize event cleanup.

#### 5.2 Windows and Dialogs

**Draggable component**: Wrapper providing drag behavior. Bindable props: `x`, `y`, `moving`, `unique`, `windowPos`. Drag logic tracks delta movement (no jump artifacts). Uses `pointerdown`/`pointermove`/`pointerup` events. ARIA: `role="tab"`, `aria-roledescription="draggable window"`, `tabindex="-1"`.

**BobbaWindow component**: Primary modal container. Composes Draggable, Button, Flex. Props: `onCloseClick`, `unique`, `disableDrag`, `headerTitle`, `class`, `children` (Snippet). Initial position at 45% horizontal, 30% vertical. Resize via second Draggable instance binding x→width, y→height. Close button with `aria-label="Close"`.

#### 5.3 Tabs and Navigation

**BobbaTabs**: Horizontal tab bar container. Style: `min-h-11`, `rounded-md`, `gap-px`, bottom border.

**BobbaTabsItem**: Extends FlexProps. `active` prop controls background (`bg-bright-primary` vs `bg-base-primary:hover:bg-primary`).

#### 5.4 Form Components

Button component (referenced throughout), input elements with Tailwind styling, form layouts using Flex composition.

#### 5.5 Avatar and Image Components

**AvatarImage**: Renders user avatar figures. Used in chat bubbles, friend lists, profiles. `headOnly` prop for toolbar display. Interacts with `@nitrots/nitro-renderer` asset system for cached texture loading.

**BadgeImage**: Renders badge icons in profile grid.

**RoomThumbnail**: Displays room preview images in navigator.

---

### 6. API Reference

#### 6.1 Utility Functions

| Function | Returns | Purpose |
|----------|---------|---------|
| `CloneObject<T>(object: T)` | `T` | Shallow clone (preserves primitives, copies own enumerable properties) |
| `LocalizeText(key: string)` | `string` | Localized string lookup |
| `PlaySound(sound: string)` | `void` | Play game sound effect |
| `RoomChatFormatter(text: string)` | `string` | Format chat text for display |
| `GetLocalStorage(key: string)` | `string \| null` | Local storage accessor |

#### 6.2 Room API

| Function | Returns | Purpose |
|----------|---------|---------|
| `TryVisitRoom(roomId: number)` | `void` | Initiate room entry sequence |
| `RoomDataParser` | Class | Parses room data from server |

#### 6.3 Session and Events API

**Session access**: `GetSessionDataManager()`, `GetUserDataManager()` — singleton manager instances.

**Event registration** (from `src/lib/events/`):
| Function | Purpose |
|----------|---------|
| `registerMainEvent(type, handler)` | Core Nitro lifecycle |
| `registerMessageEvent(eventClass, handler)` | Server packet handlers |
| `registerRoomSessionEvent(type, handler)` | Room session events |
| `DispatchUiEvent(type, data)` | Custom UI event bus |

#### 6.4 Navigator API

| Export | Type | Purpose |
|--------|------|---------|
| `DoorStateType` | Enum | Door states: OPEN(0), LOCKED(1), DOORBELL(2), PASSWORD(3), INVISIBLE(4), NOOBS_ONLY(5) |
| `INavigatorSearchFilter` | Interface | `{ name: string, query: string \| null }` |
| `SearchOptions` | Array | 5 predefined filters (anything, room.name, owner, tag, group) |
| `IRoomChatSettings` | Interface | Room chat configuration |

#### Client API Module

| Function | Returns | Purpose |
|----------|---------|---------|
| `GetNitroInstance()` | `NitroInstance` | Core Nitro renderer singleton |
| `GetCommunication()` | `Communication` | WebSocket communication manager |
| `GetConfiguration()` | `Configuration` | App configuration |
| `GetConfigurationManager()` | `ConfigurationManager` | Config manager |
| `GetNitroCore()` | `NitroCore` | Core engine instance |
| `AddLinkEventTracker(tracker)` | `void` | Register deep link handler |
| `RemoveLinkEventTracker(tracker)` | `void` | Unregister deep link handler |
| `CreateLinkEvent(link)` | `void` | Fire navigation link event |

---

### DeepWiki Navigation

All pages follow URL pattern: `https://deepwiki.com/bobbadevco/bobba-svelte/{section-number}-{slug}`

| Section | Slug |
|---------|------|
| 1 | overview |
| 2 | getting-started |
| 2.1 | build-configuration-and-dependencies |
| 2.2 | project-structure |
| 3 | architecture |
| 3.1 | application-lifecycle-and-bootstrapping |
| 3.2 | event-system |
| 3.3 | state-management-with-listeners |
| 3.4 | theme-system |
| 4 | core-features |
| 4.1 | navigator-room-discovery |
| 4.1.1 | navigator-ui-components |
| 4.1.2 | navigator-state-management |
| 4.1.3 | search-system |
| 4.1.4 | room-creation |
| 4.1.5 | room-entry-and-door-states |
| 4.2 | catalog-shopping-system |
| 4.2.1 | catalog-ui-components |
| 4.2.2 | catalog-navigation-and-state |
| 4.3 | rooms |
| 4.3.1 | room-display-and-rendering |
| 4.3.2 | room-chat-system |
| 4.3.3 | room-session-management |
| 4.4 | messenger-private-chat |
| 4.4.1 | messenger-state-management |
| 4.4.2 | messenger-ui |
| 4.5 | friends-system |
| 4.5.1 | friends-ui-components |
| 4.5.2 | friends-state-management |
| 4.6 | toolbar |
| 4.7 | user-profiles |
| 4.8 | alerts-and-notifications |
| 5 | ui-component-library |
| 5.1 | layout-components |
| 5.2 | windows-and-dialogs |
| 5.3 | tabs-and-navigation |
| 5.4 | form-components |
| 5.5 | avatar-and-image-components |
| 6 | api-reference |
| 6.1 | utility-functions |
| 6.2 | room-api |
| 6.3 | session-and-events-api |
| 6.4 | navigator-api |
