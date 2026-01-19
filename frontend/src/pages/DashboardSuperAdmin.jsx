import { 
    Container, Title, Text, Card, Table, Button, Group, Badge, 
    Modal, TextInput, Select, Stack, ActionIcon, Tooltip, 
    Center, Loader, Paper, SimpleGrid, Divider, Tabs, 
    NumberInput, Switch, MultiSelect, Input, Box, ScrollArea,
    Pagination, Menu, rem, Grid
} from '@mantine/core';
import { 
    IconUser, IconUsers, IconBuilding, IconCreditCard, 
    IconSearch, IconFilter, IconEdit, IconTrash, 
    IconEye, IconRefresh, IconChartBar, IconDownload,
    IconToggleLeft, IconToggleRight, IconCheck, IconX,
    IconSortAscending, IconSortDescending, IconListDetails,
    IconDeviceAnalytics, IconReportAnalytics
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { getCurrentUser } from '../services/auth';
import api from '../services/api';
import axios from 'axios';

const DashboardSuperAdmin = () => {
    const user = getCurrentUser();
    const [loading, setLoading] = useState(true);
    
    // Estados para los datos
    const [clientes, setClientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [microempresas, setMicroempresas] = useState([]);
    const [planes, setPlanes] = useState([]);
    
    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [filtroEmpresa, setFiltroEmpresa] = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [filtroPlan, setFiltroPlan] = useState('');
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Estado para el tab activo
    const [activeTab, setActiveTab] = useState('clientes');
    
    // Cargar todos los datos
    useEffect(() => {
        if (user?.rol === 'super_admin') {
            cargarTodosLosDatos();
        }
    }, [user]);

    const cargarTodosLosDatos = async () => {
        setLoading(true);
        try {
            const [clientesRes, usuariosRes, empresasRes, planesRes] = await Promise.all([
                api.get('/clientes/search?limit=1000'),
                api.get('/usuarios'),
                api.get('/auth/microempresas?all=true'),
                api.get('/planes')
            ]);
            
            setClientes(clientesRes.data || []);
            setUsuarios(usuariosRes.data || []);
            setMicroempresas(empresasRes.data || []);
            setPlanes(planesRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            notifications.show({
                title: 'Error',
                message: 'Error al cargar los datos',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para buscar clientes
    const buscarClientes = async (termino) => {
        try {
            const response = await api.get(`/clientes/search?search=${termino}`);
            setClientes(response.data || []);
        } catch (error) {
            console.error('Error buscando clientes:', error);
        }
    };

    // Función para buscar usuarios
    const buscarUsuarios = async (termino) => {
        try {
            const response = await api.get(`/usuarios/search?search=${termino}`);
            setUsuarios(response.data || []);
        } catch (error) {
            console.error('Error buscando usuarios:', error);
        }
    };

    // Filtrar datos según criterios
    const filtrarDatos = (datos, tipo) => {
        let filtrados = [...datos];
        
        // Filtro por término de búsqueda
        if (searchTerm) {
            filtrados = filtrados.filter(item => {
                const campos = Object.values(item).join(' ').toLowerCase();
                return campos.includes(searchTerm.toLowerCase());
            });
        }
        
        // Filtros específicos por tipo
        if (tipo === 'clientes') {
            if (filtroEmpresa) {
                filtrados = filtrados.filter(cliente => 
                    cliente.microempresa_id == filtroEmpresa
                );
            }
            if (filtroActivo === 'activos') {
                filtrados = filtrados.filter(cliente => cliente.estado === 'activo');
            } else if (filtroActivo === 'inactivos') {
                filtrados = filtrados.filter(cliente => cliente.estado === 'inactivo');
            }
        }
        
        if (tipo === 'usuarios') {
            if (filtroRol) {
                filtrados = filtrados.filter(usuario => 
                    usuario.tipo_rol === filtroRol
                );
            }
            if (filtroEmpresa) {
                filtrados = filtrados.filter(usuario => 
                    usuario.microempresa_id == filtroEmpresa
                );
            }
        }
        
        if (tipo === 'microempresas') {
            if (filtroPlan) {
                filtrados = filtrados.filter(empresa => 
                    empresa.plan_id == filtroPlan
                );
            }
            if (filtroActivo === 'activas') {
                filtrados = filtrados.filter(empresa => empresa.estado === 'activa');
            } else if (filtroActivo === 'inactivas') {
                filtrados = filtrados.filter(empresa => empresa.estado === 'inactiva');
            }
        }
        
        return filtrados;
    };

    // Obtener datos filtrados por tab
    const getDatosFiltrados = () => {
        switch(activeTab) {
            case 'clientes': return filtrarDatos(clientes, 'clientes');
            case 'usuarios': return filtrarDatos(usuarios, 'usuarios');
            case 'microempresas': return filtrarDatos(microempresas, 'microempresas');
            case 'planes': return planes;
            default: return [];
        }
    };

    // Calcular paginación
    const datosFiltrados = getDatosFiltrados();
    const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const datosPaginados = datosFiltrados.slice(startIndex, startIndex + itemsPerPage);

    // Estadísticas
    const estadisticas = {
        totalClientes: clientes.length,
        clientesActivos: clientes.filter(c => c.estado === 'activo').length,
        totalUsuarios: usuarios.length,
        usuariosActivos: usuarios.filter(u => u.estado === 'activo').length,
        totalEmpresas: microempresas.length,
        empresasActivas: microempresas.filter(e => e.estado === 'activa').length,
        totalPlanes: planes.length
    };

    // Renderizar tabla de clientes
    const renderTablaClientes = () => (
        <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre / Razón Social</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Teléfono</Table.Th>
                    <Table.Th>Empresa</Table.Th>
                    <Table.Th>Origen</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Registro</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {datosPaginados.map((cliente) => (
                    <Table.Tr key={cliente.id_cliente}>
                        <Table.Td>{cliente.id_cliente}</Table.Td>
                        <Table.Td>
                            <Text fw={500}>{cliente.nombre_razon_social}</Text>
                            <Text size="xs" c="dimmed">CI/NIT: {cliente.ci_nit || 'N/A'}</Text>
                        </Table.Td>
                        <Table.Td>{cliente.email || 'N/A'}</Table.Td>
                        <Table.Td>{cliente.telefono || 'N/A'}</Table.Td>
                        <Table.Td>
                            {cliente.empresa_nombre ? (
                                <Badge color="blue" variant="light">{cliente.empresa_nombre}</Badge>
                            ) : (
                                <Text size="sm" c="dimmed">Sin empresa</Text>
                            )}
                        </Table.Td>
                        <Table.Td>
                            <Badge color={cliente.origen === 'publico' ? 'teal' : 'violet'}>
                                {cliente.origen || 'sistema'}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={cliente.estado === 'activo' ? 'green' : 'red'}>
                                {cliente.estado}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm">
                                {new Date(cliente.fecha_registro).toLocaleDateString()}
                            </Text>
                        </Table.Td>
                        <Table.Td>
                            <Group gap="xs">
                                <Tooltip label="Ver detalles">
                                    <ActionIcon variant="light" color="blue" size="sm">
                                        <IconEye size={14} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Editar">
                                    <ActionIcon variant="light" color="yellow" size="sm">
                                        <IconEdit size={14} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={cliente.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                                    <ActionIcon 
                                        variant="light" 
                                        color={cliente.estado === 'activo' ? 'orange' : 'green'} 
                                        size="sm"
                                        onClick={() => handleToggleEstadoCliente(cliente.id_cliente, cliente.estado)}
                                    >
                                        {cliente.estado === 'activo' ? 
                                            <IconToggleLeft size={14} /> : 
                                            <IconToggleRight size={14} />
                                        }
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );

    // Renderizar tabla de usuarios
    const renderTablaUsuarios = () => (
        <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Rol</Table.Th>
                    <Table.Th>Empresa</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Registro</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {datosPaginados.map((usuario) => (
                    <Table.Tr key={usuario.id_usuario}>
                        <Table.Td>{usuario.id_usuario}</Table.Td>
                        <Table.Td>
                            <Text fw={500}>{usuario.nombre} {usuario.apellido}</Text>
                        </Table.Td>
                        <Table.Td>{usuario.email}</Table.Td>
                        <Table.Td>
                            <Badge color={
                                usuario.tipo_rol === 'super_admin' ? 'red' :
                                usuario.tipo_rol === 'administrador' ? 'blue' :
                                usuario.tipo_rol === 'microempresa_P' ? 'violet' : 'teal'
                            }>
                                {usuario.tipo_rol?.replace('_', ' ')}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            {usuario.empresa_nombre ? (
                                <Badge color="blue" variant="light">{usuario.empresa_nombre}</Badge>
                            ) : (
                                <Text size="sm" c="dimmed">Sin empresa</Text>
                            )}
                        </Table.Td>
                        <Table.Td>
                            <Badge color={usuario.estado === 'activo' ? 'green' : 'red'}>
                                {usuario.estado}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm">
                                {new Date(usuario.fecha_creacion).toLocaleDateString()}
                            </Text>
                        </Table.Td>
                        <Table.Td>
                            <Group gap="xs">
                                <Tooltip label="Editar">
                                    <ActionIcon variant="light" color="yellow" size="sm">
                                        <IconEdit size={14} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                                    <ActionIcon 
                                        variant="light" 
                                        color={usuario.estado === 'activo' ? 'orange' : 'green'} 
                                        size="sm"
                                        onClick={() => handleToggleEstadoUsuario(usuario.id_usuario, usuario.estado)}
                                    >
                                        {usuario.estado === 'activo' ? 
                                            <IconToggleLeft size={14} /> : 
                                            <IconToggleRight size={14} />
                                        }
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );

    // Renderizar tabla de microempresas
    const renderTablaMicroempresas = () => (
        <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>NIT</Table.Th>
                    <Table.Th>Contacto</Table.Th>
                    <Table.Th>Plan</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Registro</Table.Th>
                    <Table.Th>Usuarios</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {datosPaginados.map((empresa) => (
                    <Table.Tr key={empresa.id_microempresa}>
                        <Table.Td>{empresa.id_microempresa}</Table.Td>
                        <Table.Td>
                            <Text fw={500}>{empresa.nombre}</Text>
                            <Text size="xs" c="dimmed">{empresa.rubro || 'Sin rubro'}</Text>
                        </Table.Td>
                        <Table.Td>{empresa.nit || 'N/A'}</Table.Td>
                        <Table.Td>
                            <Text size="sm">{empresa.telefono}</Text>
                            <Text size="xs" c="dimmed">{empresa.email}</Text>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={
                                empresa.plan_nombre?.includes('Premium') ? 'violet' :
                                empresa.plan_nombre?.includes('Básico') ? 'blue' : 'gray'
                            }>
                                {empresa.plan_nombre || 'Free'}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={empresa.estado === 'activa' ? 'green' : 'red'}>
                                {empresa.estado}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm">
                                {new Date(empresa.fecha_registro).toLocaleDateString()}
                            </Text>
                        </Table.Td>
                        <Table.Td>
                            <Badge variant="light" color="blue">
                                {empresa.usuarios_count || 0} usuarios
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Group gap="xs">
                                <Tooltip label="Ver detalles">
                                    <ActionIcon variant="light" color="blue" size="sm">
                                        <IconEye size={14} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Editar">
                                    <ActionIcon variant="light" color="yellow" size="sm">
                                        <IconEdit size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );

    // Renderizar tabla de planes
    const renderTablaPlanes = () => (
        <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Precio</Table.Th>
                    <Table.Th>Límite Usuarios</Table.Th>
                    <Table.Th>Límite Productos</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Empresas</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {planes.map((plan) => (
                    <Table.Tr key={plan.id_plan}>
                        <Table.Td>{plan.id_plan}</Table.Td>
                        <Table.Td>
                            <Text fw={500}>{plan.nombre_plan}</Text>
                        </Table.Td>
                        <Table.Td>
                            <Badge color="blue" variant="light">{plan.tipo_plan}</Badge>
                        </Table.Td>
                        <Table.Td>
                            <Text fw={600}>${plan.precio}</Text>
                            <Text size="xs" c="dimmed">/mes</Text>
                        </Table.Td>
                        <Table.Td>
                            {plan.limite_usuarios === 0 ? 'Ilimitado' : plan.limite_usuarios}
                        </Table.Td>
                        <Table.Td>
                            {plan.limite_productos === 0 ? 'Ilimitado' : plan.limite_productos}
                        </Table.Td>
                        <Table.Td>
                            <Badge color={plan.estado === 'suscrito' ? 'green' : 'orange'}>
                                {plan.estado}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Badge variant="light" color="blue">
                                {plan.empresas_count || 0} empresas
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Group gap="xs">
                                <Tooltip label="Editar">
                                    <ActionIcon variant="light" color="yellow" size="sm">
                                        <IconEdit size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );

    // Handlers para acciones
    const handleToggleEstadoCliente = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
        
        try {
            await api.put(`/clientes/${id}/estado`, { estado: nuevoEstado });
            notifications.show({
                title: 'Estado actualizado',
                message: `Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`,
                color: 'green'
            });
            cargarTodosLosDatos();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error al cambiar estado',
                color: 'red'
            });
        }
    };

    const handleToggleEstadoUsuario = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
        
        try {
            await api.put(`/usuarios/estado/${id}`, { estado: nuevoEstado });
            notifications.show({
                title: 'Estado actualizado',
                message: `Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`,
                color: 'green'
            });
            cargarTodosLosDatos();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error al cambiar estado',
                color: 'red'
            });
        }
    };

    // Componente de Filtros
    const Filtros = () => (
        <Paper p="md" withBorder mb="md">
            <Group justify="space-between" mb="md">
                <Title order={5}>Filtros y Búsqueda</Title>
                <Button 
                    variant="light" 
                    leftSection={<IconRefresh size={16} />}
                    onClick={cargarTodosLosDatos}
                    size="xs"
                >
                    Actualizar
                </Button>
            </Group>
            
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                        placeholder="Buscar..."
                        leftSection={<IconSearch size={16} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid.Col>
                
                {activeTab === 'clientes' && (
                    <>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por estado"
                                data={[
                                    { value: 'todos', label: 'Todos' },
                                    { value: 'activos', label: 'Activos' },
                                    { value: 'inactivos', label: 'Inactivos' }
                                ]}
                                value={filtroActivo}
                                onChange={setFiltroActivo}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por empresa"
                                data={[
                                    { value: '', label: 'Todas las empresas' },
                                    ...microempresas.map(emp => ({
                                        value: String(emp.id_microempresa),
                                        label: emp.nombre
                                    }))
                                ]}
                                value={filtroEmpresa}
                                onChange={setFiltroEmpresa}
                            />
                        </Grid.Col>
                    </>
                )}
                
                {activeTab === 'usuarios' && (
                    <>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por rol"
                                data={[
                                    { value: '', label: 'Todos los roles' },
                                    { value: 'super_admin', label: 'Super Admin' },
                                    { value: 'administrador', label: 'Administrador' },
                                    { value: 'vendedor', label: 'Vendedor' }
                                ]}
                                value={filtroRol}
                                onChange={setFiltroRol}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por empresa"
                                data={[
                                    { value: '', label: 'Todas las empresas' },
                                    ...microempresas.map(emp => ({
                                        value: String(emp.id_microempresa),
                                        label: emp.nombre
                                    }))
                                ]}
                                value={filtroEmpresa}
                                onChange={setFiltroEmpresa}
                            />
                        </Grid.Col>
                    </>
                )}
                
                {activeTab === 'microempresas' && (
                    <>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por estado"
                                data={[
                                    { value: 'todos', label: 'Todas' },
                                    { value: 'activas', label: 'Activas' },
                                    { value: 'inactivas', label: 'Inactivas' }
                                ]}
                                value={filtroActivo}
                                onChange={setFiltroActivo}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select
                                placeholder="Filtrar por plan"
                                data={[
                                    { value: '', label: 'Todos los planes' },
                                    ...planes.map(plan => ({
                                        value: String(plan.id_plan),
                                        label: plan.nombre_plan
                                    }))
                                ]}
                                value={filtroPlan}
                                onChange={setFiltroPlan}
                            />
                        </Grid.Col>
                    </>
                )}
                
                <Grid.Col span={{ base: 12, md: 2 }}>
                    <Button 
                        fullWidth 
                        variant="light" 
                        color="blue"
                        leftSection={<IconFilter size={16} />}
                        onClick={() => {
                            // Aplicar filtros
                            notifications.show({
                                title: 'Filtros aplicados',
                                message: `Mostrando ${datosFiltrados.length} registros`,
                                color: 'blue'
                            });
                        }}
                    >
                        Aplicar
                    </Button>
                </Grid.Col>
            </Grid>
        </Paper>
    );

    if (!user || user.rol !== 'super_admin') {
        return (
            <Center h="50vh">
                <Text size="xl" c="red">Acceso denegado. Solo para Super Administrador.</Text>
            </Center>
        );
    }

    if (loading) {
        return (
            <Center h="50vh">
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Container size="xl" py="xl">
            {/* Header */}
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>Panel de Super Administrador</Title>
                    <Text c="dimmed">Gestión completa del sistema</Text>
                </div>
                <Group>
                    <Button 
                        variant="light" 
                        leftSection={<IconDownload size={16} />}
                        onClick={() => {
                            // Exportar datos
                            notifications.show({
                                title: 'Exportando datos',
                                message: 'Preparando archivo para descarga...',
                                color: 'blue'
                            });
                        }}
                    >
                        Exportar
                    </Button>
                    <Button 
                        variant="light" 
                        leftSection={<IconReportAnalytics size={16} />}
                        onClick={() => {
                            // Mostrar reportes
                            notifications.show({
                                title: 'Reportes',
                                message: 'Generando reportes del sistema...',
                                color: 'green'
                            });
                        }}
                    >
                        Reportes
                    </Button>
                </Group>
            </Group>

            {/* Estadísticas */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed">Clientes</Text>
                        <IconUsers size={24} color="#228be6" />
                    </Group>
                    <Title order={2}>{estadisticas.totalClientes}</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                        {estadisticas.clientesActivos} activos
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed">Usuarios</Text>
                        <IconUser size={24} color="#228be6" />
                    </Group>
                    <Title order={2}>{estadisticas.totalUsuarios}</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                        {estadisticas.usuariosActivos} activos
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed">Microempresas</Text>
                        <IconBuilding size={24} color="#228be6" />
                    </Group>
                    <Title order={2}>{estadisticas.totalEmpresas}</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                        {estadisticas.empresasActivas} activas
                    </Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed">Planes de Pago</Text>
                        <IconCreditCard size={24} color="#228be6" />
                    </Group>
                    <Title order={2}>{estadisticas.totalPlanes}</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                        Activos en el sistema
                    </Text>
                </Card>
            </SimpleGrid>

            {/* Tabs y Filtros */}
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List grow mb="md">
                        <Tabs.Tab 
                            value="clientes" 
                            leftSection={<IconUsers size={16} />}
                        >
                            Clientes ({estadisticas.totalClientes})
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="usuarios" 
                            leftSection={<IconUser size={16} />}
                        >
                            Usuarios ({estadisticas.totalUsuarios})
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="microempresas" 
                            leftSection={<IconBuilding size={16} />}
                        >
                            Microempresas ({estadisticas.totalEmpresas})
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="planes" 
                            leftSection={<IconCreditCard size={16} />}
                        >
                            Planes ({estadisticas.totalPlanes})
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Filtros según tab activo */}
                    <Filtros />

                    {/* Tablas de datos */}
                    <Tabs.Panel value="clientes">
                        <ScrollArea h={500}>
                            {renderTablaClientes()}
                        </ScrollArea>
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="usuarios">
                        <ScrollArea h={500}>
                            {renderTablaUsuarios()}
                        </ScrollArea>
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="microempresas">
                        <ScrollArea h={500}>
                            {renderTablaMicroempresas()}
                        </ScrollArea>
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="planes">
                        <ScrollArea h={500}>
                            {renderTablaPlanes()}
                        </ScrollArea>
                    </Tabs.Panel>
                </Tabs>

                {/* Paginación */}
                {datosFiltrados.length > itemsPerPage && (
                    <Group justify="center" mt="md">
                        <Pagination
                            total={totalPages}
                            value={currentPage}
                            onChange={setCurrentPage}
                            size="sm"
                            withEdges
                        />
                        <Text size="sm" c="dimmed">
                            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, datosFiltrados.length)} de {datosFiltrados.length} registros
                        </Text>
                    </Group>
                )}
            </Card>

            {/* Información del sistema */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">Información del Sistema</Title>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <div>
                        <Text fw={500}>Resumen de Actividad</Text>
                        <Text size="sm" c="dimmed" mt="xs">
                            • {estadisticas.totalClientes} clientes registrados
                        </Text>
                        <Text size="sm" c="dimmed">
                            • {estadisticas.totalUsuarios} usuarios del sistema
                        </Text>
                        <Text size="sm" c="dimmed">
                            • {estadisticas.totalEmpresas} microempresas activas
                        </Text>
                        <Text size="sm" c="dimmed">
                            • {estadisticas.totalPlanes} planes de pago configurados
                        </Text>
                    </div>
                    <div>
                        <Text fw={500}>Acciones Rápidas</Text>
                        <Group mt="xs">
                            <Button variant="light" size="xs">Crear Nuevo Usuario</Button>
                            <Button variant="light" size="xs">Ver Reportes</Button>
                            <Button variant="light" size="xs">Backup Sistema</Button>
                        </Group>
                    </div>
                </SimpleGrid>
            </Card>
        </Container>
    );
};

export default DashboardSuperAdmin;