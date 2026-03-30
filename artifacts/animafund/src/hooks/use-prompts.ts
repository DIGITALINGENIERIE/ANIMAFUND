import { useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  useListPrompts,
  useGeneratePrompt as useApiGeneratePrompt,
  getListPromptsQueryKey,
  type GeneratedPrompt,
  type GeneratePromptResponse,
} from "@workspace/api-client-react";

export function useProjectPrompts(projectId: number | null) {
  return useListPrompts(projectId!, {
    query: {
      enabled: !!projectId,
      staleTime: 0, // Always check for fresh data
    }
  });
}

// Converts a GeneratePromptResponse to the GeneratedPrompt shape the UI expects
function responseToPrompt(data: GeneratePromptResponse): GeneratedPrompt {
  return {
    id: 0,
    projectId: data.projectId,
    moduleId: data.moduleId,
    submoduleId: data.submoduleId,
    moduleName: "",
    submoduleName: "",
    targetPlatform: data.targetPlatform,
    finalScore: data.finalScore,
    mention: data.mention,
    iterations: data.iterations,
    variants: data.variants,
    createdAt: data.savedAt,
    updatedAt: data.savedAt,
  };
}

export function useGeneratePrompt() {
  const queryClient = useQueryClient();

  // Local state to hold the *just-generated* prompt directly from the API response
  const [latestGeneratedPrompt, setLatestGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const mutation = useApiGeneratePrompt({
    mutation: {
      onSuccess: (data) => {
        setGenerateError(null);

        // 1. Store it locally so the panel can show it IMMEDIATELY
        const newPrompt = responseToPrompt(data);
        setLatestGeneratedPrompt(newPrompt);

        // 2. Update the list cache directly (no network round-trip needed)
        queryClient.setQueryData(
          getListPromptsQueryKey(data.projectId),
          (old: GeneratedPrompt[] | undefined) => {
            const filtered = (old ?? []).filter(
              (p) => !(p.moduleId === data.moduleId && p.submoduleId === data.submoduleId)
            );
            return [...filtered, newPrompt];
          }
        );

        // 3. Also invalidate to trigger a proper DB refresh in background
        queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey(data.projectId) });
      },
      onError: (error: unknown) => {
        const msg =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : "Erreur inconnue lors de la génération";
        setGenerateError(msg);
      },
    },
  });

  // Clear the latest prompt when navigating to a different submodule
  const clearLatest = useCallback(() => setLatestGeneratedPrompt(null), []);

  return {
    ...mutation,
    latestGeneratedPrompt,
    generateError,
    clearLatest,
    setLatestGeneratedPrompt,
  };
}
