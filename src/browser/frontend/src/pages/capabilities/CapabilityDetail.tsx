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

const STATUS_COLORS: Record<string, string> = {
    planned: "gray",
    "in-progress": "yellow",
    implemented: "green",
    deprecated: "red",
};

interface Capability {
    id: string;
    name: string;
    category: string;
    description: string;
    status: string;
    algorithms?: string[];
    requirements?: string[];
    used_by_workflows?: string[];
    implemented_by_components?: string[];
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        workflows: Array<{ id: string; name: string }>;
        components: Array<{ id: string; name: string }>;
    };
}

export function CapabilityDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: capability, isLoading, error } = useEntity<Capability>("capabilities", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !capability) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Capability not found"}
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/capabilities" c="dimmed" size="sm">
                    Capabilities
                </Text>
                <Text size="sm">{capability.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{capability.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{capability.id}</Badge>
                        <Badge variant="light">{capability.category}</Badge>
                        <Badge color={STATUS_COLORS[capability.status] ?? "gray"}>
                            {capability.status}
                        </Badge>
                    </Group>
                </Stack>
            </Group>

            <Divider />

            <FieldSection title="Description">
                <Text>{capability.description}</Text>
            </FieldSection>

            <FieldSection title="Relationships">
                <Stack gap="md">
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Used by Workflows
                        </Text>
                        <RelationshipLinks
                            type="workflows"
                            items={
                                capability._resolved?.workflows ??
                                capability.used_by_workflows
                            }
                        />
                    </div>
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Implemented by Components
                        </Text>
                        <RelationshipLinks
                            type="components"
                            items={
                                capability._resolved?.components ??
                                capability.implemented_by_components
                            }
                        />
                    </div>
                </Stack>
            </FieldSection>

            {capability.algorithms && capability.algorithms.length > 0 && (
                <FieldSection title="Algorithms">
                    <FieldDisplay label="" value={capability.algorithms} />
                </FieldSection>
            )}

            {capability.requirements && capability.requirements.length > 0 && (
                <FieldSection title="Requirements">
                    <FieldDisplay label="" value={capability.requirements} />
                </FieldSection>
            )}

            {capability.sources && capability.sources.length > 0 && (
                <FieldSection title="Sources">
                    {capability.sources.map((source, i) => (
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
                    <FieldDisplay label="Version" value={capability.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(capability.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(capability.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
