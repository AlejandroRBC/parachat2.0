import { useState, useEffect } from 'react';
import { Container, Table, Button, Group, Title, Card, Badge, ActionIcon, Text, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUserPlus, IconEdit, IconTrash, IconBuildingStore } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getCurrentUser } from '../services/auth'; // Importante para saber quién está logueado
import { clienteService } from '../services/clienteService'; // Tu servicio de API

const Clientes = () => {
    const user = getCurrentUser(); // Obtenemos el usuario (rol, id, etc.)
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para el formulario de registro (simplificado para el ejemplo)
    const [opened, { open, close }] = useDisclosure(false);
    const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', nit: '', telefono: '' });

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await clienteService.getClientes();
            setClientes(res.data);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Error al cargar clientes', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // Función para manejar el registro (Disponible para todos)
    const handleRegistrar = async () => {
        try {
            // Los nombres de las propiedades deben coincidir EXACTAMENTE con el controlador
            const datosParaEnviar = {
                nombre_razon_social: nuevoCliente.nombre,
                ci_nit: nuevoCliente.nit,
                telefono: nuevoCliente.telefono,
                email: "" // Enviamos vacío para que el backend lo convierta en NULL
            };

            await clienteService.createCliente(datosParaEnviar);
            
            notifications.show({ title: 'Éxito', message: 'Cliente registrado', color: 'green' });
            close();
            cargarDatos();
            setNuevoCliente({ nombre: '', nit: '', telefono: '' });
        } catch (error) {
            console.error("Error en la petición:", error);
            notifications.show({ 
                title: 'Error', 
                message: error.response?.data?.error || 'No se pudo registrar', 
                color: 'red' 
            });
        }
    };

    // Funciones de Edición/Borrado (Solo Admin y SuperAdmin)
    const handleEliminar = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
        try {
            await clienteService.deleteCliente(id);
            notifications.show({ title: 'Eliminado', message: 'Cliente desactivado', color: 'orange' });
            cargarDatos();
        } catch (error) {
            console.error(error);
        }
    };

    // Renderizado de filas con lógica de roles
    const rows = clientes.map((cli) => (
        <Table.Tr key={cli.id_cliente}>
            <Table.Td>{cli.nombre_razon_social}</Table.Td>
            <Table.Td>{cli.ci_nit}</Table.Td>
            <Table.Td>{cli.telefono}</Table.Td>
            
            {/* Columna extra SOLO para Super Admin */}
            {user.rol === 'super_admin' && (
                <Table.Td>
                    <Badge color="grape" leftSection={<IconBuildingStore size={12}/>}>
                        {cli.empresa_nombre || 'N/A'}
                    </Badge>
                </Table.Td>
            )}

            <Table.Td>
                <Group gap="xs">
                    {/* LOGICA DE PERMISOS: Solo Admin y SuperAdmin ven botones de acción */}
                    {['administrador', 'super_admin'].includes(user.rol) ? (
                        <>
                            <ActionIcon variant="light" color="blue" onClick={() => notifications.show({message: 'Función Editar (Punto 2)'})}>
                                <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="red" onClick={() => handleEliminar(cli.id_cliente)}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        </>
                    ) : (
                        // El vendedor ve esto:
                        <Badge variant="light" color="gray">Solo Lectura</Badge>
                    )}
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container size="xl">
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Cartera de Clientes</Title>
                    <Text c="dimmed" size="sm">Vista de: {user.rol.toUpperCase()}</Text>
                </div>
                
                {/* Botón visible para TODOS (incluido Vendedor) */}
                <Button leftSection={<IconUserPlus size={18} />} onClick={open}>
                    Nuevo Cliente
                </Button>
            </Group>

            <Card withBorder radius="md">
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Razón Social</Table.Th>
                            <Table.Th>NIT/CI</Table.Th>
                            <Table.Th>Teléfono</Table.Th>
                            {user.rol === 'super_admin' && <Table.Th>Empresa (Tenant)</Table.Th>}
                            <Table.Th>Acciones</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Card>

            {/* Modal simple para registro */}
            <Modal opened={opened} onClose={close} title="Registrar Cliente">
                <TextInput label="Nombre" mb="sm" onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
                <TextInput label="NIT/CI" mb="sm" onChange={(e) => setNuevoCliente({...nuevoCliente, nit: e.target.value})} />
                <TextInput label="Teléfono" mb="lg" onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} />
                <Button fullWidth onClick={handleRegistrar}>Guardar</Button>
            </Modal>
        </Container>
    );
};

export default Clientes;