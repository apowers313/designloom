import {
    Badge,
    Box,
    Breadcrumbs,
    Center,
    Code,
    ColorSwatch,
    Divider,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";

import { useEntity } from "../../api/client";
import { FieldDisplay, FieldSection } from "../../components/FieldDisplay";
import { RelationshipLinks } from "../../components/RelationshipLinks";

interface Tokens {
    id: string;
    name: string;
    description?: string;
    extends?: string;
    colors?: Record<string, unknown>;
    typography?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    radii?: Record<string, unknown>;
    shadows?: Record<string, unknown>;
    borders?: Record<string, unknown>;
    motion?: Record<string, unknown>;
    breakpoints?: Record<string, unknown>;
    z_index?: Record<string, unknown>;
    sources?: Array<{ title: string; url: string; summary?: string }>;
    version: string;
    created_at: string;
    updated_at: string;
    _resolved?: {
        extends_theme?: { id: string; name: string };
    };
}

/**
 * Renders a color swatch with label
 */
function ColorDisplay({ name, value }: { name: string; value: string }) {
    const isValidColor =
        /^#[0-9A-Fa-f]{3,8}$|^rgb|^hsl|^oklch/.test(value) ||
        /^[a-z]+$/i.test(value);

    return (
        <Group gap="sm">
            {isValidColor && (
                <ColorSwatch color={value} size={24} radius="sm" />
            )}
            <Stack gap={0}>
                <Text size="xs" fw={500}>
                    {name}
                </Text>
                <Code size="xs">{value}</Code>
            </Stack>
        </Group>
    );
}

/**
 * Renders a color scale (e.g., primary.50, primary.100, etc.)
 */
function ColorScale({
    name,
    scale,
}: {
    name: string;
    scale: Record<string, string>;
}) {
    return (
        <Paper withBorder p="md">
            <Text fw={600} mb="sm">
                {name}
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4, md: 6 }} spacing="sm">
                {Object.entries(scale).map(([key, value]) => (
                    <ColorDisplay
                        key={key}
                        name={key}
                        value={typeof value === "string" ? value : JSON.stringify(value)}
                    />
                ))}
            </SimpleGrid>
        </Paper>
    );
}

export function TokensDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: tokens, isLoading, error } = useEntity<Tokens>("tokens", id!);

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error || !tokens) {
        return (
            <Center h={400}>
                <Text c="red">
                    {error ? error.message : "Tokens not found"}
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Breadcrumbs>
                <Text component={Link} to="/tokens" c="dimmed" size="sm">
                    Tokens
                </Text>
                <Text size="sm">{tokens.id}</Text>
            </Breadcrumbs>

            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={2}>{tokens.name}</Title>
                    <Group gap="sm">
                        <Badge size="lg">{tokens.id}</Badge>
                        {tokens.extends && (
                            <Badge variant="light">
                                extends: {tokens.extends}
                            </Badge>
                        )}
                    </Group>
                </Stack>
            </Group>

            <Divider />

            {tokens.description && (
                <FieldSection title="Description">
                    <Text>{tokens.description}</Text>
                </FieldSection>
            )}

            {tokens.extends && (
                <FieldSection title="Extends">
                    <RelationshipLinks
                        type="tokens"
                        items={
                            tokens._resolved?.extends_theme
                                ? [tokens._resolved.extends_theme]
                                : [tokens.extends]
                        }
                    />
                </FieldSection>
            )}

            {tokens.colors && (
                <FieldSection title="Colors">
                    <Stack gap="md">
                        {Object.entries(tokens.colors).map(([name, value]) => {
                            if (
                                typeof value === "object" &&
                                value !== null &&
                                !Array.isArray(value)
                            ) {
                                return (
                                    <ColorScale
                                        key={name}
                                        name={name}
                                        scale={value as Record<string, string>}
                                    />
                                );
                            }
                            return (
                                <ColorDisplay
                                    key={name}
                                    name={name}
                                    value={String(value)}
                                />
                            );
                        })}
                    </Stack>
                </FieldSection>
            )}

            {tokens.typography && (
                <FieldSection title="Typography">
                    <Stack gap="md">
                        {Object.entries(tokens.typography).map(([category, values]) => (
                            <Paper key={category} withBorder p="md">
                                <Text fw={600} mb="sm" tt="capitalize">
                                    {category.replace(/_/g, " ")}
                                </Text>
                                {typeof values === "object" && values !== null ? (
                                    <SimpleGrid
                                        cols={{ base: 2, sm: 3, md: 4 }}
                                        spacing="sm"
                                    >
                                        {Object.entries(
                                            values as Record<string, unknown>
                                        ).map(([key, val]) => (
                                            <Box key={key}>
                                                <Text size="xs" c="dimmed">
                                                    {key}
                                                </Text>
                                                <Code size="sm">
                                                    {typeof val === "object"
                                                        ? JSON.stringify(val)
                                                        : String(val)}
                                                </Code>
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Code>{String(values)}</Code>
                                )}
                            </Paper>
                        ))}
                    </Stack>
                </FieldSection>
            )}

            {tokens.spacing && (
                <FieldSection title="Spacing">
                    <Code block style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(tokens.spacing, null, 2)}
                    </Code>
                </FieldSection>
            )}

            {tokens.radii && (
                <FieldSection title="Border Radii">
                    <SimpleGrid cols={{ base: 3, sm: 5, md: 7 }} spacing="sm">
                        {Object.entries(tokens.radii).map(([name, value]) => (
                            <Paper key={name} withBorder p="sm" ta="center">
                                <Box
                                    w={40}
                                    h={40}
                                    mx="auto"
                                    mb="xs"
                                    style={{
                                        backgroundColor:
                                            "var(--mantine-color-blue-5)",
                                        borderRadius: String(value),
                                    }}
                                />
                                <Text size="xs" fw={500}>
                                    {name}
                                </Text>
                                <Code size="xs">{String(value)}</Code>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {tokens.shadows && (
                <FieldSection title="Shadows">
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                        {Object.entries(tokens.shadows).map(([name, value]) => (
                            <Paper
                                key={name}
                                p="md"
                                ta="center"
                                style={{
                                    boxShadow: String(value),
                                }}
                            >
                                <Text size="sm" fw={500}>
                                    {name}
                                </Text>
                                <Code size="xs">{String(value)}</Code>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {tokens.borders && (
                <FieldSection title="Borders">
                    <Code block style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(tokens.borders, null, 2)}
                    </Code>
                </FieldSection>
            )}

            {tokens.motion && (
                <FieldSection title="Motion">
                    <Code block style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(tokens.motion, null, 2)}
                    </Code>
                </FieldSection>
            )}

            {tokens.breakpoints && (
                <FieldSection title="Breakpoints">
                    <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
                        {Object.entries(tokens.breakpoints).map(([name, value]) => (
                            <Paper key={name} withBorder p="sm" ta="center">
                                <Text size="sm" fw={500}>
                                    {name}
                                </Text>
                                <Code size="sm">{String(value)}</Code>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {tokens.z_index && (
                <FieldSection title="Z-Index">
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                        {Object.entries(tokens.z_index).map(([name, value]) => (
                            <Paper key={name} withBorder p="sm" ta="center">
                                <Text size="sm" fw={500}>
                                    {name}
                                </Text>
                                <Code size="sm">{String(value)}</Code>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </FieldSection>
            )}

            {tokens.sources && tokens.sources.length > 0 && (
                <FieldSection title="Sources">
                    {tokens.sources.map((source, i) => (
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
                    <FieldDisplay label="Version" value={tokens.version} inline />
                    <FieldDisplay
                        label="Created"
                        value={new Date(tokens.created_at).toLocaleDateString()}
                        inline
                    />
                    <FieldDisplay
                        label="Updated"
                        value={new Date(tokens.updated_at).toLocaleDateString()}
                        inline
                    />
                </Group>
            </FieldSection>
        </Stack>
    );
}
