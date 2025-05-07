"use client"

// Additional React 19 type declarations
import "react"

declare module "react" {
  /**
   * React 19 useOptimistic hook
   * Returns a stateful value that's been optimistically updated,
   * and a function to update it.
   */
  export function useOptimistic<State, Action>(
    state: State,
    updateFn: (state: State, action: Action) => State,
  ): [State, (action: Action) => void]

  /**
   * React 19 use function
   * Accepts a promise and unwraps it.
   */
  export function use<T>(promise: Promise<T>): T
}
