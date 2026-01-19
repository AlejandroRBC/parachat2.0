import { 
    Container, 
    Title, 
    Text, 
    Button, 
    Group, 
    Card, 
    SimpleGrid, 
    Center,
    Box,
    Stack,
    Modal,
    TextInput,
    PasswordInput,
    Badge,
    Avatar,
    Divider,
    Tabs,
    Anchor,
    Loader,
    Alert,
    Paper
} from '@mantine/core';
import { 
    IconBuilding, 
    IconChartBar, 
    IconUsers, 
    IconShieldCheck,
    IconEye,
    IconPackage,
    IconUserPlus,
    IconLogin,
    IconLogout,
    IconUserCircle,
    IconBriefcase,
    IconCheck,
    IconAlertCircle
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login } from '../services/auth';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import api from '../services/api';

export function Home() {
    const navigate = useNavigate();
    const [microempresas, setMicroempresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
    const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
    const [activeTab, setActiveTab] = useState('cliente');
    const [clienteLogueado, setClienteLogueado] = useState(null);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [microempresasDisponibles, setMicroempresasDisponibles] = useState([]);

    // Verificar sesiones al cargar
    useEffect(() => {
        // Verificar si hay usuario del sistema logueado
        const usuario = getCurrentUser();
        if (usuario) {
            setUsuarioLogueado(usuario);
        }

        // Verificar si hay cliente público logueado
        const tokenCliente = localStorage.getItem('cliente_token');
        if (tokenCliente) {
            verificarClienteToken();
        }

        cargarMicroempresas();
        cargarMicroempresasParaVendedores();
    }, []);

    const cargarMicroempresas = async () => {
        try {
            const response = await api.get('/clientes-publico/microempresas');
            setMicroempresas(response.data);
        } catch (error) {
            console.error('Error cargando microempresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarMicroempresasParaVendedores = async () => {
        try {
            const response = await api.get('/auth/microempresas');
            setMicroempresasDisponibles(response.data || []);
        } catch (error) {
            console.error('Error cargando microempresas para vendedores:', error);
        }
    };

    const verificarClienteToken = async () => {
        try {
            const token = localStorage.getItem('cliente_token');
            const response = await api.get('/clientes-publico/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.valid) {
                setClienteLogueado(response.data.cliente);
            }
        } catch (error) {
            localStorage.removeItem('cliente_token');
            setClienteLogueado(null);
        }
    };

    // Formularios
    const formCliente = useForm({
        initialValues: {
            nombre: '',
            email: '',
            telefono: '',
            password: ''
        },
        validate: {
            nombre: (value) => value.length < 2 ? 'Nombre muy corto' : null,
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
            password: (value) => value.length < 6 ? 'Mínimo 6 caracteres' : null
        }
    });

    const formUsuario = useForm({
        initialValues: {
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            confirmPassword: '',
            rol_id: '',
            microempresa_id: ''
        },
        validate: {
            nombre: (value) => value.length < 2 ? 'Nombre muy corto' : null,
            apellido: (value) => value.length < 2 ? 'Apellido muy corto' : null,
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
            password: (value) => value.length < 6 ? 'Mínimo 6 caracteres' : null,
            confirmPassword: (value, values) => value !== values.password ? 'Las contraseñas no coinciden' : null,
            rol_id: (value) => value ? null : 'Selecciona un rol',
            microempresa_id: (value, values) => values.rol_id === '3' && !value ? 'Selecciona una microempresa' : null
        }
    });

    const formLogin = useForm({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
            password: (value) => value.length < 4 ? 'Contraseña muy corta' : null
        }
    });

    // Handlers para Clientes Públicos
    const handleRegistroCliente = async (values) => {
        try {
            const response = await api.post('/clientes-publico/registrar', values);
            
            localStorage.setItem('cliente_token', response.data.token);
            setClienteLogueado(response.data.cliente);
            setModalClienteAbierto(false);
            
            notifications.show({
                title: '¡Registro exitoso!',
                message: 'Ahora puedes explorar las microempresas',
                color: 'green',
                icon: <IconCheck size={16} />
            });
            
            formCliente.reset();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Error al registrar',
                color: 'red',
                icon: <IconAlertCircle size={16} />
            });
        }
    };

    const handleLoginCliente = async (values) => {
        try {
            const response = await api.post('/clientes-publico/login', values);
            
            localStorage.setItem('cliente_token', response.data.token);
            setClienteLogueado(response.data.cliente);
            setModalClienteAbierto(false);
            
            notifications.show({
                title: '¡Bienvenido!',
                message: `Hola ${response.data.cliente.nombre}`,
                color: 'green',
                icon: <IconCheck size={16} />
            });
            
            formLogin.reset();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Credenciales incorrectas',
                color: 'red',
                icon: <IconAlertCircle size={16} />
            });
        }
    };

    const handleLogoutCliente = () => {
        localStorage.removeItem('cliente_token');
        setClienteLogueado(null);
        notifications.show({
            title: 'Sesión cerrada',
            message: 'Has salido de tu cuenta de cliente',
            color: 'blue',
        });
    };

    // Handlers para Usuarios del Sistema
    const handleRegistroUsuario = async (values) => {
        try {
            const dataToSend = {
                nombre: values.nombre,
                apellido: values.apellido,
                email: values.email,
                password: values.password,
                rol_id: parseInt(values.rol_id)
            };

            // Si es Vendedor, agregar microempresa_id
            if (values.rol_id === '3') {
                dataToSend.microempresa_id = parseInt(values.microempresa_id);
            }

            await api.post('/auth/register', dataToSend);
            
            notifications.show({
                title: '¡Registro exitoso!',
                message: 'Tu cuenta ha sido creada correctamente',
                color: 'green',
                icon: <IconCheck size={16} />
            });

            // Intentar login automático
            await login(values.email, values.password);
            navigate('/dashboard');
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al crear la cuenta';
            notifications.show({
                title: 'Error en el registro',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={16} />
            });
        }
    };

    const handleLoginUsuario = async (values) => {
        try {
            await login(values.email, values.password);
            
            notifications.show({
                title: '¡Bienvenido!',
                message: 'Has iniciado sesión correctamente',
                color: 'green',
                icon: <IconCheck size={16} />
            });

            navigate('/dashboard');
        } catch (error) {
            notifications.show({
                title: 'Error de acceso',
                message: error.response?.data?.message || 'Credenciales incorrectas',
                color: 'red',
                icon: <IconAlertCircle size={16} />
            });
        }
    };

    const handleLogoutUsuario = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUsuarioLogueado(null);
        notifications.show({
            title: 'Sesión cerrada',
            message: 'Has salido del sistema',
            color: 'blue',
        });
    };

    const handleVerMicroempresa = async (microempresaId) => {
        if (!clienteLogueado) {
            notifications.show({
                title: 'Regístrate como cliente primero',
                message: 'Debes registrarte para ver los productos',
                color: 'yellow',
            });
            setModalClienteAbierto(true);
            return;
        }

        try {
            // Registrar la visita
            await api.post('/clientes-publico/visita', {
                cliente_id: clienteLogueado.id,
                microempresa_id: microempresaId
            });

            // Redirigir a vista de productos
            navigate(`/microempresa/${microempresaId}`);
        } catch (error) {
            console.error('Error registrando visita:', error);
        }
    };

    return (
        <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-blue-0)' }}>
            {/* Header con navegación */}
            <Box bg="white" py="md" shadow="sm">
                <Container size="lg">
                    <Group justify="space-between">
                        <Group>
                            <IconBuilding size={32} color="blue" />
                            <Title order={3} c="blue.7">Gestión SaaS Microempresas</Title>
                        </Group>
                        
                        <Group>
                            {/* Mostrar estado de sesión */}
                            {usuarioLogueado ? (
                                <Group>
                                    <Badge color="blue" leftSection={<IconUserCircle size={12} />}>
                                        {usuarioLogueado.nombre}
                                    </Badge>
                                    <Button 
                                        variant="light" 
                                        color="blue"
                                        onClick={() => navigate('/dashboard')}
                                        size="sm"
                                    >
                                        Dashboard
                                    </Button>
                                    <Button 
                                        variant="light" 
                                        color="red" 
                                        leftSection={<IconLogout size={16} />}
                                        onClick={handleLogoutUsuario}
                                        size="sm"
                                    >
                                        Salir
                                    </Button>
                                </Group>
                            ) : clienteLogueado ? (
                                <Group>
                                    <Badge color="teal" leftSection={<IconUsers size={12} />}>
                                        {clienteLogueado.nombre}
                                    </Badge>
                                    <Button 
                                        variant="light" 
                                        color="red" 
                                        leftSection={<IconLogout size={16} />}
                                        onClick={handleLogoutCliente}
                                        size="sm"
                                    >
                                        Salir
                                    </Button>
                                </Group>
                            ) : (
                                <Group>
                                    <Button 
                                        variant="light" 
                                        leftSection={<IconUserPlus size={16} />}
                                        onClick={() => setModalUsuarioAbierto(true)}
                                        size="sm"
                                    >
                                        Crear Empresa
                                    </Button>
                                    <Button 
                                        variant="filled" 
                                        leftSection={<IconLogin size={16} />}
                                        onClick={() => {
                                            setModalUsuarioAbierto(true);
                                            setActiveTab('login');
                                        }}
                                        size="sm"
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </Group>
                            )}
                        </Group>
                    </Group>
                </Container>
            </Box>

            {/* Hero Section */}
            <Container size="lg" py={60}>
                <Stack align="center" gap="xl">
                    <Title order={1} size={48} c="blue.7" fw={900} ta="center">
                        Sistema SaaS para 
                        <Text span c="cyan.6" inherit> Microempresas</Text>
                    </Title>
                    
                    <Text size="xl" c="gray.7" ta="center" maw={800}>
                        Administra tu empresa o explora productos de microempresas locales. 
                        Plataforma todo en uno para dueños y clientes.
                    </Text>

                    <Group mt={30}>
                        {usuarioLogueado ? (
                            <Button 
                                size="lg" 
                                radius="md"
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'cyan' }}
                                onClick={() => navigate('/dashboard')}
                            >
                                Ir al Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    size="lg" 
                                    radius="md"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan' }}
                                    onClick={() => setModalUsuarioAbierto(true)}
                                >
                                    Crear Mi Empresa
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant="light" 
                                    radius="md"
                                    onClick={() => {
                                        setModalUsuarioAbierto(true);
                                        setActiveTab('login');
                                    }}
                                >
                                    Acceso Empresas
                                </Button>
                            </>
                        )}
                    </Group>
                </Stack>
            </Container>

            {/* Sección para Clientes */}
            <Container size="lg" py={60} bg="white" style={{ borderRadius: '12px' }}>
                <Title order={2} mb="md" ta="center">Para Clientes</Title>
                <Text c="dimmed" mb="xl" ta="center">
                    Explora productos de microempresas locales. Regístrate gratis como cliente.
                </Text>

                {!clienteLogueado ? (
                    <Center>
                        <Button 
                            size="lg"
                            variant="outline"
                            color="teal"
                            leftSection={<IconUsers size={20} />}
                            onClick={() => setModalClienteAbierto(true)}
                        >
                            Registrarme como Cliente
                        </Button>
                    </Center>
                ) : (
                    <Alert color="teal" title={`Bienvenido ${clienteLogueado.nombre}`} mb="xl">
                        <Text>Ahora puedes explorar los productos de las microempresas.</Text>
                        <Group mt="md">
                            <Button 
                                variant="light" 
                                color="teal"
                                onClick={() => navigate('#microempresas')}
                            >
                                Ver Microempresas
                            </Button>
                            <Button 
                                variant="subtle" 
                                onClick={handleLogoutCliente}
                            >
                                Cerrar Sesión
                            </Button>
                        </Group>
                    </Alert>
                )}

                {/* Lista de Microempresas */}
                <Box id="microempresas" mt={40}>
                    <Title order={3} mb="lg">Microempresas Activas</Title>
                    
                    {loading ? (
                        <Center py={40}>
                            <Loader />
                        </Center>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                            {microempresas.map((empresa) => (
                                <Card key={empresa.id_microempresa} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Card.Section p="md">
                                        <Group justify="space-between">
                                            <Avatar color="blue" radius="xl">
                                                {empresa.nombre.charAt(0)}
                                            </Avatar>
                                            <Badge color="green" variant="light">
                                                {empresa.productos_count || 0} productos
                                            </Badge>
                                        </Group>
                                    </Card.Section>

                                    <Text fw={500} size="lg" mt="md">{empresa.nombre}</Text>
                                    <Text size="sm" c="dimmed" mt="xs">{empresa.rubro}</Text>
                                    <Text size="sm" mt="xs" lineClamp={2}>{empresa.descripcion}</Text>

                                    <Group mt="md" justify="space-between">
                                        <div>
                                            <Text size="sm" c="dimmed">📍 {empresa.direccion}</Text>
                                            <Text size="sm" c="dimmed">📞 {empresa.telefono}</Text>
                                        </div>
                                        <Button 
                                            variant="light" 
                                            color="blue" 
                                            leftSection={<IconEye size={16} />}
                                            onClick={() => handleVerMicroempresa(empresa.id_microempresa)}
                                            disabled={!clienteLogueado}
                                        >
                                            Ver Productos
                                        </Button>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </Container>

            {/* Modal para Clientes (Registro/Login) */}
            <Modal 
                opened={modalClienteAbierto} 
                onClose={() => setModalClienteAbierto(false)}
                title="Acceso para Clientes"
                size="md"
            >
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List grow mb="md">
                        <Tabs.Tab value="registro" leftSection={<IconUserPlus size={16} />}>
                            Registrarse
                        </Tabs.Tab>
                        <Tabs.Tab value="login" leftSection={<IconLogin size={16} />}>
                            Iniciar Sesión
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="registro">
                        <form onSubmit={formCliente.onSubmit(handleRegistroCliente)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Nombre Completo"
                                    placeholder="Juan Pérez"
                                    {...formCliente.getInputProps('nombre')}
                                    required
                                />
                                <TextInput
                                    label="Email"
                                    placeholder="cliente@ejemplo.com"
                                    type="email"
                                    {...formCliente.getInputProps('email')}
                                    required
                                />
                                <TextInput
                                    label="Teléfono"
                                    placeholder="+591 70000000"
                                    {...formCliente.getInputProps('telefono')}
                                />
                                <PasswordInput
                                    label="Contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    {...formCliente.getInputProps('password')}
                                    required
                                />
                                <Button type="submit" fullWidth>
                                    Registrarse como Cliente
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>

                    <Tabs.Panel value="login">
                        <form onSubmit={formLogin.onSubmit(handleLoginCliente)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Email"
                                    placeholder="cliente@ejemplo.com"
                                    type="email"
                                    {...formLogin.getInputProps('email')}
                                    required
                                />
                                <PasswordInput
                                    label="Contraseña"
                                    placeholder="Tu contraseña"
                                    {...formLogin.getInputProps('password')}
                                    required
                                />
                                <Button type="submit" fullWidth>
                                    Iniciar Sesión
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>
                </Tabs>
            </Modal>

            {/* Modal para Usuarios del Sistema (Registro/Login) */}
            <Modal 
                opened={modalUsuarioAbierto} 
                onClose={() => {
                    setModalUsuarioAbierto(false);
                    setActiveTab('login');
                    formUsuario.reset();
                    formLogin.reset();
                }}
                title="Acceso para Empresas"
                size="md"
            >
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List grow mb="md">
                        <Tabs.Tab value="registro" leftSection={<IconBriefcase size={16} />}>
                            Crear Empresa
                        </Tabs.Tab>
                        <Tabs.Tab value="login" leftSection={<IconLogin size={16} />}>
                            Iniciar Sesión
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="registro">
                        <form onSubmit={formUsuario.onSubmit(handleRegistroUsuario)}>
                            <Stack gap="md">
                                <Group grow>
                                    <TextInput
                                        label="Nombre"
                                        placeholder="Juan"
                                        {...formUsuario.getInputProps('nombre')}
                                        required
                                    />
                                    <TextInput
                                        label="Apellido"
                                        placeholder="Pérez"
                                        {...formUsuario.getInputProps('apellido')}
                                        required
                                    />
                                </Group>

                                <TextInput
                                    label="Email"
                                    placeholder="usuario@ejemplo.com"
                                    type="email"
                                    {...formUsuario.getInputProps('email')}
                                    required
                                />

                                <PasswordInput
                                    label="Contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    {...formUsuario.getInputProps('password')}
                                    required
                                />

                                <PasswordInput
                                    label="Confirmar Contraseña"
                                    placeholder="Repite tu contraseña"
                                    {...formUsuario.getInputProps('confirmPassword')}
                                    required
                                />

                                <Text fw={500} size="sm">Tipo de Cuenta</Text>
                                <Group grow>
                                    <Button
                                        variant={formUsuario.values.rol_id === '2' ? 'filled' : 'outline'}
                                        color="blue"
                                        onClick={() => formUsuario.setFieldValue('rol_id', '2')}
                                        fullWidth
                                    >
                                        Administrador
                                    </Button>
                                    <Button
                                        variant={formUsuario.values.rol_id === '3' ? 'filled' : 'outline'}
                                        color="green"
                                        onClick={() => formUsuario.setFieldValue('rol_id', '3')}
                                        fullWidth
                                    >
                                        Vendedor
                                    </Button>
                                </Group>

                                {formUsuario.values.rol_id === '3' && (
                                    <>
                                        <Text size="sm" c="dimmed" mt="xs">
                                            Selecciona la microempresa a la que perteneces
                                        </Text>
                                        <select
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da',
                                                fontSize: '14px'
                                            }}
                                            value={formUsuario.values.microempresa_id}
                                            onChange={(e) => formUsuario.setFieldValue('microempresa_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar Microempresa</option>
                                            {microempresasDisponibles.map((emp) => (
                                                <option key={emp.id_microempresa} value={emp.id_microempresa}>
                                                    {emp.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                <Button type="submit" fullWidth mt="md">
                                    {formUsuario.values.rol_id === '2' ? 'Crear Mi Empresa' : 'Registrarme como Vendedor'}
                                </Button>

                                <Divider label="¿Ya tienes cuenta?" />

                                <Button 
                                    variant="light" 
                                    onClick={() => setActiveTab('login')}
                                    fullWidth
                                >
                                    Iniciar Sesión
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>

                    <Tabs.Panel value="login">
                        <form onSubmit={formLogin.onSubmit(handleLoginUsuario)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Email"
                                    placeholder="usuario@ejemplo.com"
                                    type="email"
                                    {...formLogin.getInputProps('email')}
                                    required
                                />
                                <PasswordInput
                                    label="Contraseña"
                                    placeholder="Tu contraseña"
                                    {...formLogin.getInputProps('password')}
                                    required
                                />
                                <Button type="submit" fullWidth>
                                    Iniciar Sesión
                                </Button>

                                <Divider label="¿No tienes cuenta?" />

                                <Button 
                                    variant="light" 
                                    onClick={() => setActiveTab('registro')}
                                    fullWidth
                                >
                                    Crear Nueva Empresa
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>
                </Tabs>
            </Modal>

            {/* Footer */}
            <Box bg="dark.7" mt={60} py={40}>
                <Container size="lg">
                    <Group justify="space-between">
                        <div>
                            <Title order={4} c="white">Gestión SaaS Microempresas</Title>
                            <Text c="gray.5" size="sm">Plataforma todo en uno para microempresas</Text>
                        </div>
                        <Group>
                            <Anchor c="gray.5" size="sm" onClick={() => setModalUsuarioAbierto(true)}>
                                Para Empresas
                            </Anchor>
                            <Anchor c="gray.5" size="sm" onClick={() => setModalClienteAbierto(true)}>
                                Para Clientes
                            </Anchor>
                        </Group>
                    </Group>
                </Container>
            </Box>
        </Box>
    );
}