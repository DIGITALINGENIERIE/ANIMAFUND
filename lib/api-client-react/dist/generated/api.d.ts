import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CreateProjectRequest, ErrorResponse, GeneratePromptRequest, GeneratePromptResponse, GeneratedPrompt, HealthStatus, Module, Project } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all projects
 */
export declare const getListProjectsUrl: () => string;
export declare const listProjects: (options?: RequestInit) => Promise<Project[]>;
export declare const getListProjectsQueryKey: () => readonly ["/api/projects"];
export declare const getListProjectsQueryOptions: <TData = Awaited<ReturnType<typeof listProjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProjectsQueryResult = NonNullable<Awaited<ReturnType<typeof listProjects>>>;
export type ListProjectsQueryError = ErrorType<unknown>;
/**
 * @summary List all projects
 */
export declare function useListProjects<TData = Awaited<ReturnType<typeof listProjects>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new project
 */
export declare const getCreateProjectUrl: () => string;
export declare const createProject: (createProjectRequest: CreateProjectRequest, options?: RequestInit) => Promise<Project>;
export declare const getCreateProjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
        data: BodyType<CreateProjectRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
    data: BodyType<CreateProjectRequest>;
}, TContext>;
export type CreateProjectMutationResult = NonNullable<Awaited<ReturnType<typeof createProject>>>;
export type CreateProjectMutationBody = BodyType<CreateProjectRequest>;
export type CreateProjectMutationError = ErrorType<unknown>;
/**
 * @summary Create a new project
 */
export declare const useCreateProject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProject>>, TError, {
        data: BodyType<CreateProjectRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProject>>, TError, {
    data: BodyType<CreateProjectRequest>;
}, TContext>;
/**
 * @summary Get a project by ID
 */
export declare const getGetProjectUrl: (id: number) => string;
export declare const getProject: (id: number, options?: RequestInit) => Promise<Project>;
export declare const getGetProjectQueryKey: (id: number) => readonly [`/api/projects/${number}`];
export declare const getGetProjectQueryOptions: <TData = Awaited<ReturnType<typeof getProject>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProjectQueryResult = NonNullable<Awaited<ReturnType<typeof getProject>>>;
export type GetProjectQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a project by ID
 */
export declare function useGetProject<TData = Awaited<ReturnType<typeof getProject>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a project
 */
export declare const getUpdateProjectUrl: (id: number) => string;
export declare const updateProject: (id: number, createProjectRequest: CreateProjectRequest, options?: RequestInit) => Promise<Project>;
export declare const getUpdateProjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
        id: number;
        data: BodyType<CreateProjectRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
    id: number;
    data: BodyType<CreateProjectRequest>;
}, TContext>;
export type UpdateProjectMutationResult = NonNullable<Awaited<ReturnType<typeof updateProject>>>;
export type UpdateProjectMutationBody = BodyType<CreateProjectRequest>;
export type UpdateProjectMutationError = ErrorType<unknown>;
/**
 * @summary Update a project
 */
export declare const useUpdateProject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProject>>, TError, {
        id: number;
        data: BodyType<CreateProjectRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProject>>, TError, {
    id: number;
    data: BodyType<CreateProjectRequest>;
}, TContext>;
/**
 * @summary Delete a project
 */
export declare const getDeleteProjectUrl: (id: number) => string;
export declare const deleteProject: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProject>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProject>>, TError, {
    id: number;
}, TContext>;
export type DeleteProjectMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProject>>>;
export type DeleteProjectMutationError = ErrorType<unknown>;
/**
 * @summary Delete a project
 */
export declare const useDeleteProject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProject>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProject>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Generate God Tier prompts for a sub-module
 */
export declare const getGeneratePromptUrl: () => string;
export declare const generatePrompt: (generatePromptRequest: GeneratePromptRequest, options?: RequestInit) => Promise<GeneratePromptResponse>;
export declare const getGeneratePromptMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePrompt>>, TError, {
        data: BodyType<GeneratePromptRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof generatePrompt>>, TError, {
    data: BodyType<GeneratePromptRequest>;
}, TContext>;
export type GeneratePromptMutationResult = NonNullable<Awaited<ReturnType<typeof generatePrompt>>>;
export type GeneratePromptMutationBody = BodyType<GeneratePromptRequest>;
export type GeneratePromptMutationError = ErrorType<unknown>;
/**
 * @summary Generate God Tier prompts for a sub-module
 */
export declare const useGeneratePrompt: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePrompt>>, TError, {
        data: BodyType<GeneratePromptRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof generatePrompt>>, TError, {
    data: BodyType<GeneratePromptRequest>;
}, TContext>;
/**
 * @summary List all generated prompts for a project
 */
export declare const getListPromptsUrl: (projectId: number) => string;
export declare const listPrompts: (projectId: number, options?: RequestInit) => Promise<GeneratedPrompt[]>;
export declare const getListPromptsQueryKey: (projectId: number) => readonly [`/api/prompts/${number}`];
export declare const getListPromptsQueryOptions: <TData = Awaited<ReturnType<typeof listPrompts>>, TError = ErrorType<unknown>>(projectId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPrompts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPrompts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPromptsQueryResult = NonNullable<Awaited<ReturnType<typeof listPrompts>>>;
export type ListPromptsQueryError = ErrorType<unknown>;
/**
 * @summary List all generated prompts for a project
 */
export declare function useListPrompts<TData = Awaited<ReturnType<typeof listPrompts>>, TError = ErrorType<unknown>>(projectId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPrompts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a specific generated prompt
 */
export declare const getGetPromptUrl: (projectId: number, moduleId: number, submoduleId: string) => string;
export declare const getPrompt: (projectId: number, moduleId: number, submoduleId: string, options?: RequestInit) => Promise<GeneratedPrompt>;
export declare const getGetPromptQueryKey: (projectId: number, moduleId: number, submoduleId: string) => readonly [`/api/prompts/${number}/${number}/${string}`];
export declare const getGetPromptQueryOptions: <TData = Awaited<ReturnType<typeof getPrompt>>, TError = ErrorType<ErrorResponse>>(projectId: number, moduleId: number, submoduleId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrompt>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPrompt>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPromptQueryResult = NonNullable<Awaited<ReturnType<typeof getPrompt>>>;
export type GetPromptQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a specific generated prompt
 */
export declare function useGetPrompt<TData = Awaited<ReturnType<typeof getPrompt>>, TError = ErrorType<ErrorResponse>>(projectId: number, moduleId: number, submoduleId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrompt>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all modules and sub-modules metadata
 */
export declare const getListModulesUrl: () => string;
export declare const listModules: (options?: RequestInit) => Promise<Module[]>;
export declare const getListModulesQueryKey: () => readonly ["/api/modules"];
export declare const getListModulesQueryOptions: <TData = Awaited<ReturnType<typeof listModules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listModules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listModules>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListModulesQueryResult = NonNullable<Awaited<ReturnType<typeof listModules>>>;
export type ListModulesQueryError = ErrorType<unknown>;
/**
 * @summary Get all modules and sub-modules metadata
 */
export declare function useListModules<TData = Awaited<ReturnType<typeof listModules>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listModules>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map