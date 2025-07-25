"use client";

import Form from "next/form";
import { Loader2, LogIn, UserPlus } from "lucide-react";
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
    async (_: unknown, data: FormData) => await signIn("password", data),
    [signIn],
  );
  const [_, action, isPending] = useActionState(signInAction, null);
  return (
    <Form action={action}>
      <Tabs defaultValue="signUp">
        <TabsList>
          <TabsTrigger value="signUp">Sign up</TabsTrigger>
          <TabsTrigger value="signIn">Log in</TabsTrigger>
        </TabsList>
        <TabsContent value="signUp">
          <input type="hidden" name="flow" value="signUp" />
        </TabsContent>
        <TabsContent value="signIn">
          <input type="hidden" name="flow" value="signIn" />
        </TabsContent>
        <Card>
          <CardHeader>
            <CardTitle>
              <TabsContent value="signUp" className="contents">
                Let&apos;s get started.
              </TabsContent>
              <TabsContent value="signIn" className="contents">
                Welcome back!
              </TabsContent>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                name="email"
                placeholder="user@example.com"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required name="password" disabled={isPending} />
            </div>
          </CardContent>
          <CardFooter>
            {isPending ? (
              <Button type="submit" disabled className="w-full">
                <Loader2 className="animate-spin" />
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
              <Button type="submit" className="w-full">
                <TabsContent value="signUp" className="contents">
                  <UserPlus />
                  <span>Sign up</span>
                </TabsContent>
                <TabsContent value="signIn" className="contents">
                  <LogIn />
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
