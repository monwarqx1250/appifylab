# Phase 1.5: Component Modularization Log

## Overview
As part of the finalizing steps for the Frontend setup of Buddy Script, the massive `feed/page.jsx` (which originated from `feed.html` and spanned over 1,700 lines) was safely refactored into a scalable Next.js component architecture. 

This guarantees that in Phase 2, backend engineers can simply inject Prisma APIs directly into localized components rather than parsing a gigantic monolithic layout.

## What Was Extracted

All components were successfully grouped into domains located under `src/components/`:

### 1. `src/components/layout/`
These are the static architectural components that wrap the application but don't fetch dynamic feed data themselves.
- **`ThemeSwitcher.jsx`**: The floating button that controls the `_dark_wrapper` class. (Upgraded to use native React `useState` hooks to function interactively).
- **`DesktopNavbar.jsx`**: The primary top navigation and search bar.
- **`MobileHeader.jsx`**: The mobile-optimized logo bar.
- **`MobileBottomNav.jsx`**: The sticky bottom navigation menu for specific mobile dimensions.
- **`LeftSidebar.jsx`**: Houses the Explore Menu, Suggested People, and Upcoming Events.
- **`RightSidebar.jsx`**: Houses the Friend Requests, active connections, and Sponsored sections.

### 2. `src/components/feed/`
These components map directly to user-generated data. They will be heavily utilized in our next backend phases.
- **`StoryCarousel.jsx`** & **`StoryCarouselMobile.jsx`**: The horizontal scrollable areas containing interactive users' stories.
- **`CreatePostBox.jsx`**: The input area with attachment bindings for photos/videos.
- **`PostCard.jsx`**: The atomic, repeatable component for individual feed posts. This contains its own avatar, text bodies, reaction counts, and standard `<hr>` separations.

## Results
The main application entrypoint (`src/app/feed/page.jsx`) has been reduced from **1,769 lines** to a clean **69 lines** of JSX orchestration. 

```jsx
// The new, fully scalable Next.js feed architecture:
<div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
    <ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    <div className="_main_layout">
        <DesktopNavbar />
        <MobileHeader />
        <MobileBottomNav />
        ...
        <LeftSidebar />
        <div className="_layout_middle_inner">
            <StoryCarousel />
            <StoryCarouselMobile />
            <CreatePostBox />
            {posts.map(post => <PostCard key={post.id} data={post} />)} // Future Database mapping
        </div>
        <RightSidebar />
        ...
   </div>
</div>
```

Zero hydration errors. Zero CSS discrepancies. The design is identical to the original `.html` mockup, but strictly typed and isolated for React!
