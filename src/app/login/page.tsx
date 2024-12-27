"use client"

import { Button, Box, Flex, Heading, Input, VStack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field"
import { login } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();
  
  return (
    <Flex
      width="full"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, blue.200, blue.500)"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        width="100%"
        maxWidth="400px"
      >
        <Heading textAlign="center" mb={6} color="blue.600">
          Welcome Back
        </Heading>
        <Text textAlign="center" mb={6} color="gray.600">
          Please login to continue
        </Text>
        <form>
          <VStack gap={4}>
            <Field label = "Email" color="gray.600">
              <Input id="email" name="email" type="email" placeholder="Enter your email" required className="border border-gray p-2" />
            </Field>

            <Field label="Password" color="gray.600">
              <Input id="password" name="password" type="password" placeholder="Enter your password" required className="border border-gray p-2" />
            </Field>

            <Button
              type="submit"
              backgroundColor="#4F11C9"
              color="white"
              width="full"
              formAction={login}
            >
              Log in
            </Button>
          </VStack>
        </form>
        <Text mt={4} textAlign="center" color="gray.500">
          Don’t have an account? <Text as="span" color="blue.600" cursor="pointer" onClick={() => {
              router.push("/signUp"); 
            }}>Sign up</Text>
        </Text>
      </Box>
    </Flex>
  );
}
