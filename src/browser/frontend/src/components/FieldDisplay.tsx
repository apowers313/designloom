import { Badge, Code, Group, List, Paper, Stack, Text } from "@mantine/core";

interface FieldDisplayProps {
    label: string;
    value: unknown;
    inline?: boolean;
}

/**
 * Renders a field value in an appropriate format based on its type
 */
export function FieldDisplay({ label, value, inline = false }: FieldDisplayProps) {
    if (value === undefined || value === null) {
        return null;
    }

    const renderValue = () => {
        // Boolean
        if (typeof value === "boolean") {
            return (
                <Badge color={value ? "green" : "gray"}>
                    {value ? "Yes" : "No"}
                </Badge>
            );
        }

        // String
        if (typeof value === "string") {
            return <Text>{value}</Text>;
        }

        // Number
        if (typeof value === "number") {
            return <Text>{value}</Text>;
        }

        // Array of strings
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
            if (value.length === 0) {
                return <Text c="dimmed">None</Text>;
            }
            return (
                <Group gap="xs" wrap="wrap">
                    {value.map((v, i) => (
                        <Badge key={i} variant="light">
                            {v}
                        </Badge>
                    ))}
                </Group>
            );
        }

        // Array of objects
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <Text c="dimmed">None</Text>;
            }
            return (
                <List size="sm">
                    {value.map((item, i) => (
                        <List.Item key={i}>
                            {typeof item === "object" ? (
                                <Code block>
                                    {JSON.stringify(item, null, 2)}
                                </Code>
                            ) : (
                                String(item)
                            )}
                        </List.Item>
                    ))}
                </List>
            );
        }

        // Object
        if (typeof value === "object") {
            return (
                <Code block style={{ whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(value, null, 2)}
                </Code>
            );
        }

        // Fallback
        return <Text>{String(value)}</Text>;
    };

    if (inline) {
        return (
            <Group gap="sm">
                <Text fw={600} size="sm">
                    {label}:
                </Text>
                {renderValue()}
            </Group>
        );
    }

    return (
        <Stack gap="xs">
            <Text fw={600} size="sm">
                {label}
            </Text>
            {renderValue()}
        </Stack>
    );
}

/**
 * Container for grouping multiple fields
 */
export function FieldSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Paper withBorder p="md">
            <Stack gap="md">
                <Text fw={700} size="lg">
                    {title}
                </Text>
                {children}
            </Stack>
        </Paper>
    );
}
