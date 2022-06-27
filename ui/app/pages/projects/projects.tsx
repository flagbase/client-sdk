import { Alert, Col, Dropdown, Input, Menu, notification, Row, Typography } from 'antd'
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'

import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Attributes, Project, ProjectContext } from '../../context/project'
import Table from '../../../components/table/table'
import { fetchProjects } from './api'
import { Instance, InstanceContext } from '../../context/instance'
import { Entities, Entity } from '../../lib/entity-store/entity-store'
import { Layout, Content } from '../../../components/layout'
import Button from '../../../components/button'
import { CreateProject } from './projects.modal'
import { Link } from 'react-router-dom'
import { constants as instanceConstants } from '../instances/instances.constants'
import { constants, projectsColumn } from './projects.constants'
import merge from 'lodash.merge'

const { Title, Text } = Typography

export const convertProjects = (
    projectList: Entities<Project>,
    instance: Instance,
    filter: string = '',
    addEntity?: (entity: Entity<Project>) => void,
    removeEntity?: (entityId: string) => void
) => {
    if (!projectList) {
        return []
    }

    return Object.values(projectList)
        .filter(
            (project): project is Entity<Project> => project !== undefined && project.attributes.key.includes(filter)
        )
        .map((project: Entity<Project>, index: number) => {
            const updateProject = (update: Partial<Attributes>) => {
                if (addEntity) {
                    const mergedEntity = merge(project, { attributes: update })
                    addEntity(mergedEntity)
                }
            }

            const menu = (
                <Menu>
                    {removeEntity && (
                        <Menu.Item onClick={() => removeEntity(project.id)} key="1">
                            Remove
                        </Menu.Item>
                    )}
                </Menu>
            )
            return {
                id: index,
                title: project.attributes.name,
                href: `/flags/${instance?.id}/${project?.id}`,
                name: (
                    <Text editable={{ onChange: (value) => updateProject({ name: value }) }}>
                        {project.attributes.name}
                    </Text>
                ),
                description: (
                    <Text editable={{ onChange: (value) => updateProject({ description: value }) }}>
                        {project.attributes.description}
                    </Text>
                ),
                tags: project.attributes.tags?.join(', '),
                action: (
                    <>
                        <Dropdown overlay={menu}>
                            <Link to={`/flags/${instance?.id}/${project?.id}`}>Connect</Link>
                        </Dropdown>
                    </>
                ),
            }
        })
}

const Projects: React.FC = () => {
    const { workspaceKey, instanceKey } = useParams<{ workspaceKey: string; instanceKey: string }>()
    if (!workspaceKey || !instanceKey) {
        return <Alert message="Could not load this instance" type="error" />
    }

    const [visible, setVisible] = useState(false)
    const [filter, setFilter] = useState('')
    const { getEntity, setSelectedEntityId } = useContext(InstanceContext)
    const {
        entities: projects,
        addEntity,
        addEntities,
        setStatus,
        status,
        clearEntities,
        removeEntity,
    } = useContext(ProjectContext)

    const instance = getEntity(instanceKey)
    if (!instance) {
        return <Alert message={instanceConstants.error} type="error" />
    }

    useEffect(() => {
        setStatus('loading')
        setSelectedEntityId(instanceKey)
        clearEntities()
        fetchProjects(instance.connectionString, workspaceKey, instance.accessToken)
            .then((result) => {
                if (result.length == 0) {
                    return
                }
                const projectList = result.reduce((previous, workspace) => {
                    return {
                        ...previous,
                        [workspace.id]: workspace,
                    }
                }, {})
                addEntities(projectList)
            })
            .catch(() => {
                notification.error({
                    message: constants.error,
                })
            })
            .finally(() => {
                setStatus('loaded')
            })

        return () => {
            setStatus('idle')
        }
    }, [workspaceKey])

    return (
        <React.Fragment>
            <CreateProject visible={visible} setVisible={setVisible} />

            <Title level={3}>Join a project</Title>

            <Layout>
                <Content>
                    <Row wrap={false} gutter={12}>
                        <Col flex="none">
                            <Button onClick={() => setVisible(true)} type="primary" icon={<PlusCircleOutlined />}>
                                {constants.create}
                            </Button>
                        </Col>
                        <Col flex="auto">
                            <Input
                                onChange={(event) => setFilter(event.target.value)}
                                placeholder="Search"
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                    </Row>
                    <Table
                        loading={status !== 'loaded'}
                        dataSource={convertProjects(projects, instance, filter, addEntity, removeEntity)}
                        columns={projectsColumn}
                    />
                </Content>
            </Layout>
        </React.Fragment>
    )
}

export default Projects
