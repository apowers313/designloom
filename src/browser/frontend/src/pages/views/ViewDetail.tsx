import {
    Badge,
    Breadcrumbs,
    Center,
    Code,
    Divider,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";

import { useEntity } from "../../api/client";
import { FieldDisplay, FieldSection } from "../../components/FieldDisplay";
import { RelationshipLinks } from "../../components/RelationshipLinks";

interface View {
    id: string;
    name: string;
    description?: string;
    workflows?: string[];
    layout: {
        type: string;
        zones: Array<{
            id: string;
            position: string;
            components?: string[];
            width?: unknown;
            height?: unknown;
            padding?: unknown;
            gap?: unknown;
            visibility?: unknown;
            sticky?: boolean;
            background?: string;
        }>;
        max_width?: unknown;
        centered?: boolean;
        grid_columns?: number;
        grid_gap?: unknown;
        responsive?: unknown;
    };
    states?: Array<{
        id: string;
        type: string;
        description?: string;
        conditions?: string[];
        transitions_to?: Array<{
            state: string;
            trigger: string;
            animation?: string;
        }>;
    }>;
    default_state?: string;
    routes?: Array<{
        path: string;
        title?: string;
        breadcrumb?: string;
        requires_auth?: boolean;
        permissions?: string[];
        params?: Array<{
            name: string;
            type?: string;
            required?: boolean;
            description?: string;
        }>;
    }>;
    data_requirements?: Array<{
        id: string;
        source: string;
        required?: boolean;
        loading_state?: string;
        error_state?: string;
    }>;
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        workflows: Array<{ id: string; name: string }>;
        components: Array<{ id: string; name: string }>;
    };
}

export function ViewDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: view, isLoading, error } = useEntity<View>("views", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !view) {
        return (
            <Center h={400}>
                <Text c="red">{error ? error.message : "View not found"}</Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/views" c="dimmed" size="sm">
                    Views
                </Text>
                <Text size="sm">{view.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{view.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{view.id}</Badge>
                        <Badge variant="light">{view.layout.type}</Badge>
                    </Group>
                </Stack>
            </Group>

            <Divider />

            {view.description && (
                <FieldSection title="Description">
                    <Text>{view.description}</Text>
                </FieldSection>
            )}

            <FieldSection title="Workflows">
                <RelationshipLinks
                    type="workflows"
                    items={view._resolved?.workflows ?? view.workflows}
                />
            </FieldSection>

            <FieldSection title="Layout">
                <Stack gap="md">
                    <Group gap="xl" wrap="wrap">
                        <FieldDisplay
                            label="Type"
                            value={view.layout.type}
                            inline
                        />
                        {view.layout.centered !== undefined && (
                            <FieldDisplay
                                label="Centered"
                                value={view.layout.centered}
                                inline
                            />
                        )}
                        {view.layout.grid_columns && (
                            <FieldDisplay
                                label="Grid Columns"
                                value={view.layout.grid_columns}
                                inline
                            />
                        )}
                        {view.layout.max_width && (
                            <FieldDisplay
                                label="Max Width"
                                value={view.layout.max_width}
                                inline
                            />
                        )}
                    </Group>

                    <Text fw={600} size="sm" mt="md">
                        Zones
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                        {view.layout.zones.map((zone) => (
                            <Paper key={zone.id} withBorder p="md">
                                <Group justify="space-between" mb="sm">
                                    <Code fw={600}>{zone.id}</Code>
                                    <Badge variant="light">{zone.position}</Badge>
                                </Group>
                                {zone.components && zone.components.length > 0 && (
                                    <div>
                                        <Text size="xs" c="dimmed" mb="xs">
                                            Components
                                        </Text>
                                        <RelationshipLinks
                                            type="components"
                                            items={zone.components}
                                        />
                                    </div>
                                )}
                                {zone.sticky && (
                                    <Badge size="xs" mt="xs">
                                        Sticky
                                    </Badge>
                                )}
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Stack>
            </FieldSection>

            {view.routes && view.routes.length > 0 && (
                <FieldSection title="Routes">
                    <Paper withBorder>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Path</Table.Th>
                                    <Table.Th>Title</Table.Th>
                                    <Table.Th>Auth</Table.Th>
                                    <Table.Th>Params</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {view.routes.map((route, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>
                                            <Code>{route.path}</Code>
                                        </Table.Td>
                                        <Table.Td>{route.title ?? "-"}</Table.Td>
                                        <Table.Td>
                                            {route.requires_auth ? (
                                                <Badge color="yellow" size="sm">
                                                    Required
                                                </Badge>
                                            ) : (
                                                <Badge color="gray" size="sm">
                                                    Public
                                                </Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {route.params && route.params.length > 0 ? (
                                                <Group gap="xs">
                                                    {route.params.map((p) => (
                                                        <Badge
                                                            key={p.name}
                                                            size="xs"
                                                            variant="light"
                                                        >
                                                            {p.name}
                                                            {p.required && "*"}
                                                        </Badge>
                                                    ))}
                                                </Group>
                                            ) : (
                                                "-"
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </FieldSection>
            )}

            {view.states && view.states.length > 0 && (
                <FieldSection title="States">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {view.states.map((state) => (
                            <Paper key={state.id} withBorder p="md">
                                <Group justify="space-between" mb="sm">
                                    <Code fw={600}>{state.id}</Code>
                                    <Group gap="xs">
                                        <Badge variant="light">{state.type}</Badge>
                                        {view.default_state === state.id && (
                                            <Badge color="green" size="xs">
                                                Default
                                            </Badge>
                                        )}
                                    </Group>
                                </Group>
                                {state.description && (
                                    <Text size="sm" c="dimmed" mb="sm">
                                        {state.description}
                                    </Text>
                                )}
                                {state.conditions && state.conditions.length > 0 && (
                                    <div>
                                        <Text size="xs" c="dimmed" mb="xs">
                                            Conditions
                                        </Text>
                                        {state.conditions.map((c, i) => (
                                            <Code key={i} size="xs" display="block">
                                                {c}
                                            </Code>
                                        ))}
                                    </div>
                                )}
                                {state.transitions_to &&
                                    state.transitions_to.length > 0 && (
                                        <div>
                                            <Text size="xs" c="dimmed" mb="xs" mt="sm">
                                                Transitions
                                            </Text>
                                            {state.transitions_to.map((t, i) => (
                                                <Group key={i} gap="xs">
                                                    <Text size="xs">→</Text>
                                                    <Badge size="xs" variant="light">
                                                        {t.state}
                                                    </Badge>
                                                    <Text size="xs" c="dimmed">
                                                        on {t.trigger}
                                                    </Text>
                                                </Group>
                                            ))}
                                        </div>
                                    )}
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {view.data_requirements && view.data_requirements.length > 0 && (
                <FieldSection title="Data Requirements">
                    <Paper withBorder>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>ID</Table.Th>
                                    <Table.Th>Source</Table.Th>
                                    <Table.Th>Required</Table.Th>
                                    <Table.Th>Loading State</Table.Th>
                                    <Table.Th>Error State</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {view.data_requirements.map((req, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>
                                            <Code>{req.id}</Code>
                                        </Table.Td>
                                        <Table.Td>
                                            <Code size="xs">{req.source}</Code>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={req.required ? "red" : "gray"}
                                                size="sm"
                                            >
                                                {req.required ? "Yes" : "No"}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {req.loading_state ?? "-"}
                                        </Table.Td>
                                        <Table.Td>
                                            {req.error_state ?? "-"}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </FieldSection>
            )}

            {view.sources && view.sources.length > 0 && (
                <FieldSection title="Sources">
                    {view.sources.map((source, i) => (
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
                    <FieldDisplay label="Version" value={view.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(view.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(view.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
