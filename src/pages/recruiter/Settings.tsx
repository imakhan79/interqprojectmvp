import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRecruiter } from '@/contexts/RecruiterContext';
import { Settings } from '@/types/recruiter';

const mockUserData = {
  name: "John Smith",
  email: "john.smith@company.com",
  role: "Senior TAP",
  department: "Talent Acquisition",
  teamSize: "5",
};

const Settings = () => {
  const { state, dispatch } = useRecruiter();
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    companyName: '',
    notifications: true,
    defaultTimeZone: 'America/New_York',
    interviewReminderDays: '2',
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUserData({
      name: mockUserData.name,
      email: mockUserData.email,
      companyName: state.companyName || 'Acme Corporation',
      notifications: state.notifications !== false,
      defaultTimeZone: state.defaultTimeZone || 'America/New_York',
      interviewReminderDays: state.interviewReminderDays?.toString() || '2',
    });
  }, [state]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    dispatch({
      type: 'UPDATE_SETTINGS' as any,
      payload: {
        companyName: userData.companyName,
        notifications: userData.notifications,
        defaultTimeZone: userData.defaultTimeZone,
        interviewReminderDays: parseInt(userData.interviewReminderDays),
      },
    });
    
    setSaving(false);
    setEditMode(false);
    toast({ title: 'Settings Saved', description: 'Your preferences have been updated' });
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback>JSM</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{mockUserData.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{mockUserData.role}</Badge>
                <Badge variant="secondary">{mockUserData.department}</Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => setEditMode(!editMode)} variant={editMode ? "outline" : "default"}>
            {editMode ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={userData.companyName}
              onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
              disabled={!editMode}
            />
          </div>
          <div className="space-y-2">
            <Label>Email Notifications</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={userData.notifications}
                onCheckedChange={(checked) => setUserData({ ...userData, notifications: checked })}
                disabled={!editMode}
              />
              <span className="text-sm text-muted-foreground">
                Receive email notifications for interview scheduling and responses
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Time Zone</Label>
            <Select 
              value={userData.defaultTimeZone} 
              onValueChange={(value) => setUserData({ ...userData, defaultTimeZone: value })}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">EST (New York)</SelectItem>
                <SelectItem value="America/Los_Angeles">PST (Los Angeles)</SelectItem>
                <SelectItem value="America/Chicago">CST (Chicago)</SelectItem>
                <SelectItem value="Europe/London">GMT (London)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interview Reminder (Days)</Label>
              <Select 
                value={userData.interviewReminderDays} 
                onValueChange={(value) => setUserData({ ...userData, interviewReminderDays: value })}
                disabled={!editMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team Size</Label>
              <Input 
                value={mockUserData.teamSize}
                disabled 
                className="bg-muted/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      {editMode && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="gap-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-8">
        Settings are automatically saved to localStorage and persist across sessions.
      </div>
    </div>
  );
};

export default Settings;

