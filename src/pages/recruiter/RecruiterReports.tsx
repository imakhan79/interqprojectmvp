import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const radarData = [
  { skill: 'JavaScript', score: 88 },
  { skill: 'Node.js', score: 76 },
  { skill: 'SQL', score: 85 },
  { skill: 'Docker', score: 72 },
];

const barData = [
  { name: 'Week 1', score: 72 },
  { name: 'Week 2', score: 81 },
  { name: 'Week 3', score: 79 },
  { name: 'Week 4', score: 85 },
];

const mockEvaluations = [
  { overallScore: 88, criteria: { JavaScript: 90, SQL: 85 } },
  { overallScore: 72, criteria: { JavaScript: 70, Docker: 75 } },
  { overallScore: 65, criteria: { SQL: 60, NodeJs: 70 } },
  { overallScore: 91, criteria: { JavaScript: 95, Docker: 88 } },
];

const RecruiterReports = () => {
  const stats = useMemo(() => {
    const total = mockEvaluations.reduce((sum, e) => sum + e.overallScore, 0);
    const avgScore = total / mockEvaluations.length;
    const passed = mockEvaluations.filter((e) => e.overallScore >= 70).length;
    const passRate = (passed / mockEvaluations.length) * 100;
    const allSkills = mockEvaluations.flatMap((e) => Object.keys(e.criteria));
    const skillCounts = allSkills.reduce<Record<string, number>>((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([skill]) => skill);
    return { avgScore, passRate, totalCandidates: mockEvaluations.length, topSkills };
  }, []);

  const exportReport = () => {
    const dataStr = `Avg Score,${stats.avgScore.toFixed(1)}%\nPass Rate,${stats.passRate.toFixed(1)}%\nCandidates,${stats.totalCandidates}`;
    const dataUri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(dataStr);
    const a = document.createElement('a');
    a.setAttribute('href', dataUri);
    a.setAttribute('download', 'recruiter-report.csv');
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Evaluation Reports</h2>
          <p className="text-muted-foreground">Analytics and performance insights</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Average Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{stats.avgScore.toFixed(1)}%</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {stats.totalCandidates} candidates evaluated
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.passRate.toFixed(1)}%</div>
              <div className="flex flex-wrap gap-1">
                {stats.topSkills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skills Radar</CardTitle>
          </CardHeader>
          <CardContent className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterReports;
