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
  Send
} from "lucide-react";
import feesData from "@/data/fees.json";

interface FeeRecord {
  student_id: string;
  student_name: string;
  month: string;
  amount_due: number;
  amount_paid: number;
  payment_date: string | null;
  status: "Paid" | "Pending" | "Overdue";
  payment_method: string | null;
}

export const FeeManagement = () => {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidStudents: 0,
    pendingStudents: 0
  });

  useEffect(() => {
    const records = feesData.fee_records as FeeRecord[];
    setFeeRecords(records);
    calculateSummary(records);
  }, []);

  const calculateSummary = (records: FeeRecord[]) => {
    const totalRevenue = records
      .filter(r => r.status === "Paid")
      .reduce((sum, r) => sum + r.amount_paid, 0);
    
    const pendingAmount = records
      .filter(r => r.status === "Pending")
      .reduce((sum, r) => sum + (r.amount_due - r.amount_paid), 0);
    
    const paidStudents = records.filter(r => r.status === "Paid").length;
    const pendingStudents = records.filter(r => r.status === "Pending").length;

    setSummary({ totalRevenue, pendingAmount, paidStudents, pendingStudents });
  };

  const markAsPaid = (studentId: string, month: string) => {
    const updatedRecords = feeRecords.map(record => {
      if (record.student_id === studentId && record.month === month) {
        return {
          ...record,
          status: "Paid" as const,
          amount_paid: record.amount_due,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: "Cash"
        };
      }
      return record;
    });
    
    setFeeRecords(updatedRecords);
    calculateSummary(updatedRecords);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Pending":
        return "secondary";
      case "Overdue":
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
                  {feeRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.student_name}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{record.amount_due}</TableCell>
                      <TableCell>₹{record.amount_paid}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <Badge variant={getStatusVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{record.payment_date || "-"}</TableCell>
                      <TableCell>
                        {record.status === "Pending" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsPaid(record.student_id, record.month)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {feeRecords.filter(r => r.status === "Paid").map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{record.amount_paid}</TableCell>
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
                  {feeRecords.filter(r => r.status === "Pending").map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{record.amount_due}</TableCell>
                      <TableCell className="text-red-500">30+ days</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => markAsPaid(record.student_id, record.month)}
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