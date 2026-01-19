import { 
    Container, 
    Title, 
    Text, 
    Card, 
    SimpleGrid, 
    Group, 
    Badge,
    Center,
    Stack
    } from '@mantine/core';
    import { 
    IconBuilding, 
    IconUsers, 
    IconShoppingCart, 
    IconPackage,
    IconChartBar,
    IconUser,
    IconSettings
    } from '@tabler/icons-react';
    import { getCurrentUser } from '../services/auth';

    const Dashboard = () => {
    const user = getCurrentUser();

    // Dashboard para Super Admin
    const renderSuperAdminDashboard = () => (
        <>
        <Title order={2} mb="lg">Panel de Super Administrador</Title>
        <Text c="dimmed" mb="xl">Administra todas las empresas del sistema</Text>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Empresas</Text>
                <IconBuilding size={24} color="#228be6" />
            </Group>
            <Title order={2}>15</Title>
            <Text size="sm" c="dimmed" mt="xs">12 activas</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Usuarios</Text>
                <IconUsers size={24} color="#228be6" />
            </Group>
            <Title order={2}>84</Title>
            <Text size="sm" c="dimmed" mt="xs">registrados</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Ventas Totales</Text>
                <IconShoppingCart size={24} color="#228be6" />
            </Group>
            <Title order={2}>Bs. 125,400</Title>
            <Text size="sm" c="dimmed" mt="xs">este mes</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Reportes</Text>
                <IconChartBar size={24} color="#228be6" />
            </Group>
            <Title order={2}>24</Title>
            <Text size="sm" c="dimmed" mt="xs">generados</Text>
            </Card>
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Acciones Rápidas</Title>
            <Group>
            <Badge size="lg" variant="light" color="blue">Ver Empresas</Badge>
            <Badge size="lg" variant="light" color="green">Gestionar Usuarios</Badge>
            <Badge size="lg" variant="light" color="orange">Ver Reportes</Badge>
            <Badge size="lg" variant="light" color="violet">Configuración</Badge>
            </Group>
        </Card>
        </>
    );

    // Dashboard para Administradores/Dueños
    const renderAdminDashboard = () => (
        <>
        <Title order={2} mb="lg">Dashboard - {user.empresa_nombre || 'Mi Empresa'}</Title>
        <Text c="dimmed" mb="xl">Bienvenido de vuelta, {user.nombre}</Text>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Ventas Hoy</Text>
                <IconShoppingCart size={24} color="#228be6" />
            </Group>
            <Title order={2}>Bs. 1,250</Title>
            <Text size="sm" c="dimmed" mt="xs">Total acumulado</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Productos en Stock</Text>
                <IconPackage size={24} color="#228be6" />
            </Group>
            <Title order={2}>45</Title>
            <Text size="sm" c="dimmed" mt="xs">3 con stock bajo</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Clientes</Text>
                <IconUsers size={24} color="#228be6" />
            </Group>
            <Title order={2}>28</Title>
            <Text size="sm" c="dimmed" mt="xs">activos</Text>
            </Card>
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Información de tu cuenta</Title>
            <Stack gap="sm">
            <Group>
                <IconUser size={20} />
                <Text>{user.nombre} {user.apellido}</Text>
            </Group>
            <Group>
                <IconSettings size={20} />
                <Text>Rol: <Badge color="blue">{user.rol}</Badge></Text>
            </Group>
            <Text size="sm" c="dimmed">
                Último acceso: Hoy a las {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
            </Stack>
        </Card>
        </>
    );

    // Dashboard para Vendedores
    const renderVendedorDashboard = () => (
        <>
        <Title order={2} mb="lg">Panel de Vendedor</Title>
        <Text c="dimmed" mb="xl">Hola {user.nombre}, estas son tus métricas</Text>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Mis Ventas Hoy</Text>
                <IconShoppingCart size={24} color="#228be6" />
            </Group>
            <Title order={2}>Bs. 850</Title>
            <Text size="sm" c="dimmed" mt="xs">5 transacciones</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Ventas del Mes</Text>
                <IconChartBar size={24} color="#228be6" />
            </Group>
            <Title order={2}>Bs. 1,000</Title>
            <Text size="sm" c="dimmed" mt="xs">Meta: Bs. 2,000</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Clientes Atendidos</Text>
                <IconUsers size={24} color="#228be6" />
            </Group>
            <Title order={2}>18</Title>
            <Text size="sm" c="dimmed" mt="xs">este mes</Text>
            </Card>
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Próximas acciones</Title>
            <Text>Puedes ver tu historial de ventas.</Text>
            <Group mt="md">
            <Badge size="lg" variant="light" color="orange">Mi Historial Ventas</Badge>
            </Group>
        </Card>
        </>
    );

    return (
        <Container size="xl" py="xl">
        {user.rol === 'super_admin' && renderSuperAdminDashboard()}
        {['administrador', 'microempresa_P'].includes(user.rol) && renderAdminDashboard()}
        {user.rol === 'vendedor' && renderVendedorDashboard()}
        
        {/* Información común para todos */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Text size="sm" c="dimmed">
            Sistema de Gestión Microempresas 
            </Text>
        </Card>
        </Container>
    );
};

export default Dashboard;