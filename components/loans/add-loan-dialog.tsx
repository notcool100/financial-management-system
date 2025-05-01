"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, CreditCard, TrendingDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNepaliCurrency } from "@/lib/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Client {
  id: string
  name: string
  account_number: string
}

interface LoanType {
  id: string
  name: string
  interest_rate: number
  min_amount: number
  max_amount: number
  min_tenure_months: number
  max_tenure_months: number
  processing_fee_percent: number
}

interface LoanCalculation {
  emi_amount: number
  total_interest: number
  total_amount: number
  processing_fee: number
}

interface AddLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoanAdded: (loan: any) => void
}

export function AddLoanDialog({ open, onOpenChange, onLoanAdded }: AddLoanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculationType, setCalculationType] = useState<"flat" | "diminishing">("flat")
  const [clients, setClients] = useState<Client[]>([])
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  
  const [newLoan, setNewLoan] = useState({
    client_id: "",
    loan_type_id: "",
    calculation_type: "flat",
    amount: 100000,
    interest_rate: 13.5,
    tenure_months: 12,
    disburse_date: new Date().toISOString().split("T")[0],
    processing_fee: 0,
  })

  // Fetch clients and loan types when dialog opens
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchLoanTypes();
    }
  }, [open]);

  // Calculate loan details when relevant fields change
  useEffect(() => {
    if (newLoan.amount > 0 && newLoan.interest_rate > 0 && newLoan.tenure_months > 0) {
      calculateLoan();
    }
  }, [
    newLoan.amount, 
    newLoan.interest_rate, 
    newLoan.tenure_months, 
    newLoan.calculation_type
  ]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add the Authorization header to the request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Even if there are no clients, we still set the empty array
        setClients(data.clients || []);
        
        // Only show error if there are truly no clients
        if (!data.clients || data.clients.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            // Create mock clients in development mode
            const mockClients = [
              { id: "1", name: "Ram Sharma", account_number: "SB-1001" },
              { id: "2", name: "Sita Poudel", account_number: "SB-1002" }
            ];
            setClients(mockClients);
          } else {
            setError('No clients found. Please add clients before creating a loan.');
          }
        }
      } else {
        console.warn('No clients data available:', data.message);
        
        if (process.env.NODE_ENV === 'development') {
          // Create mock clients in development mode
          const mockClients = [
            { id: "1", name: "Ram Sharma", account_number: "SB-1001" },
            { id: "2", name: "Sita Poudel", account_number: "SB-1002" }
          ];
          setClients(mockClients);
        } else {
          setClients([]);
          
          // Only set error if there's a specific message
          if (data.message) {
            setError(data.message);
          } else {
            setError('No clients found. Please add clients before creating a loan.');
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      
      if (process.env.NODE_ENV === 'development') {
        // Create mock clients in development mode
        const mockClients = [
          { id: "1", name: "Ram Sharma", account_number: "SB-1001" },
          { id: "2", name: "Sita Poudel", account_number: "SB-1002" }
        ];
        setClients(mockClients);
      } else {
        setError('Failed to load clients. Please try again later.');
        setClients([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanTypes = async () => {
    try {
      // Add the Authorization header to the request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loans/types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.loanTypes && data.loanTypes.length > 0) {
        setLoanTypes(data.loanTypes);
        
        // Set default loan type
        const defaultLoanType = data.loanTypes[0];
        setNewLoan(prev => ({
          ...prev,
          loan_type_id: defaultLoanType.id,
          interest_rate: defaultLoanType.interest_rate,
          processing_fee: defaultLoanType.processing_fee_percent * prev.amount / 100
        }));
      } else {
        console.warn('No loan types data available:', data.message);
        setLoanTypes([]);
        
        // Create a default loan type if none exists
        if (process.env.NODE_ENV === 'development') {
          const mockLoanTypes = [
            {
              id: "1",
              name: "Personal Loan",
              interest_rate: 12.5,
              min_amount: 50000,
              max_amount: 1000000,
              min_tenure_months: 12,
              max_tenure_months: 60,
              processing_fee_percent: 1.5
            }
          ];
          
          setLoanTypes(mockLoanTypes);
          
          // Set default loan type
          const defaultLoanType = mockLoanTypes[0];
          setNewLoan(prev => ({
            ...prev,
            loan_type_id: defaultLoanType.id,
            interest_rate: defaultLoanType.interest_rate,
            processing_fee: defaultLoanType.processing_fee_percent * prev.amount / 100
          }));
        } else {
          setError('No loan types found. Please add loan types before creating a loan.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching loan types:', err);
      
      if (process.env.NODE_ENV === 'development') {
        // Create mock loan types in development mode
        const mockLoanTypes = [
          {
            id: "1",
            name: "Personal Loan",
            interest_rate: 12.5,
            min_amount: 50000,
            max_amount: 1000000,
            min_tenure_months: 12,
            max_tenure_months: 60,
            processing_fee_percent: 1.5
          }
        ];
        
        setLoanTypes(mockLoanTypes);
        
        // Set default loan type
        const defaultLoanType = mockLoanTypes[0];
        setNewLoan(prev => ({
          ...prev,
          loan_type_id: defaultLoanType.id,
          interest_rate: defaultLoanType.interest_rate,
          processing_fee: defaultLoanType.processing_fee_percent * prev.amount / 100
        }));
      } else {
        setError('Failed to load loan types. Please try again later.');
        setLoanTypes([]);
      }
    }
  };

  const calculateLoan = async () => {
    try {
      // Add the Authorization header to the request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loans/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: newLoan.amount,
          interest_rate: newLoan.interest_rate,
          tenure_months: newLoan.tenure_months,
          calculation_type: newLoan.calculation_type
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.calculation) {
        setCalculation(data.calculation);
      } else {
        console.warn('Error calculating loan:', data.message);
        
        // Fallback to client-side calculation if API fails
        calculateClientSide();
      }
    } catch (err: any) {
      console.error('Error calculating loan:', err);
      
      // Fallback to client-side calculation if API fails
      calculateClientSide();
    }
  };
  
  // Client-side loan calculation as fallback
  const calculateClientSide = () => {
    const principal = Number(newLoan.amount);
    const interestRate = Number(newLoan.interest_rate);
    const tenureMonths = Number(newLoan.tenure_months);
    const calculationType = newLoan.calculation_type;
    const monthlyInterestRate = interestRate / 100 / 12;
    let emiAmount = 0;
    let totalInterest = 0;
    
    if (calculationType === 'flat') {
      // Flat interest calculation
      totalInterest = principal * (interestRate / 100) * (tenureMonths / 12);
      emiAmount = (principal + totalInterest) / tenureMonths;
    } else {
      // Diminishing interest calculation (EMI formula)
      emiAmount = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths) / 
                 (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
      totalInterest = (emiAmount * tenureMonths) - principal;
    }
    
    // Find the selected loan type to get processing fee
    const selectedLoanType = loanTypes.find(lt => lt.id === newLoan.loan_type_id);
    const processingFeePercent = selectedLoanType?.processing_fee_percent || 1;
    const processingFee = principal * (processingFeePercent / 100);
    
    setCalculation({
      emi_amount: Math.round(emiAmount),
      total_interest: Math.round(totalInterest),
      total_amount: Math.round(principal + totalInterest),
      processing_fee: Math.round(processingFee)
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewLoan({ ...newLoan, [field]: value });

    if (field === "calculation_type") {
      setCalculationType(value as "flat" | "diminishing");
    }
    
    if (field === "loan_type_id") {
      const selectedLoanType = loanTypes.find(lt => lt.id === value);
      if (selectedLoanType) {
        setNewLoan(prev => ({
          ...prev,
          loan_type_id: value as string,
          interest_rate: selectedLoanType.interest_rate,
          processing_fee: selectedLoanType.processing_fee_percent * prev.amount / 100
        }));
      }
    }
    
    if (field === "amount") {
      const selectedLoanType = loanTypes.find(lt => lt.id === newLoan.loan_type_id);
      if (selectedLoanType) {
        setNewLoan(prev => ({
          ...prev,
          amount: value as number,
          processing_fee: selectedLoanType.processing_fee_percent * (value as number) / 100
        }));
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add the Authorization header to the request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLoan)
      });
      
      const data = await response.json();
      
      if (data.success && data.loan) {
        // Success - call the callback and close the dialog
        onLoanAdded(data.loan);
        resetForm();
        onOpenChange(false);
      } else {
        // API returned an error
        console.error('Error creating loan:', data.message);
        setError(data.message || 'Failed to create loan. Please try again.');
      }
    } catch (err: any) {
      console.error('Error creating loan:', err);
      setError('Failed to create loan. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Reset the form to its initial state
  const resetForm = () => {
    setNewLoan({
      client_id: "",
      loan_type_id: "",
      calculation_type: "flat",
      amount: 100000,
      interest_rate: 13.5,
      tenure_months: 12,
      disburse_date: new Date().toISOString().split("T")[0],
      processing_fee: 0,
    });
    setCalculationType("flat");
    setCalculation(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>Fill in the details to create a new loan.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={calculationType} onValueChange={(value) => handleInputChange("calculation_type", value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flat" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Flat Rate Loan
            </TabsTrigger>
            <TabsTrigger value="diminishing" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Diminishing Rate Loan
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client</Label>
                <Select 
                  value={newLoan.client_id} 
                  onValueChange={(value) => handleInputChange("client_id", value)}
                  disabled={loading || clients.length === 0}
                >
                  <SelectTrigger id="client_id">
                    <SelectValue placeholder={loading ? "Loading clients..." : "Select client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.account_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan_type_id">Loan Type</Label>
                <Select 
                  value={newLoan.loan_type_id} 
                  onValueChange={(value) => handleInputChange("loan_type_id", value)}
                  disabled={loading || loanTypes.length === 0}
                >
                  <SelectTrigger id="loan_type_id">
                    <SelectValue placeholder={loading ? "Loading loan types..." : "Select loan type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTypes.map(loanType => (
                      <SelectItem key={loanType.id} value={loanType.id}>
                        {loanType.name} ({loanType.interest_rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={newLoan.amount}
                  onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  placeholder="13.5"
                  value={newLoan.interest_rate}
                  onChange={(e) => handleInputChange("interest_rate", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure_months">Duration (months)</Label>
                <Input
                  id="tenure_months"
                  type="number"
                  min="1"
                  max="120"
                  value={newLoan.tenure_months}
                  onChange={(e) => handleInputChange("tenure_months", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disburse_date">Disburse Date</Label>
                <Input
                  id="disburse_date"
                  type="date"
                  value={newLoan.disburse_date}
                  onChange={(e) => handleInputChange("disburse_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processing_fee">Processing Fee</Label>
                <Input
                  id="processing_fee"
                  type="number"
                  step="0.01"
                  value={newLoan.processing_fee}
                  onChange={(e) => handleInputChange("processing_fee", Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {calculation && (
              <div className="mt-6 p-4 border rounded-md bg-slate-50 dark:bg-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Calculated EMI</h3>
                    <p className="text-xs text-muted-foreground">Monthly installment amount</p>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNepaliCurrency(calculation.emi_amount)}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Repayment</p>
                    <p className="text-sm font-medium">
                      {formatNepaliCurrency(calculation.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                    <p className="text-sm font-medium">
                      {formatNepaliCurrency(calculation.total_interest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Processing Fee</p>
                    <p className="text-sm font-medium">
                      {formatNepaliCurrency(calculation.processing_fee)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !newLoan.client_id || 
              !newLoan.loan_type_id || 
              newLoan.amount <= 0 || 
              newLoan.tenure_months <= 0
            }
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Loan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
