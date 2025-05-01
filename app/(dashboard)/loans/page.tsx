"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanManagementTable } from "@/components/loans/loan-management-table"
import { CreditCard, Plus, TrendingDown, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { formatNepaliCurrency } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LoanSummary {
  flat: {
    active_count: number
    total_amount: number
    avg_interest_rate: number
  }
  diminishing: {
    active_count: number
    total_amount: number
    avg_interest_rate: number
  }
}

export default function LoansPage() {
  const [addLoanOpen, setAddLoanOpen] = useState(false)
  const [summary, setSummary] = useState<LoanSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add the Authorization header to the request
        const token = localStorage.getItem('token');
        const response = await fetch('/api/loans/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.summary) {
          setSummary(data.summary);
        } else {
          console.warn('No loan summary data available:', data.message);
          
          // Create empty summary data instead of showing an error
          setSummary({
            flat: {
              active_count: 0,
              total_amount: 0,
              avg_interest_rate: 0
            },
            diminishing: {
              active_count: 0,
              total_amount: 0,
              avg_interest_rate: 0
            }
          });
          
          // Only set error if there's a specific message
          if (data.message && data.message !== 'No loan summary data available') {
            setError(data.message);
          }
        }
      } catch (err: any) {
        console.error('Error fetching loan summary:', err);
        setError('Failed to load loan summary data. Please try again later.');
        
        // Create empty summary data
        setSummary({
          flat: {
            active_count: 0,
            total_amount: 0,
            avg_interest_rate: 0
          },
          diminishing: {
            active_count: 0,
            total_amount: 0,
            avg_interest_rate: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Loan Management</h1>
          <p className="text-muted-foreground">Manage flat and diminishing loans</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddLoanOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Loan
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : error ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Flat Rate Loans</CardTitle>
                <CardDescription>Fixed interest rate throughout the loan term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-24 text-slate-500">
                  No data available
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Diminishing Rate Loans</CardTitle>
                <CardDescription>Interest calculated on outstanding principal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-24 text-slate-500">
                  No data available
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <LoanTypeCard
              title="Flat Rate Loans"
              description="Fixed interest rate throughout the loan term"
              icon={CreditCard}
              activeLoans={summary?.flat.active_count || 0}
              totalAmount={formatNepaliCurrency(summary?.flat.total_amount || 0)}
              interestRate={`${(summary?.flat.avg_interest_rate || 0).toFixed(2)}%`}
              color="emerald"
            />
            <LoanTypeCard
              title="Diminishing Rate Loans"
              description="Interest calculated on outstanding principal"
              icon={TrendingDown}
              activeLoans={summary?.diminishing.active_count || 0}
              totalAmount={formatNepaliCurrency(summary?.diminishing.total_amount || 0)}
              interestRate={`${(summary?.diminishing.avg_interest_rate || 0).toFixed(2)}%`}
              color="sky"
            />
          </>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="flat">Flat Loans</TabsTrigger>
          <TabsTrigger value="diminishing">Diminishing Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <LoanManagementTable addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
        <TabsContent value="flat">
          <LoanManagementTable loanType="flat" addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
        <TabsContent value="diminishing">
          <LoanManagementTable loanType="diminishing" addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoanTypeCard({
  title,
  description,
  icon: Icon,
  activeLoans,
  totalAmount,
  interestRate,
  color,
}: {
  title: string
  description: string
  icon: React.ElementType
  activeLoans: number
  totalAmount: string
  interestRate: string
  color: "emerald" | "sky"
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className={`rounded-full p-2 bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active Loans</span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeLoans}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Amount</span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalAmount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Interest Rate</span>
            <p className={`text-xl font-bold text-${color}-600 dark:text-${color}-400`}>{interestRate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
