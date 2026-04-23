import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function WhatsAppReminderSettings({ open, onOpenChange }: Props) {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [number, setNumber] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (profile) {
      setNumber(profile.whatsapp_number ?? '');
      setEnabled(profile.whatsapp_reminders_enabled ?? true);
    }
  }, [profile, open]);

  const numberValid = number === '' || E164_REGEX.test(number.trim());

  const handleSave = async () => {
    const trimmed = number.trim();
    if (trimmed && !E164_REGEX.test(trimmed)) {
      toast({
        title: 'Invalid phone number',
        description: 'Use international format, e.g. +34612345678.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateProfile.mutateAsync({
        whatsapp_number: trimmed === '' ? null : trimmed,
        whatsapp_reminders_enabled: enabled,
      });
      toast({ title: 'WhatsApp settings saved' });
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Failed to save', description: msg, variant: 'destructive' });
    }
  };

  const handleTest = async () => {
    const trimmed = number.trim();
    if (!trimmed || !E164_REGEX.test(trimmed)) {
      toast({
        title: 'Add a valid number first',
        description: 'Use international format, e.g. +34612345678.',
        variant: 'destructive',
      });
      return;
    }
    setTesting(true);
    try {
      // Save first so the function reads the current number from profile
      await updateProfile.mutateAsync({
        whatsapp_number: trimmed,
        whatsapp_reminders_enabled: enabled,
      });
      const { data, error } = await supabase.functions.invoke('send-daily-agenda', {
        body: { mode: 'test' },
      });
      if (error) throw error;
      const sent = (data as { sent?: boolean })?.sent;
      if (sent) {
        toast({ title: 'Test message sent', description: 'Check your WhatsApp.' });
      } else {
        toast({
          title: 'Send failed',
          description: (data as { response?: string })?.response ?? 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Test failed', description: msg, variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>WhatsApp Reminders</DialogTitle>
          <DialogDescription>
            Get a daily WhatsApp summary of your agenda at 12:30 UTC.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">WhatsApp number</Label>
              <Input
                id="whatsapp-number"
                placeholder="+34612345678"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">
                International format including country code. Leave empty to disable.
              </p>
              {!numberValid && (
                <p className="text-xs text-destructive">
                  Invalid format. Example: +34612345678
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="reminders-enabled">Daily reminder</Label>
                <p className="text-xs text-muted-foreground">
                  Sent every day at 12:30 UTC.
                </p>
              </div>
              <Switch
                id="reminders-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing || !number.trim()}
                className="gap-2"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send test message
              </Button>
              <div className="flex gap-2 sm:justify-end">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}