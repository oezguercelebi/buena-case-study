import { useState } from 'react'
import { Container, Heading, Text, Button, Flex, Card, Box, TextField, Select } from '@radix-ui/themes'

export default function TestDemo() {
  const [shouldThrowError, setShouldThrowError] = useState(false)

  if (shouldThrowError) {
    throw new Error('This is a test error to demonstrate the Error Boundary!')
  }

  return (
    <Container size="3" p="8">
      <Flex direction="column" gap="6">
        <Box>
          <Heading size="8" mb="2">Radix Themes & Error Boundary Demo</Heading>
          <Text color="gray" size="3">This page demonstrates Radix Themes components and Error Boundary functionality</Text>
        </Box>

        <Card>
          <Flex direction="column" gap="4">
            <Heading size="4">Radix Themes Components</Heading>
            
            <Box>
              <Text size="2" weight="bold" mb="2">Text Field Example</Text>
              <TextField.Root placeholder="Enter some text..." />
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="2">Select Example</Text>
              <Select.Root defaultValue="apple">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="apple">Apple</Select.Item>
                  <Select.Item value="orange">Orange</Select.Item>
                  <Select.Item value="banana">Banana</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Flex gap="2">
              <Button variant="solid">Solid Button</Button>
              <Button variant="soft">Soft Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </Flex>
          </Flex>
        </Card>

        <Card>
          <Flex direction="column" gap="4">
            <Heading size="4">Error Boundary Test</Heading>
            <Text size="2">Click the button below to trigger an error and see the Error Boundary in action:</Text>
            <Button 
              color="red" 
              onClick={() => setShouldThrowError(true)}
            >
              Trigger Error
            </Button>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}