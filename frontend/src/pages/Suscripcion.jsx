import { 
    Container, 
    Title, 
    Text, 
    Card, 
    Button, 
    SimpleGrid, 
    Badge, 
    List, 
    ThemeIcon, 
    Group, 
    Paper,
    Stack
} from '@mantine/core';
import { IconCircleCheck, IconRocket, IconBuildingSkyscraper, IconCreditCard } from '@tabler/icons-react';

const Suscripcion = () => {
    return (
        <Container size="lg" py="xl">
            {/* Encabezado de la página */}
            <Stack align="center" mb={50}>
                <Badge variant="filled" size="lg" radius="sm">Planes Disponibles</Badge>
                <Title order={1} fw={900} style={{ fontSize: '2.5rem' }}>
                    Impulsa tu negocio al siguiente nivel
                </Title>
                <Text c="dimmed" fz="lg" ta="center" maw={600}>
                    Gestiona tu inventario, ventas y equipo con el plan que mejor se adapte al tamaño de tu microempresa.
                </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
                {/* Plan Estándar / Emprendedor */}
                <Paper shadow="sm" radius="md" withBorder p="xl">
                    <Group justify="space-between" mb="xs">
                        <Title order={3}>Plan Emprendedor</Title>
                        <IconRocket size={24} color="var(--mantine-color-blue-filled)" />
                    </Group>
                    
                    <Text fz="xs" c="dimmed" mb="lg">Ideal para negocios que están comenzando.</Text>
                    
                    <Group align="flex-end" gap={5} mb="xl">
                        <Text fz={34} fw={700} lh={1}>$29</Text>
                        <Text c="dimmed" fz="sm" pb={5}>/ mes</Text>
                    </Group>

                    <List
                        spacing="sm"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon color="blue" size={20} radius="xl">
                                <IconCircleCheck size={12} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>Hasta 5 usuarios del sistema</List.Item>
                        <List.Item>Gestión de Inventario básica</List.Item>
                        <List.Item>Reportes de ventas mensuales</List.Item>
                        <List.Item>Soporte técnico por correo</List.Item>
                    </List>

                    <Button fullWidth mt={30} variant="outline" color="blue" radius="md">
                        Seleccionar Plan
                    </Button>
                </Paper>

                {/* Plan Premium / Pro */}
                <Paper 
                    shadow="md" 
                    radius="md" 
                    withBorder 
                    p="xl" 
                    style={{ 
                        border: '2px solid var(--mantine-color-blue-filled)',
                        position: 'relative'
                    }}
                >
                    <Badge 
                        color="blue" 
                        variant="filled" 
                        style={{ position: 'absolute', top: -12, right: 20 }}
                    >
                        RECOMENDADO
                    </Badge>

                    <Group justify="space-between" mb="xs">
                        <Title order={3}>Plan Gestión Pro</Title>
                        <IconBuildingSkyscraper size={24} color="var(--mantine-color-blue-filled)" />
                    </Group>
                    
                    <Text fz="xs" c="dimmed" mb="lg">Control total para microempresas en crecimiento.</Text>

                    <Group align="flex-end" gap={5} mb="xl">
                        <Text fz={34} fw={700} lh={1}>$59</Text>
                        <Text c="dimmed" fz="sm" pb={5}>/ mes</Text>
                    </Group>

                    <List
                        spacing="sm"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon color="blue" size={20} radius="xl">
                                <IconCircleCheck size={12} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item fw={500}>Usuarios ilimitados</List.Item>
                        <List.Item>Inventario avanzado y alertas de stock</List.Item>
                        <List.Item>Reportes personalizados y analítica</List.Item>
                        <List.Item>Soporte prioritario 24/7</List.Item>
                        <List.Item>Módulo de facturación electrónica</List.Item>
                    </List>

                    <Button fullWidth mt={30} variant="filled" color="blue" radius="md">
                        Plan Actual
                    </Button>
                </Paper>
            </SimpleGrid>

            {/* Pie de página de suscripción */}
            <Card mt={40} p="lg" radius="md" withBorder bg="var(--mantine-color-gray-0)">
                <Group justify="space-between">
                    <Group>
                        <ThemeIcon size="lg" radius="md" color="gray" variant="light">
                            <IconCreditCard size={20} />
                        </ThemeIcon>
                        <div>
                            <Text fw={500} size="sm">Método de pago</Text>
                            <Text size="xs" c="dimmed">Visa terminada en **** 4242</Text>
                        </div>
                    </Group>
                    <Button variant="subtle" size="xs">Gestionar Facturación</Button>
                </Group>
            </Card>
        </Container>
    );
};

export default Suscripcion;