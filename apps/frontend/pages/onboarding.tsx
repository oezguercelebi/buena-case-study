import { Container, Heading, Text, Flex } from '@radix-ui/themes'

export default function Onboarding() {
  return (
    <Container size="4" p="8" style={{ minHeight: '100vh' }}>
      <Flex direction="column" gap="4">
        <Heading size="8">Property Onboarding</Heading>
        <Text color="gray" size="3">Multi-step wizard placeholder</Text>
      </Flex>
    </Container>
  )
}