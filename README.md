# Next.js Infinite Scroll Library

A powerful, flexible infinite scrolling library for Next.js applications with React Server Components support.

![Next.js Infinite Scroll](https://github.com/yourusername/nextjs-infinite-scroll/raw/main/public/banner.png)

## Features

- 🚀 **Server Component Compatible**: Works seamlessly with Next.js App Router and React Server Components
- ✨ **Optimistic UI Updates**: Show loading placeholders while fetching more data
- 🔄 **Automatic & Manual Loading**: Choose between automatic loading on scroll or manual "Load More" button
- 📱 **Fully Responsive**: Works on all screen sizes and devices
- 🎨 **Customizable Rendering**: Complete control over how items, loading states, and errors are rendered
- 🧩 **Flexible API**: Use as a hook or as a component based on your needs
- 🔍 **Intersection Observer**: Uses modern browser APIs for efficient scroll detection
- 🛠️ **TypeScript Support**: Full type safety with generics for your data structures

## Installation

```bash
npm install @yourusername/nextjs-infinite-scroll
# or
yarn add @yourusername/nextjs-infinite-scroll
# or
pnpm add @yourusername/nextjs-infinite-scroll
```

## Quick Start

### Basic Usage with the Hook

```typescriptreact
"use client"

import { useInfiniteScroll } from '@yourusername/nextjs-infinite-scroll'

function MyComponent() {
  const {
    items,
    hasMore,
    isLoading,
    error,
    inViewRef
  } = useInfiniteScroll({
    fetchData: async (page) => {
      // Fetch your data here
      const res = await fetch(`/api/items?page=${page}`)
      const data = await res.json()
      return data.items
    }
  })

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} ref={index === items.length - 1 ? inViewRef : undefined}>
          {/* Render your item */}
          <div>{item.title}</div>
        </div>
      ))}

      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!hasMore && <div>No more items</div>}
    </div>
  )
}
```

### Using the Component

```typescriptreact
"use client"

import { InfiniteScroll } from '@yourusername/nextjs-infinite-scroll'

function MyComponent() {
  return (
    <InfiniteScroll
      options={{
        fetchData: async (page) => {
          // Fetch your data here
          const res = await fetch(`/api/items?page=${page}`)
          const data = await res.json()
          return data.items
        }
      }}
      renderItem={(item, index, isOptimistic) => (
        <div className={isOptimistic ? 'opacity-50' : ''}>
          {item.title}
        </div>
      )}
    />
  )
}
```

## Server Components Integration

This library is designed to work seamlessly with Next.js App Router and React Server Components:

```typescriptreact
// page.tsx (Server Component)
import { fetchInitialItems } from '@/lib/data'
import ItemsList from './items-list'

export default async function Page() {
  // Fetch initial data on the server
  const initialItems = await fetchInitialItems()

  return (
    <main>
      <h1>My Items</h1>
      <ItemsList initialItems={initialItems} />
    </main>
  )
}

// items-list.tsx (Client Component)
"use client"

import { InfiniteScroll } from '@yourusername/nextjs-infinite-scroll'
import { fetchMoreItems } from '@/lib/data'

export default function ItemsList({ initialItems }) {
  return (
    <InfiniteScroll
      initialData={initialItems}
      options={{
        fetchData: fetchMoreItems,
        initialPage: 2, // Start from page 2 since page 1 was loaded on the server
      }}
      renderItem={(item) => (
        <div>{item.title}</div>
      )}
    />
  )
}
```

## API Reference

### `useInfiniteScroll` Hook

The core hook that provides infinite scrolling functionality.

```typescriptreact
const result = useInfiniteScroll<T>(options)
```

#### Options

| Option | Type | Default | Description
|-----|-----|-----|-----
| `fetchData` | `(page: number) => Promise<T[]>` | Required | Function to fetch data for a specific page
| `initialData` | `T[]` | `[]` | Initial data to populate the list
| `pageSize` | `number` | `10` | Number of items to fetch per page
| `initialPage` | `number` | `1` | Initial page number
| `threshold` | `number` | `0.1` | Threshold for intersection observer
| `rootMargin` | `string` | `"0px"` | Root margin for intersection observer
| `getItemId` | `(item: T) => string` | `item => item.id` | Function to get unique ID from item
| `optimisticUpdates` | `boolean` | `true` | Whether to show optimistic UI updates
| `createPlaceholder` | `(index: number) => T` | Optional | Function to create optimistic placeholder items


#### Return Value

| Property | Type | Description
|-----|-----|-----|-----
| `items` | `T[]` | All items including optimistic ones
| `hasMore` | `boolean` | Whether more items are available
| `isLoading` | `boolean` | Whether items are currently loading
| `error` | `string | null` | Error message if any
| `loadMore` | `() => Promise<void>` | Function to load more items
| `inViewRef` | `(node?: Element | null) => void` | Ref to attach to the last item
| `inView` | `boolean` | Whether the last item is in view
| `isOptimisticItem` | `(item: T) => boolean` | Whether an item is an optimistic placeholder
| `reset` | `() => void` | Reset the infinite scroll state


### `InfiniteScroll` Component

A component wrapper around the `useInfiniteScroll` hook for easier usage.

```typescriptreact
<InfiniteScroll<T> {...props} />
```

#### Props

| Prop | Type | Default | Description
|-----|-----|-----|-----
| `options` | `InfiniteScrollOptions<T>` | Required | Options for the infinite scroll hook
| `initialData` | `T[]` | `[]` | Initial data to populate the list
| `renderItem` | `(item: T, index: number, isOptimistic: boolean) => ReactNode` | Required | Render function for each item
| `renderContainer` | `(children: ReactNode) => ReactNode` | `(children) => <div className="space-y-4">{children}</div>` | Render function for the container
| `renderLoading` | `() => ReactNode` | Default loading UI | Render function for the loading indicator
| `renderError` | `(error: string, retry: () => void) => ReactNode` | Default error UI | Render function for the error message
| `renderEndMessage` | `() => ReactNode` | Default end message | Render function for the end of list message
| `className` | `string` | `undefined` | Class name for the container


## Advanced Usage

### Optimistic UI Updates

Show placeholder items while loading more data:

```typescriptreact
const { items, inViewRef, isOptimisticItem } = useInfiniteScroll({
  fetchData: fetchItems,
  optimisticUpdates: true,
  createPlaceholder: (index) => ({
    id: `optimistic-${Date.now()}-${index}`,
    title: "Loading...",
    description: "Loading content...",
    // Add other required properties for your item type
  }),
})

return (
  <div>
    {items.map((item, index) => (
      <div key={item.id} ref={index === items.length - 1 ? inViewRef : undefined}>
        {isOptimisticItem(item) ? (
          <LoadingItemSkeleton />
        ) : (
          <ItemComponent item={item} />
        )}
      </div>
    ))}
  </div>
)
```

### Manual Loading with "Load More" Button

Create a manual loading experience instead of automatic loading on scroll:

```typescriptreact
const {
  items,
  hasMore,
  isLoading,
  loadMore,
} = useInfiniteScroll({
  fetchData: fetchItems,
  threshold: 0, // Disable automatic loading
})

return (
  <div>
    {/* Render items */}
    {items.map((item) => (
      <ItemComponent key={item.id} item={item} />
    ))}

    {hasMore && (
      <button
        onClick={loadMore}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    )}
  </div>
)
```

### Custom Grid Layout

Render items in a responsive grid:

```typescriptreact
<InfiniteScroll
  options={{
    fetchData: fetchItems,
  }}
  renderItem={(item) => <ItemCard item={item} />}
  renderContainer={(children) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  )}
/>
```

## Examples

The library includes several examples to help you get started:

1. **Posts Example**: Blog posts with images and author info
2. **Products Example**: E-commerce product grid with manual loading
3. **Simple Example**: Minimal configuration example


Check out the [examples directory](https://github.com/yourusername/nextjs-infinite-scroll/tree/main/examples) for complete code samples.

## Best Practices

### Performance Optimization

1. **Virtualization**: For very large lists, consider combining with a virtualization library like `react-window` or `react-virtualized`
2. **Debouncing**: Implement debouncing for scroll events if needed
3. **Image Optimization**: Use Next.js Image component with proper sizing
4. **Memoization**: Memoize expensive render functions


### SEO Considerations

1. **Initial Server Rendering**: Always fetch the first page on the server for better SEO
2. **Metadata**: Include proper metadata for the initial items
3. **Progressive Enhancement**: Ensure content is accessible even without JavaScript


## Troubleshooting

### Common Issues

1. **Items not loading**: Check that your `fetchData` function is returning the expected data format
2. **Duplicate items**: Ensure your items have unique IDs and the `getItemId` function is correctly implemented
3. **Performance issues**: Reduce the number of items rendered at once or implement virtualization


### Error Handling

The library provides built-in error handling, but you can customize it:

```typescriptreact
<InfiniteScroll
  options={{
    fetchData: fetchItems,
  }}
  renderError={(error, retry) => (
    <div className="error-container">
      <p>Something went wrong: {error}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
/>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Next.js App Router](https://nextjs.org/docs/app)
