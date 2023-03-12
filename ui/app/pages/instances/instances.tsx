import React, { Suspense, useState } from 'react'

import { Instance } from '../../context/instance'
import { AddNewInstanceModal } from './instances.modal'
import Button from '../../../components/button'
import { Await, useLoaderData } from 'react-router-dom'
import { fetchAccessToken } from '../workspaces/api'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { axios } from '../../lib/axios'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import Input from '../../../components/input'
import EmptyProject from '../../../components/empty-state/empty-state'
import { StackedEntityList, StackedEntityListProps } from '../../../components/list/stacked-list'
import { Loader } from '../../../components/loader'

type Instances = Instance[]

export const useUpdateInstance = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (instance: Instance & { newKey: string }) => {
            axios.defaults.baseURL = instance.connectionString
            const result = await fetchAccessToken(instance.accessKey, instance.accessSecret)
            const currInstances = JSON.parse(localStorage.getItem('instances') || '[]')
            const filteredInstances = currInstances.filter((i: Instance) => i.key !== instance.key)
            localStorage.setItem(
                'instances',
                JSON.stringify([...filteredInstances, { ...instance, key: instance.newKey }])
            )
            return { ...instance, expiresAt: result.expiresAt }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['instances'])
        },
    })
    return mutation
}

export const useAddInstance = () => {
    const mutation = useMutation({
        mutationFn: async (instance: Omit<Instance, 'expiresAt'>) => {
            axios.defaults.baseURL = instance.connectionString
            const result = await fetchAccessToken(instance.accessKey, instance.accessSecret)
            const currInstances = JSON.parse(localStorage.getItem('instances') || '[]')
            localStorage.setItem(
                'instances',
                JSON.stringify([
                    ...currInstances,
                    {
                        ...instance,
                        expiresAt: result.expiresAt,
                        id: result.id,
                        accessToken: result.accessToken,
                    },
                ])
            )
            return { ...instance, expiresAt: result.expiresAt }
        },
    })
    return mutation
}

export const useRemoveInstance = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (instance: Omit<Instance, 'expiresAt'>) => {
            const currInstances = JSON.parse(localStorage.getItem('instances') || '[]')
            const filteredInstances = currInstances.filter((i: Instance) => i.key !== instance.key)
            localStorage.setItem('instances', JSON.stringify(filteredInstances))
            return { ...instance }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['instances'])
        },
    })
    return mutation
}

export const useInstance = (instanceKey: string | undefined) => {
    const { data: instances } = useInstances({
        refetchOnWindowFocus: false,
        enabled: !!instanceKey,
    })
    const instance = instanceKey
        ? instances?.find((i) => i.key.toLocaleLowerCase() === instanceKey.toLocaleLowerCase())
        : null
    return instance
}

export const getInstances = () => JSON.parse(localStorage.getItem('instances') || '[]')

export const useInstances = (options?: any) => {
    // Define a query to fetch the instances object from the server
    const query = useQuery<Instances>(['instances'], getInstances, {
        ...options,
    })

    return query
}

const Instances: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [filter, setFilter] = useState('')

    const { instances: initialInstances } = useLoaderData() as { instances: Instances }

    const { data: instances } = useInstances()
    const transformInstancesToList = (instanceList: Instances): StackedEntityListProps['entities'] => {
        const instances = instanceList
        if (!instances) {
            return []
        }
        return instances
            .filter((instance) => instance.key.includes(filter))
            .map((instance) => {
                return {
                    id: instance.key,
                    href: `/${instance.key.toLowerCase()}/workspaces`,
                    status: 'Active',
                    title: instance.key,
                    location: instance.connectionString,
                }
            })
    }

    return (
        <Suspense fallback={<Loader />}>
            <Await resolve={initialInstances} errorElement={<div>Error</div>}>
                {(initialInstances: Instances) => (
                    <div className="mt-5">
                        <AddNewInstanceModal visible={visible} setVisible={setVisible} />
                        {initialInstances.length > 0 && (
                            <div className="flex flex-col-reverse md:flex-row gap-3 items-stretch pb-5">
                                <Button onClick={() => setVisible(true)} type="button" suffix={PlusCircleIcon}>
                                    Join instance
                                </Button>
                                <div className="flex-auto">
                                    <Input onChange={(event) => setFilter(event.target.value)} placeholder="Search" />
                                </div>
                            </div>
                        )}
                        {initialInstances && (
                            <StackedEntityList entities={transformInstancesToList(instances || initialInstances)} />
                        )}
                        {instances && instances.length === 0 && (
                            <EmptyProject
                                title="You haven't joined an instance yet"
                                description="Join an instance now"
                                cta={
                                    <Button
                                        className="py-2"
                                        onClick={() => setVisible(true)}
                                        type="button"
                                        suffix={PlusCircleIcon}
                                    >
                                        Join instance
                                    </Button>
                                }
                            />
                        )}
                    </div>
                )}
            </Await>
        </Suspense>
    )
}

export default Instances
