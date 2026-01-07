import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Club } from '@/types/database';
import { getTaskAutoStatus, getTasksSummary, TaskAutoStatus } from '@/utils/taskAutoCheck';
import { Progress } from '@/components/ui/progress';

interface ClubTasksTabProps {
  clubId: string;
  club: Club;
}

export function ClubTasksTab({ clubId, club }: ClubTasksTabProps) {
  const { data: tasks, isLoading } = useTasks(clubId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    due_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({
      club_id: clubId,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      due_date: formData.due_date || null,
    });
    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
    setShowForm(false);
  };

  const toggleComplete = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({
      id: taskId,
      status: newStatus,
      completed_date: newStatus === 'completed' ? new Date().toISOString() : null,
    });
  };

  const pendingTasks = tasks?.filter(t => t.status !== 'completed') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  // Calculate summary
  const summary = tasks ? getTasksSummary(tasks, club) : null;
  const progressPercent = summary ? (summary.completed / summary.total) * 100 : 0;

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {summary && summary.total > 0 && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{summary.completed}/{summary.total} complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Tasks</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 space-y-3">
          <Input 
            placeholder="Task title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea 
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createTask.isPending}>
              {createTask.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      {!tasks?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks yet. Add a follow-up task!
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  club={club}
                  onToggle={() => toggleComplete(task.id, task.status || 'pending')}
                />
              ))}
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Completed ({completedTasks.length})
              </p>
              {completedTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  club={club}
                  onToggle={() => toggleComplete(task.id, task.status || 'pending')}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
    status?: string | null;
    due_date?: string | null;
  };
  club: Club;
  onToggle: () => void;
}

function TaskItem({ task, club, onToggle }: TaskItemProps) {
  const [showMissing, setShowMissing] = useState(false);
  const isManuallyCompleted = task.status === 'completed';
  const autoStatus = getTaskAutoStatus(task.title, club);
  const isComplete = isManuallyCompleted || autoStatus.isAutoComplete;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isComplete;

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 bg-card rounded-lg border',
      isComplete && 'opacity-60'
    )}>
      <Checkbox 
        checked={isComplete}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-medium', isComplete && 'line-through')}>
            {task.title}
          </p>
          {autoStatus.isAutoComplete && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-success/10 text-success">
              <Check className="w-3 h-3" />
              Auto
            </span>
          )}
          {!isComplete && autoStatus.missingFields && (
            <button
              onClick={() => setShowMissing(!showMissing)}
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
            >
              <AlertCircle className="w-3 h-3" />
              Missing
              {showMissing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
        )}

        {/* Show missing fields when expanded */}
        {showMissing && autoStatus.missingFields && (
          <div className="mt-2 p-2 bg-warning/5 rounded border border-warning/20">
            <p className="text-xs font-medium text-warning mb-1">Missing fields:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {autoStatus.missingFields.map((field, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-warning" />
                  {field}
                </li>
              ))}
            </ul>
            {autoStatus.completedFields && autoStatus.completedFields.length > 0 && (
              <>
                <p className="text-xs font-medium text-success mt-2 mb-1">Completed:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {autoStatus.completedFields.map((field, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-success" />
                      {field}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2">
          {task.priority && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              task.priority === 'high' && 'bg-destructive/10 text-destructive',
              task.priority === 'medium' && 'bg-warning/10 text-warning',
              task.priority === 'low' && 'bg-success/10 text-success',
            )}>
              {task.priority}
            </span>
          )}
          {task.due_date && (
            <span className={cn(
              'text-xs flex items-center gap-1',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
