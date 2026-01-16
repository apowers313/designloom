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

interface ViewSummary {
    id: string;
    name: string;
    layout_type: string;
    route_count: number;
    state_count: number;
}

export function ViewList() {
    const { data: views, isLoading, error } = useEntityList<ViewSummary>("views");

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

    if (!views || views.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Views</Title>
                <Text c="dimmed">No views found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Views</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Layout</Table.Th>
                            <Table.Th>Routes</Table.Th>
                            <Table.Th>States</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {views.map((view) => (
                            <Table.Tr key={view.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/views/${view.id}`}
                                    >
                                        {view.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{view.name}</Table.Td>
                                <Table.Td>
                                    <Badge variant="light">
                                        {view.layout_type}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color="blue" variant="light">
                                        {view.route_count}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color="gray" variant="light">
                                        {view.state_count}
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
