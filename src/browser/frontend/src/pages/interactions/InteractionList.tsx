import {
    Anchor,
    Badge,
    Center,
    Group,
    Loader,
    Paper,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { Link } from "react-router-dom";

import { useEntityList } from "../../api/client";

interface InteractionSummary {
    id: string;
    name: string;
    applies_to?: string[];
}

export function InteractionList() {
    const { data: interactions, isLoading, error } = useEntityList<InteractionSummary>("interactions");

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
                <Text c="red">Error: {error.message}</Text>
            </Center>
        );
    }

    if (!interactions || interactions.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Interaction Patterns</Title>
                <Text c="dimmed">No interaction patterns found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Interaction Patterns</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Applies To</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {interactions.map((interaction) => (
                            <Table.Tr key={interaction.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/interactions/${interaction.id}`}
                                    >
                                        {interaction.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{interaction.name}</Table.Td>
                                <Table.Td>
                                    {interaction.applies_to &&
                                    interaction.applies_to.length > 0 ? (
                                        <Group gap="xs">
                                            {interaction.applies_to.map((cat) => (
                                                <Badge
                                                    key={cat}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </Group>
                                    ) : (
                                        <Text c="dimmed" size="sm">
                                            Any
                                        </Text>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
