import { PlusCircleIcon } from '@heroicons/react/20/solid'
import React, { useEffect } from 'react'
import { useRevalidator } from 'react-router-dom'
import Button from '../../../components/button/button'
import EmptyState from '../../../components/empty-state/empty-state'
import { Loader } from '../../../components/loader'
import { useVariations } from '../variations/variations'
import { TargetingRuleRequest } from './api'
import { newRuleFactory, useAddTargetingRule, useTargetingRules } from './targeting'
import TargetingRule from './targeting-rule'

export const TargetingRules = () => {
    const targetingRulesQuery = useTargetingRules()
    const variationsQuery = useVariations()
    const revalidator = useRevalidator()
    const addTargetingMutation = useAddTargetingRule()
    const [sampleRule, setSampleRule] = React.useState<TargetingRuleRequest>()
    useEffect(() => {
        if (variationsQuery.data) {
            const sample = newRuleFactory(variationsQuery.data)
            setSampleRule(sample)
        }
    }, [variationsQuery.data])

    if (
        targetingRulesQuery.isLoading ||
        targetingRulesQuery.isFetching ||
        variationsQuery.isLoading ||
        addTargetingMutation.isLoading ||
        !sampleRule
    ) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        )
    }

    if (targetingRulesQuery.isError || targetingRulesQuery.isIdle || variationsQuery.isError) {
        return (
            <EmptyState
                cta={
                    <Button
                        onClick={() => {
                            revalidator.revalidate()
                        }}
                        prefix={PlusCircleIcon}
                    >
                        Retry
                    </Button>
                }
                title="Error"
                description="Could not fetch targeting"
            />
        )
    }

    const { data: targetingRules } = targetingRulesQuery

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
            {targetingRules.length ? (
                <ul role="list" className="divide-y divide-gray-200">
                    {targetingRules?.reverse().map((rule) => (
                        <li key={rule.key}>
                            <div className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <TargetingRule rule={rule.attributes} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="m-10">
                    <EmptyState
                        title="No rules"
                        description="This flag has no targeting rules yet."
                        cta={
                            <Button
                                className="py-2"
                                type="submit"
                                onClick={async () => addTargetingMutation.mutate(sampleRule)}
                                suffix={PlusCircleIcon}
                            >
                                Create a rule
                            </Button>
                        }
                    />
                </div>
            )}
        </div>
    )
}
