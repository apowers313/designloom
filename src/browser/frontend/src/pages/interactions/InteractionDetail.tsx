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

interface InteractionPattern {
    id: string;
    name: string;
    description?: string;
    interaction: {
        states?: Array<{
            type: string;
            name?: string;
            description?: string;
            style: Record<string, unknown>;
            css_pseudo?: string;
            aria_attribute?: string;
            combinable?: boolean;
        }>;
        transitions?: Array<{
            from: string | string[];
            to: string;
            trigger: string;
            animation?: {
                duration?: string;
                easing?: string;
                delay?: string;
                properties?: string[];
            };
            reversible?: boolean;
            condition?: string;
        }>;
        microinteractions?: Array<{
            id: string;
            name?: string;
            description?: string;
            trigger: {
                type: string;
                target?: string;
                key?: string;
                custom_event?: string;
            };
            rules: string[];
            feedback: Array<{
                type: string;
                description: string;
            }>;
            loops_and_modes?: {
                type: string;
                iterations?: number;
                interval?: string;
            };
        }>;
        accessibility?: {
            keyboard?: {
                focusable?: boolean;
                tab_index?: number;
                shortcuts?: Array<{
                    key: string;
                    action: string;
                    description?: string;
                }>;
                arrow_navigation?: string;
                focus_trap?: boolean;
            };
            aria?: {
                role?: string;
                attributes?: Record<string, string>;
            };
            label?: string;
            description?: string;
            live_region?: string;
            reduced_motion?: {
                alternative?: string;
                disable_animations?: boolean;
            };
        };
        default_transition?: {
            duration?: string;
            easing?: string;
        };
    };
    applies_to?: string[];
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        components_using: Array<{ id: string; name: string }>;
    };
}

export function InteractionDetail() {
    const { id } = useParams<{ id: string }>();
    const {
        data: interaction,
        isLoading,
        error,
    } = useEntity<InteractionPattern>("interactions", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !interaction) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Interaction pattern not found"}
                </Text>
            </Center>
        );
    }

    const { interaction: int } = interaction;

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/interactions" c="dimmed" size="sm">
                    Interactions
                </Text>
                <Text size="sm">{interaction.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{interaction.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{interaction.id}</Badge>
                        {interaction.applies_to &&
                            interaction.applies_to.map((cat) => (
                                <Badge key={cat} variant="light">
                                    {cat}
                                </Badge>
                            ))}
                    </Group>
                </Stack>
            </Group>

            <Divider />

            {interaction.description && (
                <FieldSection title="Description">
                    <Text>{interaction.description}</Text>
                </FieldSection>
            )}

            {interaction._resolved?.components_using &&
                interaction._resolved.components_using.length > 0 && (
                    <FieldSection title="Used By Components">
                        <RelationshipLinks
                            type="components"
                            items={interaction._resolved.components_using}
                        />
                    </FieldSection>
                )}

            {int.states && int.states.length > 0 && (
                <FieldSection title="States">
                    <Paper withBorder>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>CSS Pseudo</Table.Th>
                                    <Table.Th>ARIA</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {int.states.map((state, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Badge variant="light">
                                                    {state.type}
                                                </Badge>
                                                {state.name && (
                                                    <Text size="sm">
                                                        ({state.name})
                                                    </Text>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            {state.css_pseudo ? (
                                                <Code size="xs">
                                                    {state.css_pseudo}
                                                </Code>
                                            ) : (
                                                "-"
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {state.aria_attribute ? (
                                                <Code size="xs">
                                                    {state.aria_attribute}
                                                </Code>
                                            ) : (
                                                "-"
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {state.description ?? "-"}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </FieldSection>
            )}

            {int.transitions && int.transitions.length > 0 && (
                <FieldSection title="Transitions">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        {int.transitions.map((trans, i) => (
                            <Paper key={i} withBorder p="md">
                                <Group gap="sm" mb="sm">
                                    <Badge variant="outline">
                                        {Array.isArray(trans.from)
                                            ? trans.from.join(", ")
                                            : trans.from}
                                    </Badge>
                                    <Text>→</Text>
                                    <Badge variant="filled">{trans.to}</Badge>
                                </Group>
                                <Group gap="xl" wrap="wrap">
                                    <div>
                                        <Text size="xs" c="dimmed">
                                            Trigger
                                        </Text>
                                        <Code>{trans.trigger}</Code>
                                    </div>
                                    {trans.animation && (
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Animation
                                            </Text>
                                            <Code size="xs">
                                                {trans.animation.duration ?? "auto"}{" "}
                                                {trans.animation.easing ?? "ease"}
                                            </Code>
                                        </div>
                                    )}
                                    {trans.reversible && (
                                        <Badge size="xs" color="blue">
                                            Reversible
                                        </Badge>
                                    )}
                                </Group>
                                {trans.condition && (
                                    <Text size="xs" c="dimmed" mt="xs">
                                        Condition: {trans.condition}
                                    </Text>
                                )}
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {int.microinteractions && int.microinteractions.length > 0 && (
                <FieldSection title="Microinteractions">
                    {int.microinteractions.map((micro, i) => (
                        <Paper key={i} withBorder p="md">
                            <Group justify="space-between" mb="sm">
                                <Group gap="sm">
                                    <Code fw={600}>{micro.id}</Code>
                                    {micro.name && (
                                        <Text size="sm">{micro.name}</Text>
                                    )}
                                </Group>
                                <Badge variant="light">
                                    {micro.trigger.type}
                                </Badge>
                            </Group>
                            {micro.description && (
                                <Text size="sm" c="dimmed" mb="sm">
                                    {micro.description}
                                </Text>
                            )}
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <div>
                                    <Text size="xs" fw={500} mb="xs">
                                        Rules
                                    </Text>
                                    {micro.rules.map((rule, j) => (
                                        <Text key={j} size="sm">
                                            • {rule}
                                        </Text>
                                    ))}
                                </div>
                                <div>
                                    <Text size="xs" fw={500} mb="xs">
                                        Feedback
                                    </Text>
                                    {micro.feedback.map((fb, j) => (
                                        <Group key={j} gap="xs">
                                            <Badge size="xs" variant="light">
                                                {fb.type}
                                            </Badge>
                                            <Text size="sm">
                                                {fb.description}
                                            </Text>
                                        </Group>
                                    ))}
                                </div>
                            </SimpleGrid>
                        </Paper>
                    ))}
                </FieldSection>
            )}

            {int.accessibility && (
                <FieldSection title="Accessibility">
                    <Stack gap="md">
                        {int.accessibility.keyboard && (
                            <Paper withBorder p="md">
                                <Text fw={600} mb="sm">
                                    Keyboard
                                </Text>
                                <Group gap="xl" wrap="wrap">
                                    <FieldDisplay
                                        label="Focusable"
                                        value={int.accessibility.keyboard.focusable}
                                        inline
                                    />
                                    {int.accessibility.keyboard.tab_index !==
                                        undefined && (
                                        <FieldDisplay
                                            label="Tab Index"
                                            value={
                                                int.accessibility.keyboard.tab_index
                                            }
                                            inline
                                        />
                                    )}
                                    {int.accessibility.keyboard.arrow_navigation && (
                                        <FieldDisplay
                                            label="Arrow Navigation"
                                            value={
                                                int.accessibility.keyboard
                                                    .arrow_navigation
                                            }
                                            inline
                                        />
                                    )}
                                    {int.accessibility.keyboard.focus_trap && (
                                        <Badge>Focus Trap</Badge>
                                    )}
                                </Group>
                                {int.accessibility.keyboard.shortcuts &&
                                    int.accessibility.keyboard.shortcuts.length >
                                        0 && (
                                        <div>
                                            <Text size="sm" fw={500} mt="md" mb="xs">
                                                Shortcuts
                                            </Text>
                                            {int.accessibility.keyboard.shortcuts.map(
                                                (s, i) => (
                                                    <Group key={i} gap="sm">
                                                        <Code size="xs">
                                                            {s.key}
                                                        </Code>
                                                        <Text size="sm">
                                                            {s.action}
                                                        </Text>
                                                    </Group>
                                                )
                                            )}
                                        </div>
                                    )}
                            </Paper>
                        )}
                        {int.accessibility.aria && (
                            <Paper withBorder p="md">
                                <Text fw={600} mb="sm">
                                    ARIA
                                </Text>
                                {int.accessibility.aria.role && (
                                    <FieldDisplay
                                        label="Role"
                                        value={int.accessibility.aria.role}
                                        inline
                                    />
                                )}
                                {int.accessibility.aria.attributes && (
                                    <Code
                                        block
                                        mt="sm"
                                        style={{ whiteSpace: "pre-wrap" }}
                                    >
                                        {JSON.stringify(
                                            int.accessibility.aria.attributes,
                                            null,
                                            2
                                        )}
                                    </Code>
                                )}
                            </Paper>
                        )}
                        {int.accessibility.reduced_motion && (
                            <Paper withBorder p="md">
                                <Text fw={600} mb="sm">
                                    Reduced Motion
                                </Text>
                                <FieldDisplay
                                    label="Disable Animations"
                                    value={
                                        int.accessibility.reduced_motion
                                            .disable_animations
                                    }
                                    inline
                                />
                                {int.accessibility.reduced_motion.alternative && (
                                    <Text size="sm" mt="xs">
                                        Alternative:{" "}
                                        {int.accessibility.reduced_motion.alternative}
                                    </Text>
                                )}
                            </Paper>
                        )}
                    </Stack>
                </FieldSection>
            )}

            {int.default_transition && (
                <FieldSection title="Default Transition">
                    <Group gap="xl">
                        <FieldDisplay
                            label="Duration"
                            value={int.default_transition.duration}
                            inline
                        />
                        <FieldDisplay
                            label="Easing"
                            value={int.default_transition.easing}
                            inline
                        />
                    </Group>
                </FieldSection>
            )}

            {interaction.sources && interaction.sources.length > 0 && (
                <FieldSection title="Sources">
                    {interaction.sources.map((source, i) => (
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
                    <FieldDisplay
                        label="Version"
                        value={interaction.version}
                        inline
                    />
                    <FieldDisplay
                        label="Created"
                        value={new Date(interaction.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(interaction.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
