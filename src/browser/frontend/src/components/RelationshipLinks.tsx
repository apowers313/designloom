import { Anchor, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";

interface RelationshipLinksProps {
    type: string;
    items:
        | Array<{ id: string; name: string; status?: string }>
        | string[]
        | undefined
        | null;
}

export function RelationshipLinks({ type, items }: RelationshipLinksProps) {
    if (!items || items.length === 0) {
        return <Text c="dimmed">None</Text>;
    }

    return (
        <Group gap="xs" wrap="wrap">
            {items.map((item) => {
                // Handle both object and string formats
                const id = typeof item === "string" ? item : item.id;
                const name = typeof item === "string" ? item : item.name;

                return (
                    <Anchor
                        key={id}
                        component={Link}
                        to={`/${type}/${id}`}
                        size="sm"
                    >
                        {name}
                    </Anchor>
                );
            })}
        </Group>
    );
}
