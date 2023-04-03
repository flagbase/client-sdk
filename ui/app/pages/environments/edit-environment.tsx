import { Form, Formik, Field } from 'formik'
import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/button'
import Input from '../../../components/input'
import { TagInput } from '../../../components/input/tag-input'
import Notification from '../../../components/notification'
import { EditEntityHeading } from '../../../components/text/heading'
import { configureAxios } from '../../lib/axios'
import { useFlagbaseParams } from '../../lib/use-flagbase-params'
import { updateEnvironment, deleteEnvironment } from './api'
import { useEnvironments } from './environments'
import { getEnvironmentsKey } from '../../router/loaders'

export const useUpdateEnvironment = () => {
    const queryClient = useQueryClient()
    const { workspaceKey, projectKey, environmentKey, instanceKey } = useFlagbaseParams()
    const mutation = useMutation({
        mutationFn: async (values: { name: string; key: string; description: string; tags: string[] }) => {
            await configureAxios(instanceKey!)
            await updateEnvironment({
                workspaceKey: workspaceKey!,
                projectKey: projectKey!,
                environmentKey: environmentKey!,
                body: [
                    {
                        op: 'replace',
                        path: '/name',
                        value: values.name,
                    },
                    {
                        op: 'replace',
                        path: '/key',
                        value: values.key,
                    },
                    {
                        op: 'replace',
                        path: '/description',
                        value: values.description,
                    },
                    {
                        op: 'replace',
                        path: '/tags',
                        value: values.tags,
                    },
                ],
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces', instanceKey] })
        },
    })
    return mutation
}

export const useRemoveEnvironment = () => {
    const { instanceKey, workspaceKey, projectKey, environmentKey } = useFlagbaseParams()
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async () => {
            await deleteEnvironment({
                workspaceKey: workspaceKey!,
                projectKey: projectKey!,
                environmentKey: environmentKey!,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getEnvironmentsKey({
                    instanceKey: instanceKey!,
                    workspaceKey: workspaceKey!,
                    projectKey: projectKey!,
                }),
            })
        },
    })
    return mutation
}

export const EditEnvironment = () => {
    const navigate = useNavigate()
    const { instanceKey, workspaceKey, projectKey, environmentKey } = useFlagbaseParams()
    const { data: environments, isLoading } = useEnvironments()
    const environment = environments?.find(
        (environment) => environment.attributes.key === environmentKey?.toLocaleLowerCase()
    )
    if (!environment && !isLoading) {
        throw new Error('Environment not found')
    }

    if (!instanceKey || !workspaceKey || !projectKey) {
        throw new Error('Missing required params')
    }

    const { mutate: remove } = useRemoveEnvironment()
    const { mutate: update, isSuccess, error } = useUpdateEnvironment()

    if (!environment) {
        return null
    }

    const deleteProject = () => {
        remove()
        navigate(-1)
    }

    return (
        <div className="mx-auto max-w-lg px-4 pt-10 pb-12 lg:pb-16">
            <div>
                <EditEntityHeading heading="Environment Settings" subheading={environment.attributes.name} />
                <Notification
                    type="error"
                    show={!!error}
                    title={'Error'}
                    content={'Something went wrong. Please try again later.'}
                />
                <Notification
                    type="error"
                    show={!!isSuccess}
                    title={'Success'}
                    content={'Project updated successfully!'}
                />
                <Formik
                    initialValues={{
                        name: environment.attributes.name,
                        key: environment.attributes.key,
                        description: environment?.attributes.description,
                        tags: environment?.attributes.tags,
                    }}
                    onSubmit={(values: { key: string; name: string; description: string; tags: string[] }) => {
                        update(values)
                    }}
                >
                    <Form className="flex flex-col gap-5 mb-14">
                        <Field component={Input} name="name" label="Project Name" />
                        <Field component={Input} name="key" label="Key" />
                        <Field component={Input} name="description" label="Description" />
                        <Field component={TagInput} name="tags" label="Tags" />

                        <div className="flex justify-start gap-3">
                            <Button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            >
                                Update
                            </Button>
                        </div>
                    </Form>
                </Formik>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">
                            Danger Zone
                        </span>
                    </div>
                </div>
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Remove this project</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>This will permanently delete this project</p>
                        </div>
                        <div className="mt-5">
                            <button
                                onClick={() => deleteProject()}
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
                            >
                                Delete project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
