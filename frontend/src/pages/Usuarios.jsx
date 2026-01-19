import { 
    Container, 
    Title, 
    Text, 
    Card, 
    Table, 
    Button, 
    Group, 
    Badge, 
    Modal,
    TextInput,
    Select,
    Stack,
    ActionIcon,
    Tooltip,
    Center,
    Loader
} from '@mantine/core';
import { 
    IconUser, 
    IconPlus, 
    IconTrash, 
    IconToggleLeft, 
    IconToggleRight,
    IconMail
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { getCurrentUser } from '../services/auth';
import { usuarioService } from '../services/api';

const Usuarios = () => {
    const user = getCurrentUser();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // ESTADO CORREGIDO: Incluimos microempresa_id desde el inicio
    const [currentUsuario, setCurrentUsuario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: '',
        microempresa_id: user?.microempresa_id || '' 
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await usuarioService.getAll();
            setUsuarios(response.data);
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Error al cargar usuarios',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEstado = async (id, nuevoEstado) => {
        try {
            await usuarioService.updateEstado(id, nuevoEstado);
            notifications.show({
                title: 'Éxito',
                message: `Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`,
                color: 'green'
            });
            fetchUsuarios();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Error al cambiar estado',
                color: 'red'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificación de seguridad: Si no hay ID de empresa, avisar al usuario
        if (!currentUsuario.microempresa_id && user.rol !== 'super_admin') {
            notifications.show({
                title: 'Error de sesión',
                message: 'No se detectó el ID de tu empresa. Por favor, re-inicia sesión.',
                color: 'red'
            });
            return;
        }

        try {
            await usuarioService.create(currentUsuario);
            notifications.show({
                title: 'Éxito',
                message: 'Usuario creado correctamente',
                color: 'green'
            });
            setModalOpen(false);
            
            // Limpiar formulario y resetear microempresa_id para el siguiente
            setCurrentUsuario({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                rol_id: '',
                microempresa_id: user?.microempresa_id || ''
            });
            
            fetchUsuarios();
        } catch (error) {
            // Este mensaje ahora será el que viene de tu backend (ej: "Límite de plan excedido")
            notifications.show({
                title: 'Error al crear',
                message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al crear usuario',
                color: 'red',
                autoClose: 5000 // Más tiempo para leer el error
            });
        }
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>Gestión de Usuarios</Title>
                    <Text c="dimmed">
                        {user.rol === 'super_admin' 
                            ? 'Administra todos los usuarios del sistema' 
                            : 'Gestiona los usuarios de tu empresa'}
                    </Text>
                </div>
                <Button 
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setModalOpen(true)}
                >
                    Nuevo Usuario
                </Button>
            </Group>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Rol</Table.Th>
                            {user.rol === 'super_admin' && <Table.Th>Empresa</Table.Th>}
                            <Table.Th>Estado</Table.Th>
                            <Table.Th>Registro</Table.Th>
                            <Table.Th>Acciones</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {usuarios.map((usuario) => (
                            <Table.Tr key={usuario.id_usuario}>
                                <Table.Td>
                                    <Text fw={500}>{usuario.nombre} {usuario.apellido}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconMail size={14} />
                                        <Text size="sm">{usuario.email}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge 
                                        color={
                                            usuario.tipo_rol === 'super_admin' ? 'red' :
                                            usuario.tipo_rol === 'administrador' ? 'blue' :
                                            usuario.tipo_rol === 'microempresa_P' ? 'violet' : 'teal'
                                        }
                                    >
                                        {usuario.tipo_rol?.replace('_', ' ') || 'Vendedor'}
                                    </Badge>
                                </Table.Td>
                                {user.rol === 'super_admin' && (
                                    <Table.Td>
                                        <Text size="sm">{usuario.empresa_nombre || 'Sin empresa'}</Text>
                                    </Table.Td>
                                )}
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
                                        <Tooltip label={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                                            <ActionIcon
                                                variant="light"
                                                color={usuario.estado === 'activo' ? 'orange' : 'green'}
                                                onClick={() => handleToggleEstado(
                                                    usuario.id_usuario, 
                                                    usuario.estado === 'activo' ? 'inactivo' : 'activo'
                                                )}
                                            >
                                                {usuario.estado === 'activo' ? 
                                                    <IconToggleLeft size={16} /> : 
                                                    <IconToggleRight size={16} />
                                                }
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Nuevo Usuario"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="Nombre"
                                placeholder="Juan"
                                required
                                value={currentUsuario.nombre}
                                onChange={(e) => setCurrentUsuario({...currentUsuario, nombre: e.target.value})}
                            />
                            <TextInput
                                label="Apellido"
                                placeholder="Pérez"
                                required
                                value={currentUsuario.apellido}
                                onChange={(e) => setCurrentUsuario({...currentUsuario, apellido: e.target.value})}
                            />
                        </Group>

                        <TextInput
                            label="Email"
                            placeholder="usuario@ejemplo.com"
                            type="email"
                            required
                            value={currentUsuario.email}
                            onChange={(e) => setCurrentUsuario({...currentUsuario, email: e.target.value})}
                        />

                        <TextInput
                            label="Contraseña"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            required
                            value={currentUsuario.password}
                            onChange={(e) => setCurrentUsuario({...currentUsuario, password: e.target.value})}
                        />

                        <Select
                            label="Rol"
                            placeholder="Selecciona un rol"
                            data={[
                                { value: '3', label: 'Vendedor' }
                            ]}
                            required
                            value={currentUsuario.rol_id}
                            onChange={(value) => setCurrentUsuario({...currentUsuario, rol_id: value})}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Crear Usuario
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
};

export default Usuarios;