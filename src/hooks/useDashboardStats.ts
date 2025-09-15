import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudentStats {
  pendingHomework: number;
  upcomingTests: number;
  averageScore: string;
  scheduledClasses: number;
}

interface TeacherStats {
  totalStudents: number;
  monthlyRevenue: string;
  pendingFees: string;
  activeClasses: number;
}

interface ParentStats {
  childAttendance: string;
  homeworkCompletion: string;
  averagePerformance: string;
  feeStatus: string;
}

export const useStudentDashboardStats = () => {
  const [stats, setStats] = useState<StudentStats>({
    pendingHomework: 0,
    upcomingTests: 0,
    averageScore: "0%",
    scheduledClasses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get student data
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!studentData) return;

        // Fetch pending homework
        const currentDate = new Date().toISOString().split('T')[0];
        const { data: homeworkData } = await supabase
          .from('homework_submissions')
          .select('*')
          .eq('student_id', studentData.id)
          .eq('status', 'pending');

        // Fetch upcoming tests
        const { data: testsData } = await supabase
          .from('tests')
          .select('*')
          .gte('test_date', currentDate);

        // Fetch test results for average score
        const { data: testResults } = await supabase
          .from('test_results')
          .select('marks_obtained, tests(max_marks)')
          .eq('student_id', studentData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        let averageScore = "0%";
        if (testResults && testResults.length > 0) {
          const validResults = testResults.filter(r => r.tests && r.tests.max_marks);
          if (validResults.length > 0) {
            const totalObtained = validResults.reduce((sum, r) => sum + r.marks_obtained, 0);
            const totalMax = validResults.reduce((sum, r) => sum + (r.tests?.max_marks || 0), 0);
            averageScore = totalMax > 0 ? `${Math.round((totalObtained / totalMax) * 100)}%` : "0%";
          }
        }

        // Fetch scheduled classes for this week
        const { data: scheduleData } = await supabase
          .from('class_schedules')
          .select('*');

        setStats({
          pendingHomework: homeworkData?.length || 0,
          upcomingTests: testsData?.length || 0,
          averageScore,
          scheduledClasses: scheduleData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching student stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};

export const useTeacherDashboardStats = () => {
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    monthlyRevenue: "₹0",
    pendingFees: "₹0",
    activeClasses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { data: studentsData } = await supabase
          .from('students')
          .select('id');

        // Fetch fee data for current month
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const monthKey = `${currentMonth} ${currentYear}`;

        const { data: feesData } = await supabase
          .from('fees')
          .select('*')
          .eq('month', monthKey);

        const monthlyRevenue = feesData
          ?.filter(f => f.status === 'paid')
          .reduce((sum, f) => sum + Number(f.amount_paid || 0), 0) || 0;

        const pendingFees = feesData
          ?.filter(f => f.status === 'pending')
          .reduce((sum, f) => sum + Number(f.amount_due), 0) || 0;

        // Fetch active classes
        const { data: classesData } = await supabase
          .from('class_schedules')
          .select('*');

        setStats({
          totalStudents: studentsData?.length || 0,
          monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
          pendingFees: `₹${pendingFees.toLocaleString()}`,
          activeClasses: classesData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};

export const useParentDashboardStats = () => {
  const [stats, setStats] = useState<ParentStats>({
    childAttendance: "0%",
    homeworkCompletion: "0/0",
    averagePerformance: "N/A",
    feeStatus: "Unknown"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get parent's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!profile) return;

        // Get children
        const { data: children } = await supabase
          .from('students')
          .select('id')
          .eq('parent_id', profile.id);

        if (!children || children.length === 0) return;

        const childId = children[0].id; // Using first child for demo

        // Fetch attendance for current month
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', childId)
          .gte('class_date', firstDay.toISOString().split('T')[0])
          .lte('class_date', lastDay.toISOString().split('T')[0]);

        const totalDays = attendanceData?.length || 0;
        const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0;
        const attendancePercentage = totalDays > 0 ? `${Math.round((presentDays / totalDays) * 100)}%` : "0%";

        // Fetch homework submissions for current week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: homeworkData } = await supabase
          .from('homework_submissions')
          .select('*, homework(*)')
          .eq('student_id', childId);

        const thisWeekSubmissions = homeworkData?.filter(h => 
          new Date(h.homework?.assigned_date) >= weekAgo
        ) || [];

        const completedCount = thisWeekSubmissions.filter(h => h.status === 'submitted').length;
        const totalCount = thisWeekSubmissions.length;

        // Fetch test results for average performance
        const { data: testResults } = await supabase
          .from('test_results')
          .select('marks_obtained, tests(max_marks)')
          .eq('student_id', childId)
          .order('created_at', { ascending: false })
          .limit(5);

        let averagePerformance = "N/A";
        if (testResults && testResults.length > 0) {
          const validResults = testResults.filter(r => r.tests && r.tests.max_marks);
          if (validResults.length > 0) {
            const totalObtained = validResults.reduce((sum, r) => sum + r.marks_obtained, 0);
            const totalMax = validResults.reduce((sum, r) => sum + (r.tests?.max_marks || 0), 0);
            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
            if (percentage >= 90) averagePerformance = "A+";
            else if (percentage >= 80) averagePerformance = "A";
            else if (percentage >= 70) averagePerformance = "B+";
            else if (percentage >= 60) averagePerformance = "B";
            else if (percentage >= 50) averagePerformance = "C";
            else averagePerformance = "D";
          }
        }

        // Fetch fee status for current month
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const monthKey = `${currentMonth} ${currentYear}`;

        const { data: feeData } = await supabase
          .from('fees')
          .select('*')
          .eq('student_id', childId)
          .eq('month', monthKey)
          .single();

        const feeStatus = feeData?.status === 'paid' ? 'Paid' : feeData?.status === 'pending' ? 'Pending' : 'Unknown';

        setStats({
          childAttendance: attendancePercentage,
          homeworkCompletion: `${completedCount}/${totalCount}`,
          averagePerformance,
          feeStatus
        });
      } catch (error) {
        console.error('Error fetching parent stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};