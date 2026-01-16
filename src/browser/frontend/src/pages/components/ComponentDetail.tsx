import {
    Badge,
    Breadcrumbs,
    Center,
    Code,
    Divider,
    Group,
    Loader,
    Paper,
    Stack,
    Table,
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

interface Component {
    id: string;
    name: string;
    category: string;
    description: string;
    status: string;
    implements_capabilities?: string[];
    used_in_workflows?: string[];
    dependencies?: string[];
    interaction_pattern?: string;
    props?: Record<string, unknown>;
    slots?: Array<{
        name: string;
        description?: string;
        allowed_components?: string[];
        render_prop?: string;
    }>;
    anatomy?: Array<{
        name: string;
        element?: string;
        description?: string;
        selector?: string;
        customizable?: boolean;
    }>;
    variants?: Array<{
        name: string;
        description?: string;
        tokens?: Record<string, string>;
        default?: boolean;
    }>;
    sizes?: Array<{
        name: string;
        description?: string;
        tokens?: Record<string, string>;
        default?: boolean;
    }>;
    interactions?: unknown;
    accessibility?: {
        role?: string;
        label_required?: boolean;
        keyboard_support?: string[];
    };
    implementation_hints?: {
        extends?: string;
        forward_ref?: boolean;
        compound?: boolean;
        controlled?: string;
    };
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        capabilities: Array<{ id: string; name: string }>;
        workflows: Array<{ id: string; name: string }>;
        dependents: Array<{ id: string; name: string }>;
    };
}

export function ComponentDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: component, isLoading, error } = useEntity<Component>("components", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !component) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Component not found"}
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/components" c="dimmed" size="sm">
                    Components
                </Text>
                <Text size="sm">{component.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{component.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{component.id}</Badge>
                        <Badge variant="light">{component.category}</Badge>
                        <Badge color={STATUS_COLORS[component.status] ?? "gray"}>
                            {component.status}
                        </Badge>
                    </Group>
                </Stack>
            </Group>

            <Divider />

            <FieldSection title="Description">
                <Text>{component.description}</Text>
            </FieldSection>

            <FieldSection title="Relationships">
                <Stack gap="md">
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Implements Capabilities
                        </Text>
                        <RelationshipLinks
                            type="capabilities"
                            items={
                                component._resolved?.capabilities ??
                                component.implements_capabilities
                            }
                        />
                    </div>
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Used in Workflows
                        </Text>
                        <RelationshipLinks
                            type="workflows"
                            items={
                                component._resolved?.workflows ??
                                component.used_in_workflows
                            }
                        />
                    </div>
                    <div>
                        <Text fw={600} size="sm" mb="xs">
                            Dependencies
                        </Text>
                        <RelationshipLinks
                            type="components"
                            items={component.dependencies}
                        />
                    </div>
                    {component.interaction_pattern && (
                        <div>
                            <Text fw={600} size="sm" mb="xs">
                                Interaction Pattern
                            </Text>
                            <RelationshipLinks
                                type="interactions"
                                items={[component.interaction_pattern]}
                            />
                        </div>
                    )}
                </Stack>
            </FieldSection>

            {component.props && Object.keys(component.props).length > 0 && (
                <FieldSection title="Props">
                    <Paper withBorder>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Required</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Object.entries(component.props).map(
                                    ([name, value]) => {
                                        const isSimple = typeof value === "string";
                                        const prop = isSimple
                                            ? { type: value }
                                            : (value as Record<string, unknown>);
                                        return (
                                            <Table.Tr key={name}>
                                                <Table.Td>
                                                    <Code>{name}</Code>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Code>
                                                        {String(prop.type ?? "unknown")}
                                                    </Code>
                                                </Table.Td>
                                                <Table.Td>
                                                    {prop.required ? (
                                                        <Badge color="red" size="sm">
                                                            Required
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            color="gray"
                                                            size="sm"
                                                        >
                                                            Optional
                                                        </Badge>
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    {String(prop.description ?? isSimple ? value : "-")}
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    }
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </FieldSection>
            )}

            {component.slots && component.slots.length > 0 && (
                <FieldSection title="Slots">
                    {component.slots.map((slot, i) => (
                        <Paper key={i} withBorder p="sm">
                            <Group justify="space-between">
                                <Code>{slot.name}</Code>
                                {slot.render_prop && (
                                    <Code size="xs">{slot.render_prop}</Code>
                                )}
                            </Group>
                            {slot.description && (
                                <Text size="sm" mt="xs">
                                    {slot.description}
                                </Text>
                            )}
                            {slot.allowed_components &&
                                slot.allowed_components.length > 0 && (
                                    <Group gap="xs" mt="xs">
                                        <Text size="xs" c="dimmed">
                                            Allowed:
                                        </Text>
                                        {slot.allowed_components.map((c) => (
                                            <Badge key={c} size="xs" variant="light">
                                                {c}
                                            </Badge>
                                        ))}
                                    </Group>
                                )}
                        </Paper>
                    ))}
                </FieldSection>
            )}

            {component.anatomy && component.anatomy.length > 0 && (
                <FieldSection title="Anatomy">
                    <Paper withBorder>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Part</Table.Th>
                                    <Table.Th>Element</Table.Th>
                                    <Table.Th>Selector</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {component.anatomy.map((part, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>
                                            <Code>{part.name}</Code>
                                        </Table.Td>
                                        <Table.Td>
                                            {part.element && (
                                                <Code>{part.element}</Code>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {part.selector && (
                                                <Code size="xs">
                                                    {part.selector}
                                                </Code>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {part.description}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </FieldSection>
            )}

            {component.variants && component.variants.length > 0 && (
                <FieldSection title="Variants">
                    <Group gap="md">
                        {component.variants.map((variant, i) => (
                            <Paper key={i} withBorder p="sm" miw={150}>
                                <Group justify="space-between">
                                    <Text fw={500}>{variant.name}</Text>
                                    {variant.default && (
                                        <Badge size="xs">Default</Badge>
                                    )}
                                </Group>
                                {variant.description && (
                                    <Text size="sm" c="dimmed" mt="xs">
                                        {variant.description}
                                    </Text>
                                )}
                            </Paper>
                        ))}
                    </Group>
                </FieldSection>
            )}

            {component.sizes && component.sizes.length > 0 && (
                <FieldSection title="Sizes">
                    <Group gap="md">
                        {component.sizes.map((size, i) => (
                            <Paper key={i} withBorder p="sm" miw={100}>
                                <Group justify="space-between">
                                    <Badge variant="light">{size.name}</Badge>
                                    {size.default && (
                                        <Badge size="xs">Default</Badge>
                                    )}
                                </Group>
                            </Paper>
                        ))}
                    </Group>
                </FieldSection>
            )}

            {component.accessibility && (
                <FieldSection title="Accessibility">
                    <Group gap="xl" wrap="wrap">
                        {component.accessibility.role && (
                            <FieldDisplay
                                label="ARIA Role"
                                value={component.accessibility.role}
                                inline
                            />
                        )}
                        {component.accessibility.label_required !== undefined && (
                            <FieldDisplay
                                label="Label Required"
                                value={component.accessibility.label_required}
                                inline
                            />
                        )}
                    </Group>
                    {component.accessibility.keyboard_support && (
                        <FieldDisplay
                            label="Keyboard Support"
                            value={component.accessibility.keyboard_support}
                        />
                    )}
                </FieldSection>
            )}

            {component.implementation_hints && (
                <FieldSection title="Implementation Hints">
                    <Group gap="xl" wrap="wrap">
                        {component.implementation_hints.extends && (
                            <FieldDisplay
                                label="Extends"
                                value={component.implementation_hints.extends}
                                inline
                            />
                        )}
                        {component.implementation_hints.forward_ref !== undefined && (
                            <FieldDisplay
                                label="Forward Ref"
                                value={component.implementation_hints.forward_ref}
                                inline
                            />
                        )}
                        {component.implementation_hints.compound !== undefined && (
                            <FieldDisplay
                                label="Compound"
                                value={component.implementation_hints.compound}
                                inline
                            />
                        )}
                        {component.implementation_hints.controlled && (
                            <FieldDisplay
                                label="Controlled"
                                value={component.implementation_hints.controlled}
                                inline
                            />
                        )}
                    </Group>
                </FieldSection>
            )}

            {component.interactions && (
                <FieldSection title="Interactions">
                    <Code block style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(component.interactions, null, 2)}
                    </Code>
                </FieldSection>
            )}

            {component.sources && component.sources.length > 0 && (
                <FieldSection title="Sources">
                    {component.sources.map((source, i) => (
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
                    <FieldDisplay label="Version" value={component.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(component.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(component.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
