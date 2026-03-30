import { useQueryClient } from "@tanstack/react-query";
import { 
  useListProjects, 
  useCreateProject as useApiCreateProject,
  useUpdateProject as useApiUpdateProject,
  useDeleteProject as useApiDeleteProject
} from "@workspace/api-client-react";

export function useProjects() {
  return useListProjects();
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useApiCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useApiUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useApiDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    }
  });
}
