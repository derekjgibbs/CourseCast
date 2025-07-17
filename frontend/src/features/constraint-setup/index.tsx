import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ConstraintSetupForm } from "./form";

export function ConstraintSetupCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constraint Setup</CardTitle>
        <CardDescription>
          Configure your course selection parameters and requirements
        </CardDescription>
      </CardHeader>
      <ConstraintSetupForm />
    </Card>
  );
}
