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

interface ComponentSummary {
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

export function ComponentList() {
    const { data: components, isLoading, error } = useEntityList<ComponentSummary>("components");

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

    if (!components || components.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Components</Title>
                <Text c="dimmed">No components found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Components</Title>
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
                        {components.map((component) => (
                            <Table.Tr key={component.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/components/${component.id}`}
                                    >
                                        {component.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{component.name}</Table.Td>
                                <Table.Td>
                                    <Badge variant="light">
                                        {component.category}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            STATUS_COLORS[component.status] ??
                                            "gray"
                                        }
                                    >
                                        {component.status}
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
