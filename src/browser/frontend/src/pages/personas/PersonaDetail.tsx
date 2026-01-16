import {
    Badge,
    Blockquote,
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

const EXPERTISE_COLORS: Record<string, string> = {
    novice: "blue",
    intermediate: "yellow",
    expert: "green",
};

interface Persona {
    id: string;
    name: string;
    role: string;
    quote?: string;
    bio?: string;
    characteristics: {
        expertise: string;
        time_pressure?: string;
        graph_literacy?: string;
        domain_knowledge?: string;
    };
    motivations?: string[];
    behaviors?: string[];
    goals: string[];
    frustrations?: string[];
    context?: {
        frequency?: string;
        devices?: string[];
        voluntary?: boolean;
    };
    workflows?: string[];
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        workflows: Array<{ id: string; name: string }>;
    };
}

export function PersonaDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: persona, isLoading, error } = useEntity<Persona>("personas", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !persona) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Persona not found"}
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/personas" c="dimmed" size="sm">
                    Personas
                </Text>
                <Text size="sm">{persona.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{persona.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{persona.id}</Badge>
                        <Badge variant="light">{persona.role}</Badge>
                        <Badge
                            color={
                                EXPERTISE_COLORS[persona.characteristics.expertise] ??
                                "gray"
                            }
                        >
                            {persona.characteristics.expertise}
                        </Badge>
                    </Group>
                </Stack>
            </Group>

            <Divider />

            {persona.quote && (
                <Blockquote color="blue" cite={`— ${persona.name}`}>
                    {persona.quote}
                </Blockquote>
            )}

            {persona.bio && (
                <FieldSection title="Bio">
                    <Text>{persona.bio}</Text>
                </FieldSection>
            )}

            <FieldSection title="Characteristics">
                <Group gap="xl" wrap="wrap">
                    <FieldDisplay
                        label="Expertise"
                        value={persona.characteristics.expertise}
                        inline
                    />
                    {persona.characteristics.time_pressure && (
                        <FieldDisplay
                            label="Time Pressure"
                            value={persona.characteristics.time_pressure}
                            inline
                        />
                    )}
                    {persona.characteristics.graph_literacy && (
                        <FieldDisplay
                            label="Graph Literacy"
                            value={persona.characteristics.graph_literacy}
                            inline
                        />
                    )}
                    {persona.characteristics.domain_knowledge && (
                        <FieldDisplay
                            label="Domain Knowledge"
                            value={persona.characteristics.domain_knowledge}
                            inline
                        />
                    )}
                </Group>
            </FieldSection>

            <FieldSection title="Goals">
                <FieldDisplay label="" value={persona.goals} />
            </FieldSection>

            {persona.motivations && persona.motivations.length > 0 && (
                <FieldSection title="Motivations">
                    <FieldDisplay label="" value={persona.motivations} />
                </FieldSection>
            )}

            {persona.behaviors && persona.behaviors.length > 0 && (
                <FieldSection title="Behaviors">
                    <FieldDisplay label="" value={persona.behaviors} />
                </FieldSection>
            )}

            {persona.frustrations && persona.frustrations.length > 0 && (
                <FieldSection title="Frustrations">
                    <FieldDisplay label="" value={persona.frustrations} />
                </FieldSection>
            )}

            {persona.context && (
                <FieldSection title="Context">
                    <Group gap="xl" wrap="wrap">
                        {persona.context.frequency && (
                            <FieldDisplay
                                label="Frequency"
                                value={persona.context.frequency}
                                inline
                            />
                        )}
                        {persona.context.devices && (
                            <FieldDisplay
                                label="Devices"
                                value={persona.context.devices}
                                inline
                            />
                        )}
                        {persona.context.voluntary !== undefined && (
                            <FieldDisplay
                                label="Voluntary"
                                value={persona.context.voluntary}
                                inline
                            />
                        )}
                    </Group>
                </FieldSection>
            )}

            <FieldSection title="Workflows">
                <RelationshipLinks
                    type="workflows"
                    items={persona._resolved?.workflows ?? persona.workflows}
                />
            </FieldSection>

            {persona.sources && persona.sources.length > 0 && (
                <FieldSection title="Sources">
                    {persona.sources.map((source, i) => (
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
                    <FieldDisplay label="Version" value={persona.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(persona.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(persona.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
