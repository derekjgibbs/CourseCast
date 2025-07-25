import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ConstraintsTableProps {
  name: string;
  tokenBudget: bigint;
  minCredits: number;
  maxCredits: number;
}

export function ConstraintsTable({
  name,
  tokenBudget,
  minCredits,
  maxCredits,
}: ConstraintsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Constraints</CardTitle>
        <CardDescription>Configuration parameters for the simulation run</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Scenario Name</TableCell>
              <TableCell>{name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Token Budget</TableCell>
              <TableCell className="font-mono">{tokenBudget.toString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Credit Range</TableCell>
              <TableCell>
                <span className="font-mono">
                  {minCredits.toFixed(1)} - {maxCredits.toFixed(1)} credits
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
