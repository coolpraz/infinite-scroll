"use client"

import { useOptimistic } from "react"

export type OptimisticActionHandler<T, A> = (currentState: T[], action: A) => T[]

/**
 * A hook for implementing optimistic updates with the infinite scroll hook
 * @param initialState The initial state array
 * @param updateFn Function to handle optimistic updates
 * @returns A tuple containing the optimistic state and a function to apply optimistic updates
 */
export function useOptimisticActions<T, A>(
  initialState: T[],
  updateFn: OptimisticActionHandler<T, A>,
): [T[], (action: A) => void] {
  const [optimisticState, addOptimisticAction] = useOptimistic<T[], A>(initialState, updateFn)

  return [optimisticState, addOptimisticAction]
}
