import {
    Card,
    Center,
    Grid,
    Loader,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Link } from "react-router-dom";

import { useStats } from "../api/client";

const ENTITY_CONFIG: Record<
    string,
    { label: string; path: string; description: string; icon: string }
> = {
    workflows: {
        label: "Workflows",
        path: "/workflows",
        description: "User journeys and task flows",
        icon: "W",
    },
    capabilities: {
        label: "Capabilities",
        path: "/capabilities",
        description: "System features and abilities",
        icon: "C",
    },
    personas: {
        label: "Personas",
        path: "/personas",
        description: "User archetypes and characteristics",
        icon: "P",
    },
    components: {
        label: "Components",
        path: "/components",
        description: "UI components and patterns",
        icon: "K",
    },
    tokens: {
        label: "Tokens",
        path: "/tokens",
        description: "Design tokens and themes",
        icon: "T",
    },
    views: {
        label: "Views",
        path: "/views",
        description: "Page layouts and compositions",
        icon: "V",
    },
    interactions: {
        label: "Interactions",
        path: "/interactions",
        description: "Interaction patterns and behaviors",
        icon: "I",
    },
};

export function IndexPage() {
    const { data: stats, isLoading, error } = useStats();

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h={400}>
                <Text c="red">Error loading stats: {error.message}</Text>
            </Center>
        );
    }

    return (
        <Stack gap="xl">
            <Title order={1}>Design Artifacts</Title>
            <Text c="dimmed">
                Browse all design documents in your Designloom project.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
                    <Card
                        key={key}
                        component={Link}
                        to={config.path}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ textDecoration: "none" }}
                    >
                        <Stack gap="sm">
                            <Grid align="center">
                                <Grid.Col span="content">
                                    <Center
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            backgroundColor: "var(--mantine-color-blue-0)",
                                            color: "var(--mantine-color-blue-6)",
                                            fontWeight: 700,
                                            fontSize: 18,
                                        }}
                                    >
                                        {config.icon}
                                    </Center>
                                </Grid.Col>
                                <Grid.Col span="auto">
                                    <Text fw={600} size="lg">
                                        {config.label}
                                    </Text>
                                </Grid.Col>
                                <Grid.Col span="content">
                                    <Text size="xl" fw={700} c="blue">
                                        {stats?.[key] ?? 0}
                                    </Text>
                                </Grid.Col>
                            </Grid>
                            <Text size="sm" c="dimmed">
                                {config.description}
                            </Text>
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Stack>
    );
}
