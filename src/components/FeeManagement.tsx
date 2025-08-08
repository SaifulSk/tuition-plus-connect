import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Send,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeeRecord {
  id: string;
  student_id: string;
  student_name?: string;
  month: string;
  amount_due: number;
  amount_paid: number;
  payment_date: string | null;
  status: "paid" | "pending" | "overdue";
  payment_method: string | null;
}

export const FeeManagement = () => {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidStudents: 0,
    pendingStudents: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFeeRecords();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFeeRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch student names and merge with fee records
      const recordsWithNames = (data || []).map((record) => {
        const student = students.find(s => s.id === record.student_id);
        return {
          ...record,
          student_name: student?.name || 'Unknown Student',
          status: record.status as "paid" | "pending" | "overdue"
        };
      });

      setFeeRecords(recordsWithNames);
      calculateSummary(recordsWithNames);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch fee records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (records: FeeRecord[]) => {
    const totalRevenue = records
      .filter(r => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.amount_paid), 0);
    
    const pendingAmount = records
      .filter(r => r.status === "pending")
      .reduce((sum, r) => sum + (Number(r.amount_due) - Number(r.amount_paid)), 0);
    
    const paidStudents = records.filter(r => r.status === "paid").length;
    const pendingStudents = records.filter(r => r.status === "pending").length;

    setSummary({ totalRevenue, pendingAmount, paidStudents, pendingStudents });
  };

  const markAsPaid = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('fees')
        .update({
          status: 'paid',
          amount_paid: feeRecords.find(r => r.id === recordId)?.amount_due || 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Cash'
        })
        .eq('id', recordId);

      if (error) throw error;

      // Refresh the records
      fetchFeeRecords();
      
      toast({
        title: "Success",
        description: "Payment marked as paid",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeeRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('fees')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setFeeRecords(feeRecords.filter(r => r.id !== recordId));
      
      toast({
        title: "Success",
        description: "Fee record deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee record",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-muted-foreground">Track payments and manage student fees</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-gradient-primary">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{summary.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Students
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paidStudents}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Students
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingStudents}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="paid">Paid ({summary.paidStudents})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({summary.pendingStudents})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Fee Records</CardTitle>
              <CardDescription>Complete payment history and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading fee records...
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.student_name}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>₹{Number(record.amount_due).toLocaleString()}</TableCell>
                        <TableCell>₹{Number(record.amount_paid).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <Badge variant={getStatusVariant(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{record.payment_date || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {record.status === "pending" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAsPaid(record.id)}
                              >
                                Mark Paid
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Fee Record</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this fee record for {record.student_name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteFeeRecord(record.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords.filter(r => r.status === "paid").map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{Number(record.amount_paid).toLocaleString()}</TableCell>
                      <TableCell>{record.payment_date}</TableCell>
                      <TableCell>{record.payment_method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords.filter(r => r.status === "pending").map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{Number(record.amount_due).toLocaleString()}</TableCell>
                      <TableCell className="text-red-500">30+ days</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => markAsPaid(record.id)}
                        >
                          Mark Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};