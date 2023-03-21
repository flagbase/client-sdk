import { PlusCircleIcon } from '@heroicons/react/20/solid'
import React, { Suspense, useState } from 'react'
import { useQueryClient, useMutation, useQuery } from 'react-query'
import { Await, Link, useLoaderData } from 'react-router-dom'
import Button from '../../../components/button'
import EmptyState from '../../../components/empty-state'
import { Loader } from '../../../components/loader'
import Table from '../../../components/table/table'
import Tag from '../../../components/tag'
import Text from '../../../components/text/text'
import { configureAxios } from '../../lib/axios'
import { useFlagbaseParams } from '../../lib/use-flagbase-params'
import { getFlagsKey } from '../../router/loaders'
import { Environment, useEnvironments } from '../projects/environments'
import { createFlag, fetchFlags, Flag, FlagCreateBody } from './api'
import { flagConstants, flagsColumn } from './constants'
import { CreateFlag } from './flags.modal'

export const useChangeDefaultEnvironment = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (newEnvironment: Environment) => {
            return newEnvironment
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['defaultEnvironment'])
        },
    })
    return mutation
}

export const useDefaultEnvironment = () => {
    const { instanceKey, workspaceKey, projectKey } = useFlagbaseParams()
    const { data: environments } = useEnvironments({
        instanceKey: instanceKey!,
        projectKey: projectKey!,
        workspaceKey: workspaceKey!,
    })
    const query = useQuery(['defaultEnvironment'], {
        queryFn: async () => {
            return environments?.[0]
        },
        enabled: !!environments,
    })
    return query
}

const FlagLink = ({ flag }: { flag: Flag }) => {
    const { data: environment, isLoading } = useDefaultEnvironment()

    if (isLoading) {
        return <Loader />
    }
    return (
        <Link to={`environments/${environment?.attributes.key}/${flag.attributes.key}`}>
            <Button secondary className="py-2">
                Modify
            </Button>
        </Link>
    )
}
const convertFlags = ({ flags, filter }: { flags: Flag[]; filter: string }) => {
    if (!flags) {
        return []
    }

    return Object.values(flags).map((flag: Flag, index: number) => {
        return {
            id: index,
            title: flag.attributes.name,
            href: `/`,
            name: <Text>{flag.attributes.name}</Text>,
            description: <Text>{flag.attributes.description}</Text>,
            tags: (
                <div>
                    {(flag.attributes.tags || []).map((tag) => (
                        <Tag key={tag} className="mr-2">
                            {tag}
                        </Tag>
                    ))}
                </div>
            ),
            action: <FlagLink flag={flag} />,
            key: flag.attributes.key,
        }
    })
}

export const useAddFlag = () => {
    const { instanceKey, workspaceKey, projectKey } = useFlagbaseParams()
    const queryClient = useQueryClient()
    return useMutation(
        (flag: FlagCreateBody) => createFlag({ workspaceKey: workspaceKey!, projectKey: projectKey!, flag }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(getFlagsKey({ instanceKey, workspaceKey, projectKey }))
            },
        }
    )
}

export const useFlags = () => {
    const { instanceKey, workspaceKey, projectKey } = useFlagbaseParams()

    const query = useQuery<Flag[]>(
        getFlagsKey({
            instanceKey,
            workspaceKey,
            projectKey,
        }),
        {
            queryFn: async () => {
                await configureAxios(instanceKey!)
                return fetchFlags({ workspaceKey, projectKey })
            },
            enabled: !!workspaceKey && !!projectKey,
            refetchOnWindowFocus: false,
        }
    )
    return query
}

const Flags: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const { flags: prefetchedFlags } = useLoaderData() as { flags: Flag[] }
    const { data: flags } = useFlags()
    return (
        <Suspense fallback={<Loader />}>
            <Await resolve={prefetchedFlags}>
                {() => (
                    <div className="mt-5">
                        <CreateFlag visible={visible} setVisible={setVisible} />

                        <div className="flex flex-col-reverse md:flex-row gap-3 items-stretch pb-5">
                            <Button
                                onClick={() => setVisible(true)}
                                className="py-2"
                                type="button"
                                suffix={PlusCircleIcon}
                            >
                                {flagConstants.FLAG_ADD_TEXT}
                            </Button>
                        </div>

                        <Table
                            loading={false}
                            dataSource={convertFlags({ flags, filter: '' })}
                            columns={flagsColumn}
                            emptyState={
                                <EmptyState
                                    title="No Flags"
                                    description={'Get started by creating a new flag.'}
                                    cta={
                                        <Button
                                            className="py-2"
                                            suffix={PlusCircleIcon}
                                            onClick={() => setVisible(true)}
                                        >
                                            {flagConstants.FLAG_ADD_TEXT}
                                        </Button>
                                    }
                                />
                            }
                        />
                    </div>
                )}
            </Await>
        </Suspense>
    )
}

export default Flags
