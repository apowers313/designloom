import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { label: "Workflows", path: "/workflows", icon: "W" },
    { label: "Capabilities", path: "/capabilities", icon: "C" },
    { label: "Personas", path: "/personas", icon: "P" },
    { label: "Components", path: "/components", icon: "K" },
    { label: "Tokens", path: "/tokens", icon: "T" },
    { label: "Views", path: "/views", icon: "V" },
    { label: "Interactions", path: "/interactions", icon: "I" },
];

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();
    const theme = useMantineTheme();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 220,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Title
                        order={3}
                        component={Link}
                        to="/"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        🧵 Designloom
                    </Title>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        component={Link}
                        to={item.path}
                        label={item.label}
                        active={location.pathname.startsWith(item.path)}
                        leftSection={
                            <Text
                                size="xs"
                                fw={700}
                                c={theme.primaryColor}
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor:
                                        theme.colors[theme.primaryColor][0],
                                }}
                            >
                                {item.icon}
                            </Text>
                        }
                    />
                ))}
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
