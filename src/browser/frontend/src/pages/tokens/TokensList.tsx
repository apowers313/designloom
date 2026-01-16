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

interface TokensSummary {
    id: string;
    name: string;
    extends?: string;
}

export function TokensList() {
    const { data: tokens, isLoading, error } = useEntityList<TokensSummary>("tokens");

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

    if (!tokens || tokens.length === 0) {
        return (
            <Stack gap="md">
                <Title order={2}>Design Tokens</Title>
                <Text c="dimmed">No design tokens found.</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            <Title order={2}>Design Tokens</Title>
            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Extends</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {tokens.map((token) => (
                            <Table.Tr key={token.id}>
                                <Table.Td>
                                    <Anchor
                                        component={Link}
                                        to={`/tokens/${token.id}`}
                                    >
                                        {token.id}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{token.name}</Table.Td>
                                <Table.Td>
                                    {token.extends ? (
                                        <Anchor
                                            component={Link}
                                            to={`/tokens/${token.extends}`}
                                        >
                                            <Badge variant="light">
                                                {token.extends}
                                            </Badge>
                                        </Anchor>
                                    ) : (
                                        <Text c="dimmed" size="sm">
                                            Base theme
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
