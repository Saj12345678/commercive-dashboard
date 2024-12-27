"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const msg = searchParams.get("msg");

    console.log(code, "dd");

    if (code === "400") {
      toast.error(msg || "Something went wrong. Please try again.");
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/login");
  };

  return (
    <Flex
      width="full"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, red.200, red.500)"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        textAlign="center"
        width="100%"
        maxWidth="400px"
      >
        <VStack>
          <Heading color="red.600" fontSize="2xl">
            Oops! Something Went Wrong
          </Heading>
          <Text color="gray.600">
            {searchParams.get("msg") ||
              "An unexpected error occurred. Please try again."}
          </Text>
          <Button colorScheme="red" onClick={handleRetry}>
            Go to Home
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
