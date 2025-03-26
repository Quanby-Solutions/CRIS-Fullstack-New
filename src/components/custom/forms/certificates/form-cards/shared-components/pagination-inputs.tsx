"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function PaginationInputs() {
  const { control, getValues } = useFormContext();

  // Log current form values (optional for debugging)
  // console.log('PaginationInputs current values:', getValues('pagination'))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pagination Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormField
              control={control}
              name="pagination.pageNumber"
              defaultValue={getValues("pagination.pageNumber") || ""}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter page number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={control}
              name="pagination.bookNumber"
              defaultValue={getValues("pagination.bookNumber") || ""}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter book number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaginationInputs;
