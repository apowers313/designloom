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

interface CapabilitySummary {
    id: string;
    name: string;
    category: string;
    status: string;
}

const STATUS_COLORS: Record<string, string> = {
    planned: "gray",
    "in-progress": "yellow",
    implemented: "green",
    deprecated: "red",
};

export function CapabilityList() {
    const { data: capabilities, isLoading, error } = useEntityList<CapabilitySummary>("capabilities");

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

    if (!capabilities || capabilities.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Capabilities</Title>
                <Text c="dimmed">No capabilities found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Capabilities</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Category</Table.Th>
                            <Table.Th>Status</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {capabilities.map((capability) => (
                            <Table.Tr key={capability.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/capabilities/${capability.id}`}
                                    >
                                        {capability.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{capability.name}</Table.Td>
                                <Table.Td>
                                    <Badge variant="light">
                                        {capability.category}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            STATUS_COLORS[capability.status] ??
                                            "gray"
                                        }
                                    >
                                        {capability.status}
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
