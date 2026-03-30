import { useQueryClient } from "@tanstack/react-query";
import { 
  useListPrompts, 
  useGeneratePrompt as useApiGeneratePrompt,
  useGetPrompt 
} from "@workspace/api-client-react";

export function useProjectPrompts(projectId: number | null) {
  return useListPrompts(projectId!, {
    query: {
      enabled: !!projectId
    }
  });
}

export function usePromptDetail(projectId: number | null, moduleId: number | null, submoduleId: string | null) {
  return useGetPrompt(projectId!, moduleId!, submoduleId!, {
    query: {
      enabled: !!projectId && !!moduleId && !!submoduleId
    }
  });
}

export function useGeneratePrompt() {
  const queryClient = useQueryClient();
  return useApiGeneratePrompt({
    mutation: {
      onSuccess: (data) => {
        // Invalidate the prompt list for this project so the UI updates
        queryClient.invalidateQueries({ queryKey: [`/api/prompts/${data.projectId}`] });
        // Also invalidate the specific prompt detail
        queryClient.invalidateQueries({ queryKey: [`/api/prompts/${data.projectId}/${data.moduleId}/${data.submoduleId}`] });
      }
    }
  });
}
