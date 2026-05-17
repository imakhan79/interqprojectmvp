import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Eye, 
  Mail, 
  Calendar, 
  ArrowRight, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger as DialogTriggerComp, DialogContent as DialogContentComp, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRecruiter } from '@/contexts/RecruiterContext';
import { Candidate } from '@/types/recruiter';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '@/services/candidateService';

const stages = ['Applied', 'Screened', 'Interviewed', 'Offered', 'Hired', 'Rejected'];

interface CandidateActionsDropdownProps {
  candidate: Candidate;
}

const CandidateActionsDropdown: React.FC<CandidateActionsDropdownProps> = ({ candidate }) => {
  const { state, dispatch } = useRecruiter();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // States for modals
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Loading states
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Form states
  const [emailForm, setEmailForm] = useState({
    to: candidate.email || '',
    subject: '',
    message: ''
  });
  
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Zoom' as 'Zoom' | 'Google Meet' | 'Onsite'
  });
  
  // Handle sending email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    try {
      const response = await candidateService.sendEmail(emailForm);
      toast({
        title: 'Email sent',
        description: `Email sent to ${candidate.name}`
      });
      setShowEmailModal(false);
      // Reset form
      setEmailForm({
        to: candidate.email || '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error sending email',
        description: error.response?.data?.message || 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Handle scheduling interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSchedulingInterview(true);
    try {
      const response = await candidateService.scheduleInterview({
        candidateId: candidate.id.toString(),
        date: interviewForm.date,
        time: interviewForm.time,
        type: interviewForm.type
      });
      toast({
        title: 'Interview scheduled',
        description: `Interview scheduled for ${candidate.name}`
      });
      setShowInterviewModal(false);
      // Reset form
      setInterviewForm({
        date: '',
        time: '',
        type: 'Zoom'
      });
    } catch (error: any) {
      toast({
        title: 'Error scheduling interview',
        description: error.response?.data?.message || 'Failed to schedule interview',
        variant: 'destructive'
      });
    } finally {
      setIsSchedulingInterview(false);
    }
  };
  
  // Handle moving to next stage
  const handleMoveToNextStage = () => {
    const currentStageIndex = stages.indexOf(candidate.stage);
    if (currentStageIndex < stages.length - 1 && stages[currentStageIndex + 1] !== 'Rejected') {
      const nextStage = stages[currentStageIndex + 1];
      dispatch({ 
        type: 'UPDATE_CANDIDATE' as any, 
        payload: { ...candidate, stage: nextStage } 
      });
      toast({
        title: 'Stage updated',
        description: `${candidate.name} moved to ${nextStage}`
      });
    }
  };
  
  // Handle rejecting candidate
  const handleRejectCandidate = () => {
    dispatch({ 
      type: 'UPDATE_CANDIDATE' as any, 
      payload: { ...candidate, stage: 'Rejected' } 
    });
    toast({
      title: 'Candidate rejected',
      description: `${candidate.name} has been rejected`
    });
    setShowRejectModal(false);
  };
  
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="p-1">
            <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 right-[-2px] mt-2">
           <DropdownMenuItem onClick={() => navigate(`/candidate/${candidate.id}`)}>
             <Eye className="mr-2 h-4 w-4" />
             View Profile
           </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowInterviewModal(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleMoveToNextStage}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Move to Next Stage
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRejectModal(true)} className="text-destructive">
            <X className="mr-2 h-4 w-4" />
            Reject Candidate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogOverlay />
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email to {candidate.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Compose and send an email to the candidate
          </DialogDescription>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <Input
                type="email"
                value={emailForm.to}
                onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Enter email subject"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Message</label>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                placeholder="Type your message here..."
                className="h-32"
                required
              />
            </div>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit">Send Email</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Interview Modal */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogOverlay />
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview for {candidate.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Select date, time, and interview type
          </DialogDescription>
          <form onSubmit={handleScheduleInterview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <Input
                  type="time"
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Interview Type</label>
              <Select value={interviewForm.type} onValueChange={(value) => setInterviewForm({ ...interviewForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit">Schedule Interview</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogOverlay />
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to reject {candidate.name}? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="button" variant="destructive" onClick={handleRejectCandidate}>
              Reject Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateActionsDropdown;