// src/components/forms/LoanForm/LoanForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import {api} from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

const loanSchema = z.object({
  client_id: z.string().min(1, "Select a client"),
  loan_type: z.enum(["cash", "bike"]),
  amount: z.number().min(1000, "Minimum loan UGX 1,000").max(5000000),
  interest_rate: z.number().min(1).max(50),
  term_months: z.number().min(1).max(60),
  start_date: z.string().min(1, "Start date required"),
  purpose: z.string().optional(),
  bike_id: z.string().optional(),
  repayment_method: z.enum(["monthly", "weekly", "biweekly"]).optional(),
  notes: z.string().optional(),
}).refine((data) => data.loan_type !== "bike" || data.bike_id, {
  message: "Select a bike for bike loan",
  path: ["bike_id"],
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanFormProps {
  initialData?: Partial<LoanFormData>;
  onSubmit: (data: LoanFormData) => void;
  isLoading?: boolean;
}

export default function LoanForm({ initialData, onSubmit, isLoading }: LoanFormProps) {
  const [loanType, setLoanType] = useState<"cash" | "bike">(initialData?.loan_type || "cash");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get("/clients/").then(res => res.data.clients),
  });

  const { data: availableBikes = [] } = useQuery({
    queryKey: ["bikes", "available"],
    queryFn: () => api.get("/bikes/status/available").then(res => res.data.bikes),
    enabled: loanType === "bike",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      interest_rate: 15, // default rate
      repayment_method: "monthly",
      ...initialData,
    },
  });

  const watchedAmount = watch("amount");
  const watchedTerm = watch("term_months");
  const watchedRate = watch("interest_rate");

  const emi = watchedAmount && watchedTerm && watchedRate
    ? (watchedAmount * (watchedRate / 100 / 12) * Math.pow(1 + watchedRate / 100 / 12, watchedTerm)) /
      (Math.pow(1 + watchedRate / 100 / 12, watchedTerm) - 1)
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Loan Type Toggle */}
      <div className="flex gap-4 border-b pb-4">
        <Button
          type="button"
          variant={loanType === "cash" ? "primary" : "outline"}
          onClick={() => {
            setLoanType("cash");
            setValue("loan_type", "cash");
            setValue("bike_id", undefined);
          }}
        >
          Cash Loan
        </Button>
        <Button
          type="button"
          variant={loanType === "bike" ? "primary" : "outline"}
          onClick={() => {
            setLoanType("bike");
            setValue("loan_type", "bike");
          }}
        >
          Bike Loan
        </Button>
      </div>

      {/* Client Selection */}
      <Select label="Client" {...register("client_id")} error={errors.client_id?.message}>
        <option value="">Select Client</option>
        {clients.map((client: any) => (
          <option key={client.id} value={client.id}>
            {client.first_name} {client.last_name} ({client.phone})
          </option>
        ))}
      </Select>

      {/* Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Loan Amount (UGX)"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Input
          label="Interest Rate (%)"
          type="number"
          step="0.1"
          {...register("interest_rate", { valueAsNumber: true })}
          error={errors.interest_rate?.message}
        />
        <Input
          label="Term (Months)"
          type="number"
          {...register("term_months", { valueAsNumber: true })}
          error={errors.term_months?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" {...register("start_date")} error={errors.start_date?.message} />
        <Select label="Repayment Method" {...register("repayment_method")}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
        </Select>
      </div>

      {/* EMI Preview */}
      {emi > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Estimated Monthly Payment: <strong>UGX {emi.toFixed(2)}</strong>
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Total Payable: UGX {(emi * (watchedTerm || 0)).toFixed(2)}
          </p>
        </div>
      )}

      {/* Bike Selection (Only for Bike Loan) */}
      {loanType === "bike" && (
        <Select label="Select Bike" {...register("bike_id")} error={errors.bike_id?.message}>
          <option value="">Choose Available Bike</option>
          {availableBikes.map((bike: any) => (
            <option key={bike.id} value={bike.id}>
              {bike.make} {bike.model} ({bike.year}) - UGX {bike.purchase_price.toLocaleString()}
            </option>
          ))}
        </Select>
      )}

      {/* Purpose / Notes */}
      <Input label="Purpose of Loan" {...register("purpose")} placeholder="e.g., Business expansion, personal use" />
      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any special conditions or comments..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? "Update Loan" : "Create Loan Application"}
        </Button>
      </div>
    </form>
  );
}