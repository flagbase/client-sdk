import React from 'react'
import { Route, Navigate, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

import { RouteParams } from './router.types'
import Projects from '../pages/projects'
import Flags from '../pages/flags'
import PageLayout from '../../components/page-layout'
import '../tailwind/tailwind.css'
import { PageHeadings } from '../../components/page-layout/page-layout'
import EditProject from '../pages/projects/projects.edit'
import {
    environmentsLoader,
    flagsLoader,
    instancesLoader,
    projectsLoader,
    sdkLoader,
    targetingLoader,
    variationsLoader,
    workspacesLoader,
} from './loaders'
import { QueryClient } from 'react-query'
import MainWorkspaces from '../pages/workspaces/workspaces.main'
import Environments from '../pages/environments/environments'
import { Error } from '../pages/error'
import { Project } from '../pages/projects/project'
import { EditInstance } from '../pages/instances/instances.settings'
import { EditWorkspace } from '../pages/workspaces/workspaces.edit'
import Instances from '../pages/instances/instances'
import { Sdks } from '../pages/sdks/sdks'
import { EditEnvironment } from '../pages/environments/edit-environment'
import { SdkSettings } from '../pages/sdks/sdk.settings'
import { Targeting } from '../pages/targeting/targeting'
import Variations from '../pages/variations/variations'
import { FlagSettings } from '../pages/flags/flags.edit'
import { EnvironmentDropdown } from '../pages/environments/environment-dropdown'
import Button from '../../components/button'
import { CreateVariation } from '../pages/variations/variations.modal'
import VariationSettings from '../pages/variations/variation.settings'

const { InstanceKey, WorkspaceKey, ProjectKey, EnvironmentKey, FlagKey, SdkKey, VariationKey } = RouteParams

export const getWorkspacesPath = (instanceKey: string) => `/${instanceKey}/workspaces`
export const getWorkspacePath = (instanceKey: string, workspaceKey: string) =>
    `/${instanceKey}/workspaces/${workspaceKey}/projects`

export const getProjectsPath = (instanceKey: string, workspaceKey: string) =>
    `/${instanceKey}/workspaces/${workspaceKey}/projects`

export const getProjectPath = (instanceKey: string, workspaceKey: string, projectKey: string) =>
    `/${instanceKey}/workspaces/${workspaceKey}/projects/${projectKey}/flags`

export const getEnvironmentPath = (
    instanceKey: string,
    workspaceKey: string,
    projectKey: string,
    environmentKey: string
) => `/${instanceKey}/workspaces/${workspaceKey}/projects/${projectKey}/environments/${environmentKey}/sdk-keys`

export const getFlagPath = (
    instanceKey: string,
    workspaceKey: string,
    projectKey: string,
    environmentKey: string,
    flagKey: string
) => `/${instanceKey}/workspaces/${workspaceKey}/projects/${projectKey}/flags/${flagKey}/environments/${environmentKey}`

export const getFlagsPath = (instanceKey: string, workspaceKey: string, projectKey: string) =>
    `/${instanceKey}/workspaces/${workspaceKey}/projects/${projectKey}/flags`

export const getVariationPath = ({
    instanceKey,
    workspaceKey,
    projectKey,
    flagKey,
    variationKey,
}: {
    instanceKey: string
    workspaceKey: string
    projectKey: string
    flagKey: string
    variationKey: string
}) =>
    `/${instanceKey}/workspaces/${workspaceKey}/projects/${projectKey}/flags/${flagKey}/variations/${variationKey}/settings`

export const queryClient = new QueryClient()

export const newRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<PageLayout />} errorElement={<Error />}>
            <Route path="/" element={<Navigate to="/instances" />} />
            <Route path="/instances" element={<PageHeadings />}>
                <Route loader={instancesLoader(queryClient)} path="" element={<Instances />} />
            </Route>
            <Route path={`/${InstanceKey}/workspaces`} element={<PageHeadings />}>
                <Route
                    loader={({ params }) => workspacesLoader({ queryClient, params })}
                    errorElement={<Error />}
                    path=""
                    element={<MainWorkspaces />}
                />
                <Route path="settings" element={<EditInstance />} />
                <Route path={`${WorkspaceKey}`}>
                    <Route path="settings" element={<EditWorkspace />} />
                    <Route path="" element={<>Workspace view</>} />
                    <Route path="projects">
                        <Route
                            loader={({ params }) => projectsLoader({ queryClient, params })}
                            path=""
                            element={<Projects />}
                        />

                        <Route path={`${ProjectKey}`}>
                            <Route path="settings" element={<EditProject />} />
                            <Route path="" element={<Project />} />
                            <Route path="flags">
                                <Route
                                    path=""
                                    element={<Flags />}
                                    loader={({ params }) => flagsLoader({ queryClient, params })}
                                />
                                <Route path={`${FlagKey}`}>
                                    <Route
                                        path="settings"
                                        element={<FlagSettings />}
                                        loader={({ params }) => flagsLoader({ queryClient, params })}
                                    />
                                </Route>
                                <Route path={FlagKey}>
                                    <Route path="variations">
                                        <Route
                                            path=""
                                            loader={({ params }) => variationsLoader({ queryClient, params })}
                                            element={<Variations />}
                                            handle={{
                                                rightContainer: () => <CreateVariation />,
                                            }}
                                        />
                                        <Route path={VariationKey}>
                                            <Route path="settings" element={<VariationSettings />} />
                                        </Route>
                                    </Route>
                                    <Route path={`environments/${EnvironmentKey}`}>
                                        <Route
                                            path={''}
                                            element={<Targeting />}
                                            loader={({ params }) => targetingLoader({ queryClient, params })}
                                            handle={{
                                                rightContainer: () => <EnvironmentDropdown />,
                                            }}
                                            errorElement={<Error />}
                                        />
                                    </Route>
                                </Route>
                            </Route>
                            <Route path="environments">
                                <Route
                                    path=""
                                    loader={({ params }) => environmentsLoader({ queryClient, params })}
                                    element={<Environments />}
                                />
                                <Route path={`${EnvironmentKey}`}>
                                    <Route path="settings" element={<EditEnvironment />} />
                                    <Route path="sdk-keys">
                                        <Route
                                            path=""
                                            element={<Sdks />}
                                            loader={({ params }) => sdkLoader({ queryClient, params })}
                                        />
                                        <Route
                                            path={`${SdkKey}`}
                                            element={<SdkSettings />}
                                            loader={({ params }) => sdkLoader({ queryClient, params })}
                                        />
                                    </Route>
                                </Route>

                                <Route path={`flags/${EnvironmentKey}`} element={<Flags />} />
                                <Route path={`flags/${FlagKey}/${EnvironmentKey}`} element={<>Flag view</>} />
                            </Route>
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Route>
    )
)
