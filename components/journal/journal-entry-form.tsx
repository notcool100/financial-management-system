"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  reference: z.string().min(2, {
    message: "Reference must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  entries: z
    .array(
      z.object({
        account: z.string({
          required_error: "Account is required.",
        }),
        debit: z.string().optional(),
        credit: z.string().optional(),
      }),
    )
    .refine(
      (entries) => {
        // Check if at least one entry has a debit or credit value
        return entries.some((entry) => entry.debit || entry.credit)
      },
      {
        message: "At least one entry must have a debit or credit value.",
      },
    )
    .refine(
      (entries) => {
        // Calculate total debits and credits
        const totalDebits = entries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0)
        const totalCredits = entries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0)

        // Check if debits equal credits
        return Math.abs(totalDebits - totalCredits) < 0.01 // Allow for small floating point differences
      },
      {
        message: "Total debits must equal total credits.",
      },
    ),
})

const accountOptions = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "accounts-receivable", label: "Accounts Receivable" },
  { value: "inventory", label: "Inventory" },
  { value: "accounts-payable", label: "Accounts Payable" },
  { value: "loans", label: "Loans" },
  { value: "sales", label: "Sales" },
  { value: "purchases", label: "Purchases" },
  { value: "expenses", label: "Expenses" },
  { value: "capital", label: "Capital" },
]

export function JournalEntryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      reference: "",
      description: "",
      entries: [
        { account: "", debit: "", credit: "" },
        { account: "", debit: "", credit: "" },
      ],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsSubmitting(false)
      form.reset()
    }, 1500)
  }

  const addEntry = () => {
    const entries = form.getValues("entries")
    form.setValue("entries", [...entries, { account: "", debit: "", credit: "" }])
  }

  const removeEntry = (index: number) => {
    const entries = form.getValues("entries")
    if (entries.length > 2) {
      form.setValue(
        "entries",
        entries.filter((_, i) => i !== index),
      )
    }
  }

  // Calculate totals
  const entries = form.watch("entries")
  const totalDebit = entries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0)
  const totalCredit = entries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference No.</FormLabel>
                <FormControl>
                  <Input placeholder="JE-2023-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter transaction description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Journal Entries</h3>
            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-t-md">
              <div className="col-span-5 font-medium text-sm text-slate-500 dark:text-slate-400">Account</div>
              <div className="col-span-3 font-medium text-sm text-slate-500 dark:text-slate-400">Debit</div>
              <div className="col-span-3 font-medium text-sm text-slate-500 dark:text-slate-400">Credit</div>
              <div className="col-span-1 font-medium text-sm text-slate-500 dark:text-slate-400"></div>
            </div>

            <div className="divide-y">
              {entries.map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`entries.${index}.account`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accountOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`entries.${index}.debit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                // Clear credit when debit is entered
                                if (e.target.value) {
                                  form.setValue(`entries.${index}.credit`, "")
                                }
                                field.onChange(e)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`entries.${index}.credit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                // Clear debit when credit is entered
                                if (e.target.value) {
                                  form.setValue(`entries.${index}.debit`, "")
                                }
                                field.onChange(e)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                      disabled={entries.length <= 2}
                    >
                      <Trash className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-b-md">
              <div className="col-span-5 font-medium text-sm text-slate-500 dark:text-slate-400">Total</div>
              <div className="col-span-3 font-medium">
                ₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="col-span-3 font-medium">
                ₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
            <div className="text-red-500 text-sm">
              Debits and credits are not balanced. Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Journal Entry"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
