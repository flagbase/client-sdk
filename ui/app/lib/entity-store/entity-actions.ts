import { Entity, EntityStore, ReducerEntityStore } from './entity-store'

export type EntityActions<T> = {
    addEntity: (entity: Entity<T>) => void
    addEntities: (entities: { [entityId: string]: Entity<T> }) => void
    removeEntity: (entityId: string) => void
    clearEntities: () => void
    setError: (error: string) => void
    setStatus: (status: string) => void
    setSelectedEntityId: (selectedEntityId: string) => void
    selectEntity: (entity: Entity<T>) => void
    getEntity: (entityId: string) => Entity<T> | undefined
}

export const createLocalStorageActions = <T>(
    state: EntityStore<T>,
    setState: (state: EntityStore<T>) => void
): EntityActions<T> => ({
    addEntity: (entity: Entity<T>) => {
        setState({
            ...state,
            entities: { ...state.entities, [entity.id]: entity },
        })
    },
    addEntities: (entities: { [entityId: string]: Entity<T> }) =>
        setState({ ...state, entities: { ...state.entities, ...entities } }),
    removeEntity: (entityId: string) => {
        const { [entityId]: _, ...rest } = state.entities
        setState({
            ...state,
            entities: { ...rest },
        })
    },
    clearEntities: () =>
        setState({
            ...state,
            entities: {},
            selectedEntityId: null,
        }),
    setError: (error: string) => setState({ ...state, error }),
    setStatus: (status: string) => setState({ ...state, status }),
    setSelectedEntityId: (selectedEntityId: string) => setState({ ...state, selectedEntityId }),
    selectEntity: (entity: Entity<T>) => setState({ ...state, selectedEntityId: entity.id }),
    getEntity: (entityId: string): Entity<T> | undefined => state.entities[entityId],
})

export const createActions = <T>(
    state: EntityStore<T>,
    setState: (state: Partial<EntityStore<T>>) => void
): EntityActions<T> => ({
    addEntity: (entity: Entity<T>) => {
        setState({
            entities: {
                ...state.entities,
                [entity.id]: entity,
            },
        })
    },
    addEntities: (entities: { [entityId: string]: Entity<T> }) =>
        setState({
            entities: { ...entities },
        }),
    removeEntity: (entityId: string) => {
        const { [entityId]: _, ...rest } = state.entities
        setState({
            entities: {
                ...rest,
            },
        })
    },
    clearEntities: () =>
        setState({
            entities: {},
            selectedEntityId: null,
        }),
    setError: (error: string) => setState({ ...state, error }),
    setStatus: (status: string) => setState({ status: status }),
    setSelectedEntityId: (selectedEntityId: string) => setState({ ...state, selectedEntityId }),
    selectEntity: (entity: Entity<T>) => setState({ ...state, selectedEntityId: entity.id }),
    getEntity: (entityId: string): Entity<T> | undefined => state.entities[entityId],
})
