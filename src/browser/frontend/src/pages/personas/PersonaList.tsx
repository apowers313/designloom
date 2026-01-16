import {
    Anchor,
    Badge,
    Center,
    Loader,
    Paper,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { Link } from "react-router-dom";

import { useEntityList } from "../../api/client";

interface PersonaSummary {
    id: string;
    name: string;
    role: string;
    expertise: string;
}

const EXPERTISE_COLORS: Record<string, string> = {
    novice: "blue",
    intermediate: "yellow",
    expert: "green",
};

export function PersonaList() {
    const { data: personas, isLoading, error } = useEntityList<PersonaSummary>("personas");

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

    if (!personas || personas.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Personas</Title>
                <Text c="dimmed">No personas found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Personas</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th>Expertise</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {personas.map((persona) => (
                            <Table.Tr key={persona.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/personas/${persona.id}`}
                                    >
                                        {persona.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{persona.name}</Table.Td>
                                <Table.Td>{persona.role}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            EXPERTISE_COLORS[persona.expertise] ??
                                            "gray"
                                        }
                                    >
                                        {persona.expertise}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
