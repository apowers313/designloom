import {
    Badge,
    Breadcrumbs,
    Center,
    Divider,
    Group,
    Loader,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";

import { useEntity } from "../../api/client";
import { FieldDisplay, FieldSection } from "../../components/FieldDisplay";
import { RelationshipLinks } from "../../components/RelationshipLinks";

interface Workflow {
    id: string;
    name: string;
    category: string;
    validated: boolean;
    goal: string;
    personas: string[];
    requires_capabilities: string[];
    suggested_components: string[];
    starting_state?: {
        data_type?: string;
        node_count?: string;
        edge_density?: string;
        user_expertise?: string;
    };
    success_criteria?: Array<{ metric: string; target: string }>;
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        personas: Array<{ id: string; name: string }>;
        capabilities: Array<{ id: string; name: string }>;
        components: Array<{ id: string; name: string }>;
    };
}

export function WorkflowDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: workflow, isLoading, error } = useEntity<Workflow>("workflows", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !workflow) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Workflow not found"}
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/workflows" c="dimmed" size="sm">
                    Workflows
                </Text>
                <Text size="sm">{workflow.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{workflow.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{workflow.id}</Badge>
                        <Badge variant="light">{workflow.category}</Badge>
                        <Badge color={workflow.validated ? "green" : "gray"}>
                            {workflow.validated ? "Validated" : "Not Validated"}
                        </Badge>
                    </Group>
                </Stack>
            </Group>

            <Divider />

            <FieldSection title="Goal">
                <Text>{workflow.goal}</Text>
            </FieldSection>

            <FieldSection title="Relationships">
                <Stack gap="md">
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Personas
                        </Text>
                        <RelationshipLinks
                            type="personas"
                            items={workflow._resolved?.personas ?? workflow.personas}
                        />
                    </div>
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Required Capabilities
                        </Text>
                        <RelationshipLinks
                            type="capabilities"
                            items={
                                workflow._resolved?.capabilities ??
                                workflow.requires_capabilities
                            }
                        />
                    </div>
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Suggested Components
                        </Text>
                        <RelationshipLinks
                            type="components"
                            items={
                                workflow._resolved?.components ??
                                workflow.suggested_components
                            }
                        />
                    </div>
                </Stack>
            </FieldSection>

            {workflow.starting_state && (
                <FieldSection title="Starting State">
                    <FieldDisplay
                        label="Data Type"
                        value={workflow.starting_state.data_type}
                        inline
                    />
                    <FieldDisplay
                        label="Node Count"
                        value={workflow.starting_state.node_count}
                        inline
                    />
                    <FieldDisplay
                        label="Edge Density"
                        value={workflow.starting_state.edge_density}
                        inline
                    />
                    <FieldDisplay
                        label="User Expertise"
                        value={workflow.starting_state.user_expertise}
                        inline
                    />
                </FieldSection>
            )}

            {workflow.success_criteria && workflow.success_criteria.length > 0 && (
                <FieldSection title="Success Criteria">
                    {workflow.success_criteria.map((criteria, i) => (
                        <Group key={i} gap="xs">
                            <Text fw={500}>{criteria.metric}:</Text>
                            <Text>{criteria.target}</Text>
                        </Group>
                    ))}
                </FieldSection>
            )}

            {workflow.sources && workflow.sources.length > 0 && (
                <FieldSection title="Sources">
                    {workflow.sources.map((source, i) => (
                        <Stack key={i} gap="xs">
                            <Text
                                component="a"
                                href={source.url}
                                target="_blank"
                                c="blue"
                            >
                                {source.title}
                            </Text>
                            {source.summary && (
                                <Text size="sm" c="dimmed">
                                    {source.summary}
                                </Text>
                            )}
                        </Stack>
                    ))}
                </FieldSection>
            )}

            <FieldSection title="Metadata">
                <Group gap="xl">
                    <FieldDisplay label="Version" value={workflow.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(workflow.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(workflow.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
