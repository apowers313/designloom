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

interface WorkflowSummary {
    id: string;
    name: string;
    category: string;
    validated: boolean;
}

export function WorkflowList() {
    const { data: workflows, isLoading, error } = useEntityList<WorkflowSummary>("workflows");

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

    if (!workflows || workflows.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Workflows</Title>
                <Text c="dimmed">No workflows found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Workflows</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Category</Table.Th>
                            <Table.Th>Validated</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {workflows.map((workflow) => (
                            <Table.Tr key={workflow.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/workflows/${workflow.id}`}
                                    >
                                        {workflow.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{workflow.name}</Table.Td>
                                <Table.Td>
                                    <Badge variant="light">
                                        {workflow.category}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            workflow.validated ? "green" : "gray"
                                        }
                                    >
                                        {workflow.validated ? "Yes" : "No"}
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
