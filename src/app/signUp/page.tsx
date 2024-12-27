"use client";

import { Suspense, useEffect, useState } from "react";
import { Button, Box, Flex, Heading, Input, VStack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { signup } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const referral = searchParams.get("referral");
    if (referral) {
      setReferralCode(referral);
    }
  }, [searchParams]);

  return (
    <Flex
      width="full"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, purple.200, purple.500)"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        width="100%"
        maxWidth="400px"
      >
        <Heading textAlign="center" mb={6} color="purple.600">
          Create an Account
        </Heading>
        <Text textAlign="center" mb={6} color="gray.600">
          Please sign up to get started
        </Text>
        <form action={signup} method="post">
          <VStack gap={4}>
            <Field label="Email" color="gray.600">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="border border-gray p-2"
              />
            </Field>

            <Field label="Password" color="gray.600">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="border border-gray p-2"
              />
            </Field>

            {referralCode && <Input type="hidden" name="referral" value={referralCode} />}

            <Button
              type="submit"
              backgroundColor="#4F11C9"
              color="white"
              width="full"
            >
              Sign up
            </Button>
          </VStack>
        </form>
        <Text mt={4} textAlign="center" color="gray.500">
          Already have an account?{" "}
          <Text
            as="span"
            color="purple.600"
            cursor="pointer"
            onClick={() => {
              router.push("/login");
            }}
          >
            Log in
          </Text>
        </Text>
      </Box>
    </Flex>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SignupForm />
    </Suspense>
  );
}

