import React, { Suspense, useState } from 'react';

import { PlusCircleIcon } from '@heroicons/react/24/outline';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { Await, useLoaderData } from 'react-router-dom';

import { Instance } from './instances.functions';
import { AddNewInstanceModal } from './instances.modal';
import Button from '../../../components/button';
import EmptyProject from '../../../components/empty-state/empty-state';
import {
  StackedEntityList,
  StackedEntityListProps,
} from '../../../components/list/stacked-list';
import { Loader } from '../../../components/loader';
import { axios } from '../../lib/axios';
import WelcomeModal from '../welcome/welcome.modal';
import { fetchAccessToken } from '../workspaces/api';

export const useUpdateInstance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (instance: Instance & { newKey: string }) => {
      axios.defaults.baseURL = instance.connectionString;
      const result = await fetchAccessToken(
        instance.accessKey,
        instance.accessSecret,
      );
      const currInstances = JSON.parse(
        localStorage.getItem('instances') || '[]',
      ) as Instance[];
      const filteredInstances = currInstances.filter(
        (i: Instance) => i.key !== instance.key,
      );

      localStorage.setItem(
        'instances',
        JSON.stringify([
          ...filteredInstances,
          { ...instance, key: instance.newKey },
        ]),
      );

      return { ...instance, expiresAt: result.expiresAt };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['instances']);
    },
  });

  return mutation;
};

export const useAddInstance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (instance: Omit<Instance, 'expiresAt'>) => {
      axios.defaults.baseURL = instance.connectionString;
      const result = await fetchAccessToken(
        instance.accessKey,
        instance.accessSecret,
      );
      const currInstances = JSON.parse(
        localStorage.getItem('instances') || '[]',
      ) as Instance[];
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
        ]),
      );

      return { ...instance, expiresAt: result.expiresAt };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['instances']);
    },
  });

  return mutation;
};

export const useRemoveInstance = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (instance: Omit<Instance, 'expiresAt'>) => {
      const currInstances = JSON.parse(
        localStorage.getItem('instances') || '[]',
      ) as Instance[];
      const filteredInstances = currInstances.filter(
        (i: Instance) => i.key !== instance.key,
      );
      localStorage.setItem('instances', JSON.stringify(filteredInstances));

      return { ...instance };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['instances']);
    },
  });

  return mutation;
};

export const useInstance = (instanceKey: string | undefined) => {
  const { data: instances } = useInstances({
    refetchOnWindowFocus: false,
    enabled: !!instanceKey,
  });
  const instance = instanceKey
    ? instances?.find(
        (i) => i.key.toLocaleLowerCase() === instanceKey.toLocaleLowerCase(),
      )
    : null;

  return instance;
};

export const getInstances = () =>
  JSON.parse(localStorage.getItem('instances') || '[]') as Instance[];

export const useInstances = (options?: UseQueryOptions<Instance[]>) => {
  // Define a query to fetch the instances object from the server
  const query = useQuery<Instance[]>(['instances'], getInstances, {
    ...options,
  });

  return query;
};

const Instances: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(
    JSON.parse(
      localStorage.getItem('show-welcome-message') || 'true',
    ) as boolean,
  );

  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState('');

  const { instances: initialInstances } = useLoaderData() as {
    instances: Instance[];
  };

  const { data: instances } = useInstances();
  const transformInstancesToList = (
    instanceList: Instance[],
  ): StackedEntityListProps['entities'] => {
    const instances = instanceList;
    if (!instances) {
      return [];
    }

    return instances
      .filter((instance) => instance.key.includes(filter))
      .map((instance) => {
        return {
          id: instance.key,
          href: `/${instance.key}/workspaces`,
          status: 'Active',
          title: instance.name,
          location: instance.connectionString,
        };
      });
  };

  return (
    <Suspense fallback={<Loader />}>
      <Await resolve={initialInstances} errorElement={<div>Error</div>}>
        {(initialInstances: Instance[]) => (
          <div className="mt-5">
            <AddNewInstanceModal visible={visible} setVisible={setVisible} />
            {instances && instances.length === 0 && (
              <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => {
                  setShowWelcomeModal(false);
                }}
              />
            )}
            {initialInstances && (
              <StackedEntityList
                entities={transformInstancesToList(
                  instances || initialInstances,
                )}
              />
            )}
            {instances && instances.length === 0 && (
              <EmptyProject
                title="You haven't joined an instance yet"
                description="Join an instance now"
                cta={
                  <Button
                    className="py-2 w-fit"
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
  );
};

export default Instances;
