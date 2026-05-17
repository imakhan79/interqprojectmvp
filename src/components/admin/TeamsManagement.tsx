
import React, { useState, useMemo, useCallback } from 'react'
import { useUserTeams } from '@/contexts/UserTeamsContext'
import { Team, User } from '@/types/userTeams'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Plus, Edit3, Trash2, Users, UserPlus, UserMinus, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const departments = [
  'Engineering',
  'HR',
  'Sales',
  'Marketing',
  'Design',
  'Operations',
  'Executive'
] as const

type TeamFormData = {
  name: string
  description: string
  department: typeof departments[number]
  type: Team['type']
  leadId: string
}

const teamTypes = [
  'hiring',
  'technical',
  'hr',
  'executive',
  'cross_functional'
] as const

const TeamsManagement: React.FC = () => {
  const { state, addTeam, updateTeam, deleteTeam, getTeamMembers } = useUserTeams()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    department: 'Engineering',
    type: 'hiring' as TeamFormData['type'],
    leadId: ''
  })
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])

  const filteredTeams = useMemo(() => {
    return state.teams
  }, [state.teams])

  const toggleTeamExpansion = useCallback((teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }, [])

  const toggleSelection = useCallback((teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }, [])

  const selectAll = useCallback(() => {
    if (selectedTeams.length === filteredTeams.length && filteredTeams.length > 0) {
      setSelectedTeams([])
    } else {
      setSelectedTeams(filteredTeams.map(t => t.id))
    }
  }, [selectedTeams.length, filteredTeams])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (editTeam) {
      updateTeam({
        ...editTeam,
        name: formData.name,
        description: formData.description,
        department: formData.department,
        type: formData.type,
        leadId: formData.leadId,
      })
    } else {
      addTeam({
        name: formData.name,
        description: formData.description,
        department: formData.department,
        type: formData.type,
        leadId: formData.leadId,
        memberIds: [],
        userCount: 0
      })
    }

    setShowAddDialog(false)
    setEditTeam(null)
    setFormData({
      name: '',
      description: '',
      department: 'Engineering',
      type: 'hiring',
      leadId: ''
    })
  }, [editTeam, formData, addTeam, updateTeam])

  const roleColors = {
    admin: 'bg-purple-500 text-white',
    recruiter: 'bg-green-500 text-white',
    hiring_manager: 'bg-orange-500 text-white',
    interviewer: 'bg-indigo-500 text-white',
    viewer: 'bg-gray-500 text-white'
  } as Record<string, string>

  const StatusIcon = ({ status }: { status: Team['type'] }) => {
    const icons = {
      hiring: <Users className="h-4 w-4" />,
      technical: <Users className="h-4 w-4" />,
      hr: <Users className="h-4 w-4" />,
      executive: <Users className="h-4 w-4" />,
      cross_functional: <Users className="h-4 w-4" />
    } as Record<Team['type'], React.ReactNode>
    
    return <>{icons[status]}</>
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {filteredTeams.length} teams</span>
          {selectedTeams.length > 0 && (
            <span>{selectedTeams.length} selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedTeams.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Members
              </Button>
              <Button variant="outline" size="sm">
                <UserMinus className="h-4 w-4 mr-1" />
                Remove Members
              </Button>
              <Button variant="destructive" size="sm">
                Delete ({selectedTeams.length})
              </Button>
            </div>
          )}
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teams ({filteredTeams.length})</CardTitle>
            <Button variant="outline" size="sm">
              Export Teams
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                    onCheckedChange={selectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[250px]">Team</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => {
                const members = getTeamMembers(team.id)
                const lead = state.users?.find((u: User) => u.id === team.leadId)
                const isExpanded = expandedTeams.includes(team.id)
                
                return (
                  <React.Fragment key={team.id}>
                    <TableRow className={cn(selectedTeams.includes(team.id) && "bg-muted/50")}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTeams.includes(team.id)}
                          onCheckedChange={() => toggleSelection(team.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-10 bg-primary rounded-full" />
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              roleColors[team.type] || 'bg-gray-500 text-white'
                            )}>
                              {team.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p>{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          <StatusIcon status={team.type} />
                          {team.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{team.department}</TableCell>
                      <TableCell>
                        {lead ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {lead.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.role}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No lead</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                            {members.length}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleTeamExpansion(team.id)}
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditTeam(team)
                              setFormData({
                                name: team.name,
                                description: team.description,
                                department: team.department,
                                type: team.type,
                                leadId: team.leadId
                              })
                              setShowAddDialog(true)
                            }}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Members
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Members
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteTeam(team.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t p-4 bg-muted/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {members.slice(0, 6).map((member: User) => (
                                <div key={member.id} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {member.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                    <Badge className="text-xs" variant="outline">
                                      {member.department}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {members.length > 6 && (
                                <div className="flex items-center justify-center p-3 text-muted-foreground text-sm">
                                  +{members.length - 6} more members
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
            <DialogDescription>
              Configure team details and leadership
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value as TeamFormData['department'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Team Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as TeamFormData['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadId">Team Lead</Label>
              <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  {state.users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                          {user.initials}
                        </div>
                        <div>
                          <span>{user.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({user.role})</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false)
                setEditTeam(null)
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editTeam ? 'Update Team' : 'Create Team'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeamsManagement

