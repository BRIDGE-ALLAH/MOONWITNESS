import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/useToast"

interface MutationContext {
  previousData?: unknown
}

export function useOptimisticMutate<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onMutate?: (variables: TVariables) => Promise<MutationContext>
    onError?: (error: Error, variables: TVariables, context?: MutationContext) => void
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context?: MutationContext) => void
  }
) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<TData, Error, TVariables, MutationContext>({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries()

      const context = await options?.onMutate?.(variables) ?? { previousData: undefined }

      return context
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["optimistic"], context.previousData)
      }
      options?.onError?.(error, variables, context)
      toast({
        variant: "destructive",
        title: "Mutation failed",
        description: error.message,
      })
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries()
      options?.onSettled?.(data, error, variables, context)
    },
  })
}

export function useOfflineQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: {
    staleTime?: number
    gcTime?: number
  }
) {
  const queryClient = useQueryClient()

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? Infinity,
    gcTime: options?.gcTime ?? Infinity,
  })
}