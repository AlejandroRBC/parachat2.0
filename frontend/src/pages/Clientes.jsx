import { useState, useEffect } from 'react';
import { 
    Container, 
    Table, 
    Button, 
    Group, 
    Title, 
    Card, 
    Badge, 
    ActionIcon, 
    Text, 
    Modal, 
    TextInput, 
    Select,
    SimpleGrid,
    Paper,
    Loader,
    Center,
    Stack,
    Textarea,
    Tooltip,
    Pagination,
    Input,
    Tabs,
    Divider,
    Switch,
    Box
} from '@mantine/core';
import { 
    IconUserPlus, 
    IconEdit, 
    IconTrash, 
    IconBuildingStore, 
    IconSearch,
    IconRefresh,
    IconEye,
    IconUsers,
    IconTrashX,
    IconMail,
    IconPhone,
    IconCalendar,
    IconUserCircle,
    IconAddressBook,
    IconCheck,
    IconX,
    IconToggleRight,
    IconToggleLeft
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getCurrentUser } from '../services/auth';
import { clienteService } from '../services/clienteService';
import { useDisclosure } from '@mantine/hooks';

const Clientes = () => {
    const user = getCurrentUser();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('activos');
    const itemsPerPage = 10;

    // Estados para modales
    const [modalNuevoOpen, { open: openNuevo, close: closeNuevo }] = useDisclosure(false);
    const [modalEditarOpen, { open: openEditar, close: closeEditar }] = useDisclosure(false);
    const [modalDetallesOpen, { open: openDetalles, close: closeDetalles }] = useDisclosure(false);

    // Estados para formularios
    const [nuevoCliente, setNuevoCliente] = useState({ 
        nombre_razon_social: '', 
        ci_nit: '', 
        telefono: '', 
        email: ''
    });
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [clienteParaEditar, setClienteParaEditar] = useState(null);

    // Cargar clientes según pestaña activa
    const cargarClientes = async () => {
        setLoading(true);
        try {
            if (activeTab === 'activos') {
                const res = await clienteService.getClientes();
                setClientes(res.data || []);
            } else if (activeTab === 'inactivos') {
                const res = await clienteService.getEliminados();
                setClientes(res.data || []);
            }
        } catch (error) {
            console.error("Error cargando clientes:", error);
            notifications.show({ 
                title: 'Error', 
                message: 'Error al cargar clientes', 
                color: 'red' 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        cargarClientes(); 
    }, [activeTab]);

    // Función para manejar el registro
    const handleRegistrar = async () => {
        try {
            await clienteService.createCliente(nuevoCliente);
            
            notifications.show({ 
                title: '✅ Cliente registrado', 
                message: `${nuevoCliente.nombre_razon_social} ha sido registrado con éxito`, 
                color: 'green' 
            });
            
            closeNuevo();
            cargarClientes();
            setNuevoCliente({ 
                nombre_razon_social: '', 
                ci_nit: '', 
                telefono: '', 
                email: ''
            });
        } catch (error) {
            console.error("Error registrando cliente:", error);
            notifications.show({ 
                title: 'Error', 
                message: error.response?.data?.error || 'No se pudo registrar el cliente', 
                color: 'red' 
            });
        }
    };

    // Función para manejar la edición
    const handleEditar = async () => {
        if (!clienteParaEditar) return;
        
        try {
            await clienteService.updateCliente(clienteParaEditar.id_cliente, {
                nombre_razon_social: clienteParaEditar.nombre_razon_social
            });
            
            notifications.show({ 
                title: '✅ Cliente actualizado', 
                message: 'Los datos han sido modificados', 
                color: 'green' 
            });
            
            closeEditar();
            cargarClientes();
            setClienteParaEditar(null);
        } catch (error) {
            notifications.show({ 
                title: 'Error', 
                message: error.response?.data?.message || 'No se pudo actualizar', 
                color: 'red' 
            });
        }
    };

    // Cambiar estado (activo/inactivo)
    const handleCambiarEstado = async (cliente) => {
        const nuevoEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo';
        const mensajeConfirmacion = nuevoEstado === 'inactivo' 
            ? `¿Seguro que deseas desactivar a ${cliente.nombre_razon_social}?`
            : `¿Seguro que deseas activar a ${cliente.nombre_razon_social}?`;
        
        if (!confirm(mensajeConfirmacion)) return;
        
        try {
            if (nuevoEstado === 'inactivo') {
                // Desactivar (eliminar lógicamente)
                await clienteService.deleteCliente(cliente.id_cliente);
                notifications.show({ 
                    title: '✅ Cliente desactivado', 
                    message: `${cliente.nombre_razon_social} ha sido desactivado`, 
                    color: 'orange' 
                });
            } else {
                // Activar (solo para Super Admin o si tienes función de reactivación)
                await clienteService.reactivarCliente(cliente.id_cliente);
                notifications.show({ 
                    title: '✅ Cliente activado', 
                    message: `${cliente.nombre_razon_social} ha sido activado nuevamente`, 
                    color: 'green' 
                });
            }
            cargarClientes();
        } catch (error) {
            notifications.show({ 
                title: 'Error', 
                message: `No se pudo cambiar el estado del cliente`, 
                color: 'red' 
            });
        }
    };

    // Filtrar clientes según búsqueda
    const filtrarClientes = () => {
        if (!searchTerm.trim()) return clientes;
        
        return clientes.filter(cliente =>
            cliente.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.ci_nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefono?.includes(searchTerm)
        );
    };

    const clientesFiltrados = filtrarClientes();
    
    // Paginación
    const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const clientesPaginados = clientesFiltrados.slice(startIndex, startIndex + itemsPerPage);

    // Estadísticas
    const contarClientesActivos = async () => {
        try {
            const res = await clienteService.getClientes();
            return res.data?.length || 0;
        } catch (error) {
            return 0;
        }
    };

    const contarClientesInactivos = async () => {
        try {
            const res = await clienteService.getEliminados();
            return res.data?.length || 0;
        } catch (error) {
            return 0;
        }
    };

    const [estadisticas, setEstadisticas] = useState({
        activos: 0,
        inactivos: 0
    });

    useEffect(() => {
        const cargarEstadisticas = async () => {
            const activos = await contarClientesActivos();
            const inactivos = await contarClientesInactivos();
            setEstadisticas({ activos, inactivos });
        };
        cargarEstadisticas();
    }, [activeTab]);

    // Renderizar filas
    const rows = clientesPaginados.map((cli) => (
        <Table.Tr key={cli.id_cliente}>
            {/* Información principal */}
            <Table.Td>
                <Stack gap={4}>
                    <Text fw={500}>{cli.nombre_razon_social}</Text>
                    <Text size="xs" c="dimmed">
                        {cli.ci_nit ? `CI/NIT: ${cli.ci_nit}` : 'Sin identificación'}
                    </Text>
                </Stack>
            </Table.Td>
            
            {/* Contacto */}
            <Table.Td>
                <Stack gap={4}>
                    {cli.email && (
                        <Group gap={4}>
                            <IconMail size={12} />
                            <Text size="sm" truncate>{cli.email}</Text>
                        </Group>
                    )}
                    {cli.telefono && (
                        <Group gap={4}>
                            <IconPhone size={12} />
                            <Text size="sm">{cli.telefono}</Text>
                        </Group>
                    )}
                </Stack>
            </Table.Td>
            
            {/* Información adicional */}
            <Table.Td>
                <Stack gap={4}>
                    <Badge 
                        color={cli.origen === 'publico' ? 'teal' : 'blue'} 
                        variant="light" 
                        size="xs"
                    >
                        {cli.origen || 'sistema'}
                    </Badge>
                    <Text size="xs" c="dimmed">
                        <IconCalendar size={10} /> {new Date(cli.fecha_registro).toLocaleDateString()}
                    </Text>
                </Stack>
            </Table.Td>
            
            {/* Empresa (solo Super Admin) */}
            {user.rol === 'super_admin' && (
                <Table.Td>
                    {cli.empresa_nombre ? (
                        <Badge color="grape" variant="light" size="xs">
                            <IconBuildingStore size={12}/> {cli.empresa_nombre}
                        </Badge>
                    ) : (
                        <Text size="xs" c="dimmed">Sin empresa</Text>
                    )}
                </Table.Td>
            )}
            
            {/* Estado con switch */}
            <Table.Td>
                <Group gap="xs">
                    <Badge 
                        color={cli.estado === 'activo' ? 'green' : 'red'} 
                        size="sm"
                        variant={cli.estado === 'activo' ? 'filled' : 'outline'}
                    >
                        {cli.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                    
                    {['administrador', 'super_admin'].includes(user.rol) && (
                        <Tooltip label={cli.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                            <ActionIcon
                                variant="subtle"
                                color={cli.estado === 'activo' ? 'orange' : 'green'}
                                size="sm"
                                onClick={() => handleCambiarEstado(cli)}
                            >
                                {cli.estado === 'activo' ? 
                                    <IconToggleLeft size={16} /> : 
                                    <IconToggleRight size={16} />
                                }
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Table.Td>
            
            {/* Acciones */}
            <Table.Td>
                <Group gap="xs">
                    <Tooltip label="Ver detalles">
                        <ActionIcon 
                            variant="subtle" 
                            color="blue" 
                            size="sm"
                            onClick={() => {
                                setClienteSeleccionado(cli);
                                openDetalles();
                            }}
                        >
                            <IconEye size={16} />
                        </ActionIcon>
                    </Tooltip>
                    
                    {['administrador', 'super_admin'].includes(user.rol) && cli.estado === 'activo' && (
                        <Tooltip label="Editar">
                            <ActionIcon 
                                variant="subtle" 
                                color="yellow" 
                                size="sm"
                                onClick={() => {
                                    setClienteParaEditar(cli);
                                    openEditar();
                                }}
                            >
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container size="xl" py="xl">
            {/* Header con título y botón */}
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Gestión de Clientes</Title>
                    <Text c="dimmed" size="sm">
                        {user.rol === 'super_admin' 
                            ? 'Administra todos los clientes del sistema' 
                            : `Clientes de tu empresa (${user.empresa_nombre || 'Sin empresa'})`}
                    </Text>
                </div>
                
                <Button 
                    leftSection={<IconUserPlus size={18} />} 
                    onClick={openNuevo}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                >
                    Nuevo Cliente
                </Button>
            </Group>

            {/* Tarjetas de estadísticas */}
            <SimpleGrid cols={4} mb="lg">
                <Paper p="md" withBorder radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed">Total Clientes</Text>
                            <Text fw={700} size="xl">{estadisticas.activos + estadisticas.inactivos}</Text>
                        </div>
                        <IconUsers size={24} color="blue" />
                    </Group>
                </Paper>
                
                <Paper p="md" withBorder radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed">Activos</Text>
                            <Text fw={700} size="xl" c="green.7">{estadisticas.activos}</Text>
                        </div>
                        <IconCheck size={24} color="green" />
                    </Group>
                </Paper>
                
                <Paper p="md" withBorder radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed">Inactivos</Text>
                            <Text fw={700} size="xl" c="red.7">{estadisticas.inactivos}</Text>
                        </div>
                        <IconX size={24} color="red" />
                    </Group>
                </Paper>
                
                <Paper p="md" withBorder radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed">Acciones</Text>
                            <Text fw={700} size="xl">{['administrador', 'super_admin'].includes(user.rol) ? 'Completas' : 'Lectura'}</Text>
                        </div>
                        <IconAddressBook size={24} color="orange" />
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Barra de herramientas */}
            <Card withBorder radius="md" mb="lg">
                <Group justify="space-between">
                    {/* Tabs para activos/inactivos */}
                    <Tabs value={activeTab} onChange={setActiveTab}>
                        <Tabs.List>
                            <Tabs.Tab 
                                value="activos" 
                                leftSection={<IconCheck size={16} />}
                            >
                                Activos ({estadisticas.activos})
                            </Tabs.Tab>
                            <Tabs.Tab 
                                value="inactivos" 
                                leftSection={<IconX size={16} />}
                            >
                                Inactivos ({estadisticas.inactivos})
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                    
                    {/* Búsqueda y acciones */}
                    <Group>
                        <Input
                            placeholder="Buscar clientes..."
                            leftSection={<IconSearch size={16} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 250 }}
                        />
                        
                        <Button 
                            variant="light" 
                            leftSection={<IconRefresh size={18} />}
                            onClick={cargarClientes}
                        >
                            Actualizar
                        </Button>
                    </Group>
                </Group>
            </Card>

            {/* Tabla de clientes */}
            <Card withBorder radius="md">
                {loading ? (
                    <Center py={40}>
                        <Loader />
                    </Center>
                ) : (
                    <>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Cliente</Table.Th>
                                    <Table.Th>Contacto</Table.Th>
                                    <Table.Th>Información</Table.Th>
                                    {user.rol === 'super_admin' && <Table.Th>Empresa</Table.Th>}
                                    <Table.Th>Estado</Table.Th>
                                    <Table.Th>Acciones</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.length > 0 ? rows : (
                                    <Table.Tr>
                                        <Table.Td colSpan={user.rol === 'super_admin' ? 6 : 5}>
                                            <Center py={40}>
                                                <Stack align="center" gap="xs">
                                                    <IconUsers size={40} color="gray" />
                                                    <Text c="dimmed">
                                                        {activeTab === 'activos' 
                                                            ? 'No hay clientes activos registrados' 
                                                            : 'No hay clientes inactivos'}
                                                    </Text>
                                                    {activeTab === 'activos' && (
                                                        <Button 
                                                            variant="light" 
                                                            size="sm"
                                                            onClick={openNuevo}
                                                        >
                                                            Registrar primer cliente
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                        
                        {/* Paginación */}
                        {totalPages > 1 && (
                            <Group justify="center" mt="md">
                                <Pagination
                                    total={totalPages}
                                    value={currentPage}
                                    onChange={setCurrentPage}
                                />
                                <Text size="sm" c="dimmed">
                                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
                                </Text>
                            </Group>
                        )}
                    </>
                )}
            </Card>

            {/* Modal para nuevo cliente */}
            <Modal 
                opened={modalNuevoOpen} 
                onClose={closeNuevo} 
                title="Registrar Nuevo Cliente"
                size="lg"
            >
                <Stack gap="md">
                    <TextInput 
                        label="Razón Social / Nombre" 
                        placeholder="Ej: Juan Pérez o Empresa S.A."
                        required
                        value={nuevoCliente.nombre_razon_social}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, nombre_razon_social: e.target.value})}
                    />
                    
                    <SimpleGrid cols={2}>
                        <TextInput 
                            label="CI / NIT" 
                            placeholder="12345678"
                            value={nuevoCliente.ci_nit}
                            onChange={(e) => setNuevoCliente({...nuevoCliente, ci_nit: e.target.value})}
                        />
                        <TextInput 
                            label="Teléfono" 
                            placeholder="+591 70000000"
                            value={nuevoCliente.telefono}
                            onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                        />
                    </SimpleGrid>
                    
                    <TextInput 
                        label="Email" 
                        placeholder="cliente@email.com"
                        type="email"
                        value={nuevoCliente.email}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                    />
                    
                    <Text c="blue" size="sm">
                        <strong>Nota:</strong> El cliente se creará con estado "activo" por defecto
                    </Text>
                    
                    <Divider />
                    
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={closeNuevo}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRegistrar}>
                            Guardar Cliente
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal para editar cliente */}
            <Modal 
                opened={modalEditarOpen} 
                onClose={closeEditar} 
                title="Editar Cliente"
                size="md"
            >
                {clienteParaEditar && (
                    <Stack gap="md">
                        <TextInput 
                            label="Nombre / Razón Social" 
                            value={clienteParaEditar.nombre_razon_social}
                            onChange={(e) => setClienteParaEditar({
                                ...clienteParaEditar, 
                                nombre_razon_social: e.target.value
                            })}
                        />
                        <Group justify="space-between" mt="md">
                            <Text size="sm" c="dimmed">
                                Estado actual: 
                                <Badge ml="xs" color={clienteParaEditar.estado === 'activo' ? 'green' : 'red'}>
                                    {clienteParaEditar.estado}
                                </Badge>
                            </Text>
                            <Switch
                                label="Activo"
                                checked={clienteParaEditar.estado === 'activo'}
                                onChange={() => handleCambiarEstado(clienteParaEditar)}
                                color={clienteParaEditar.estado === 'activo' ? 'green' : 'red'}
                            />
                        </Group>
                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={closeEditar}>
                                Cancelar
                            </Button>
                            <Button onClick={handleEditar}>
                                Guardar Cambios
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Modal para ver detalles */}
            <Modal 
                opened={modalDetallesOpen} 
                onClose={closeDetalles} 
                title="Detalles del Cliente"
                size="md"
            >
                {clienteSeleccionado && (
                    <Stack gap="md">
                        <Paper p="md" withBorder>
                            <Group justify="space-between">
                                <div>
                                    <Text fw={700} size="lg">{clienteSeleccionado.nombre_razon_social}</Text>
                                    <Text c="dimmed">{clienteSeleccionado.ci_nit || 'Sin identificación'}</Text>
                                </div>
                                <Badge 
                                    color={clienteSeleccionado.estado === 'activo' ? 'green' : 'red'}
                                    size="lg"
                                >
                                    {clienteSeleccionado.estado.toUpperCase()}
                                </Badge>
                            </Group>
                        </Paper>
                        
                        <Stack gap="sm">
                            <Divider label="Información de contacto" />
                            
                            {clienteSeleccionado.email && (
                                <Group gap="sm">
                                    <IconMail size={16} color="gray" />
                                    <Text>{clienteSeleccionado.email}</Text>
                                </Group>
                            )}
                            
                            {clienteSeleccionado.telefono && (
                                <Group gap="sm">
                                    <IconPhone size={16} color="gray" />
                                    <Text>{clienteSeleccionado.telefono}</Text>
                                </Group>
                            )}
                            
                            <Divider label="Información del sistema" />
                            
                            <Group gap="sm">
                                <IconCalendar size={16} color="gray" />
                                <Text>Registrado: {new Date(clienteSeleccionado.fecha_registro).toLocaleDateString()}</Text>
                            </Group>
                            
                            <Group gap="sm">
                                <IconUserCircle size={16} color="gray" />
                                <Text>Origen: {clienteSeleccionado.origen || 'sistema'}</Text>
                            </Group>
                            
                            {user.rol === 'super_admin' && clienteSeleccionado.empresa_nombre && (
                                <Group gap="sm">
                                    <IconBuildingStore size={16} color="gray" />
                                    <Text>Empresa: {clienteSeleccionado.empresa_nombre}</Text>
                                </Group>
                            )}
                        </Stack>
                        
                        <Group justify="flex-end" mt="md">
                            <Button 
                                variant="light" 
                                color={clienteSeleccionado.estado === 'activo' ? 'red' : 'green'}
                                leftSection={clienteSeleccionado.estado === 'activo' ? <IconX size={16} /> : <IconCheck size={16} />}
                                onClick={() => {
                                    handleCambiarEstado(clienteSeleccionado);
                                    closeDetalles();
                                }}
                            >
                                {clienteSeleccionado.estado === 'activo' ? 'Desactivar' : 'Activar'}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default Clientes;