import { 
    Container, Title, Text, Card, SimpleGrid, 
    Badge, Group, Button, Center, Loader, Stack,
    Table, NumberInput, ActionIcon, Paper
} from '@mantine/core';
import { IconPackage, IconShoppingCart, IconArrowLeft, IconBuilding } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

const MicroempresaProductos = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [microempresa, setMicroempresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            const [productosRes, empresaRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/clientes-publico/productos/${id}`),
                axios.get(`http://localhost:3000/api/auth/microempresas/${id}`)
            ]);
            
            setProductos(productosRes.data);
            setMicroempresa(empresaRes.data || {});
        } catch (error) {
            console.error('Error cargando datos:', error);
            notifications.show({
                title: 'Error',
                message: 'No se pudieron cargar los productos',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const agregarAlCarrito = (producto) => {
        setCart([...cart, {
            ...producto,
            cantidad: 1
        }]);
        notifications.show({
            title: 'Agregado',
            message: `${producto.nombre} agregado al carrito`,
            color: 'green'
        });
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Group mb="xl">
                <Button 
                    variant="light" 
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate('/')}
                >
                    Volver
                </Button>
            </Group>

            {/* Info Microempresa */}
            <Card mb="xl" withBorder shadow="sm">
                <Group>
                    <IconBuilding size={32} color="blue" />
                    <div>
                        <Title order={3}>{microempresa.nombre}</Title>
                        <Text c="dimmed">{microempresa.direccion}</Text>
                        <Group mt="xs">
                            <Badge color="blue">{microempresa.rubro}</Badge>
                            <Badge color="green">{productos.length} productos</Badge>
                        </Group>
                    </div>
                </Group>
            </Card>

            {/* Productos */}
            <Title order={3} mb="md">📦 Productos Disponibles</Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {productos.map((producto) => (
                    <Card key={producto.id_producto} shadow="sm" padding="lg" radius="md" withBorder>
                        <Card.Section p="md" bg="gray.0">
                            <Group justify="center">
                                <IconPackage size={40} color="blue" />
                            </Group>
                        </Card.Section>

                        <Text fw={500} size="lg" mt="md">{producto.nombre}</Text>
                        <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>{producto.descripcion}</Text>
                        
                        <Group justify="space-between" mt="md">
                            <div>
                                <Text fw={700} size="xl">Bs. {producto.precio}</Text>
                                <Text size="sm" c={producto.stock_actual > 0 ? 'green' : 'red'}>
                                    {producto.stock_actual > 0 ? 'En stock' : 'Agotado'}
                                </Text>
                            </div>
                            <Button 
                                variant="light" 
                                color="blue"
                                leftSection={<IconShoppingCart size={16} />}
                                onClick={() => agregarAlCarrito(producto)}
                                disabled={producto.stock_actual <= 0}
                            >
                                Agregar
                            </Button>
                        </Group>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Carrito (Opcional) */}
            {cart.length > 0 && (
                <Paper mt="xl" p="md" withBorder shadow="sm">
                    <Title order={4} mb="md">🛒 Tu Carrito ({cart.length})</Title>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Producto</Table.Th>
                                <Table.Th>Precio</Table.Th>
                                <Table.Th>Cantidad</Table.Th>
                                <Table.Th>Subtotal</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {cart.map((item, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{item.nombre}</Table.Td>
                                    <Table.Td>Bs. {item.precio}</Table.Td>
                                    <Table.Td>
                                        <NumberInput 
                                            min={1} 
                                            max={item.stock_actual}
                                            defaultValue={1}
                                            size="sm"
                                            w={80}
                                        />
                                    </Table.Td>
                                    <Table.Td>Bs. {item.precio}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Group justify="end" mt="md">
                        <Button color="blue">Solicitar Cotización</Button>
                    </Group>
                </Paper>
            )}
        </Container>
    );
};

export default MicroempresaProductos;