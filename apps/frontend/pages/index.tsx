import { Container, Heading, Text, Flex } from '@radix-ui/themes'

export default function Dashboard() {
  return (
    <Container size="4" p="8" style={{ minHeight: '100vh' }}>
      <Flex direction="column" gap="4">
        <Heading size="8">Buena Dashboard</Heading>
        <Text color="gray" size="3">Property management dashboard placeholder</Text>
      </Flex>
    </Container>
  )
}