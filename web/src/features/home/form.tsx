"use client";

import Form from "next/form";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useActionState, useCallback } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthenticationForm() {
  const { signIn } = useAuthActions();
  const signInAction = useCallback(
    async (_: unknown, data: FormData) => {
      try {
        await toast
          .promise(signIn("password", data), {
            loading: "Signing in...",
            success: "Successfully signed in",
            error: {
              message: "Invalid email and password combination",
              description:
                "Check if you're using the correct email and password. If you're a new user, check if the password is at least 8 characters long.",
              dismissible: true,
              duration: Infinity,
            },
          })
          .unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [signIn],
  );
  const [_, action, isPending] = useActionState(signInAction, null);
  return (
    <Form action={action}>
      <Tabs defaultValue="signUp" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-white/20 bg-white/80 backdrop-blur-sm">
          <TabsTrigger
            value="signUp"
            className="transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Sign up
          </TabsTrigger>
          <TabsTrigger
            value="signIn"
            className="transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Log in
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signUp">
          <input type="hidden" name="flow" value="signUp" />
        </TabsContent>
        <TabsContent value="signIn">
          <input type="hidden" name="flow" value="signIn" />
        </TabsContent>
        <Card className="border-white/20 bg-white/90 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
              <TabsContent value="signUp" className="contents">
                Let&apos;s get started.
              </TabsContent>
              <TabsContent value="signIn" className="contents">
                Welcome back!
              </TabsContent>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                required
                name="email"
                placeholder="user@example.com"
                disabled={isPending}
                className="border-gray-200 transition-all duration-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                type="password"
                required
                name="password"
                disabled={isPending}
                className="border-gray-200 transition-all duration-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
          <CardFooter>
            {isPending ? (
              <Button
                type="submit"
                disabled
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>
                  <TabsContent value="signUp" className="contents">
                    Signing up...
                  </TabsContent>
                  <TabsContent value="signIn" className="contents">
                    Logging in...
                  </TabsContent>
                </span>
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full transform bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
              >
                <TabsContent value="signUp" className="contents">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Sign up</span>
                </TabsContent>
                <TabsContent value="signIn" className="contents">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Log in</span>
                </TabsContent>
              </Button>
            )}
          </CardFooter>
        </Card>
      </Tabs>
    </Form>
  );
}
