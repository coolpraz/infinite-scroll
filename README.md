# React Infinite Scroll with Optimistic Updates

A lightweight and customizable React library for implementing infinite scrolling with built-in support for optimistic updates.

## Features

- 🔄 Infinite scrolling with intersection observer
- ✨ Built-in optimistic updates using React 19's useOptimistic
- 📱 Fully responsive and customizable
- 🧪 Well-tested components and hooks
- 💡 TypeScript support
- 🔧 Easy to integrate with any data source

## Installation

```bash
npm install react-infinite-scroll-optimistic
# or
yarn add react-infinite-scroll-optimistic
```

## Requirements

- React 19 or higher
- React DOM 19 or higher

## Basic Usage

```tsx
import { useInfiniteScroll, InfiniteScroll } from 'react-infinite-scroll-optimistic';

function MyList() {
  const scrollResult = useInfiniteScroll({
    fetchItems: async (page) => {
      const response = await fetch(`/api/items?page=${page}`);
      return response.json();
    },
  });

  return (
    <InfiniteScroll
      scrollResult={scrollResult}
      renderItem={(item, index, ref) => (
        <div key={item.id} ref={ref}>
          {item.name}
        </div>
      )}
    />
  );
}
```

## Optimistic Updates Example

```tsx
import { useInfiniteScroll, useOptimisticActions, InfiniteScroll } from 'react-infinite-scroll-optimistic';

function MyList() {
  const scrollResult = useInfiniteScroll({
    fetchItems: async (page) => {
      const response = await fetch(`/api/items?page=${page}`);
      return response.json();
    },
  });

  const [optimisticItems, addOptimisticAction] = useOptimisticActions(
    scrollResult.items,
    (state, action) => {
      switch (action.type) {
        case 'ADD_ITEM':
          return [...state, action.item];
        case 'REMOVE_ITEM':
          return state.filter(item => item.id !== action.id);
        default:
          return state;
      }
    }
  );

  const handleAddItem = async () => {
    // Show optimistic update immediately
    const optimisticItem = { id: 'temp-' + Date.now(), name: 'New Item', status: 'pending' };
    addOptimisticAction({ type: 'ADD_ITEM', item: optimisticItem });

    // Make API call
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Item' }),
      });
      const newItem = await response.json();

      // Update actual state with server response
      scrollResult.setItems([...scrollResult.items, newItem]);
    } catch (error) {
      console.error('Failed to add item:', error);
      // Handle error, maybe revert the optimistic update
    }
  };

  return (
    <>
      <button onClick={handleAddItem}>Add Item</button>

      <InfiniteScroll
        scrollResult={scrollResult}
        renderItem={(item, index, ref) => (
          <div key={item.id} ref={ref}>
            {item.name} {item.status === 'pending' && '(Saving...)'}
          </div>
        )}
      />
    </>
  );
}
```

## API Reference

### `useInfiniteScroll`

```tsx
function useInfiniteScroll<T>({
  fetchItems,
  initialPage,
  threshold,
  loadImmediately,
  initialItems,
}: {
  fetchItems: (page: number) => Promise<T[]>;
  initialPage?: number;
  threshold?: number;
  loadImmediately?: boolean;
  initialItems?: T[];
}): {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  lastItemRef: (node: Element | null) => void;
  reset: () => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  page: number;
};
```

### `useOptimisticActions`

```tsx
function useOptimisticActions<T, A>(
  initialState: T[],
  updateFn: (currentState: T[], action: A) => T[]
): [T[], (action: A) => void];
```

### `InfiniteScroll`

```tsx
<InfiniteScroll
  scrollResult={/* result from useInfiniteScroll */}
  renderItem={(item, index, lastItemRef) => (
    /* render your item */
  )}
  loadingComponent={/* optional custom loading component */}
  errorComponent={/* optional custom error component */}
  endComponent={/* optional custom end of list component */}
  emptyComponent={/* optional custom empty list component */}
  className={/* optional class name */}
  style={/* optional inline styles */}
>
  {/* optional header content */}
</InfiniteScroll>
```

## License

MIT
