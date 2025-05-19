
import { useState } from 'react';
import { AlertTriangle, Pause, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

const MyAccount = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDeleteAccount = () => {
    // Here you would implement the actual account deletion logic
    toast({
      title: "Account deletion requested",
      description: "We have received your request to delete your account. This process may take up to 30 days to complete.",
    });
    setIsDeleteDialogOpen(false);
    // In a real implementation, you would call an API endpoint
  };

  const handlePauseAccount = () => {
    // Here you would implement the actual account pausing logic
    toast({
      title: "Account paused",
      description: "Your account has been paused. You can reactivate it at any time.",
    });
    setIsPauseDialogOpen(false);
    // In a real implementation, you would call an API endpoint
  };

  const handleSuspendAccount = () => {
    // Here you would implement the actual account suspension logic
    toast({
      title: "Account suspended",
      description: "Your account has been suspended. Contact support if you want to reactivate it.",
    });
    setIsSuspendDialogOpen(false);
    // In a real implementation, you would call an API endpoint
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View and manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Member since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>These actions are irreversible or have significant impacts on your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-md">
              <div>
                <h3 className="font-medium">Delete My Data</h3>
                <p className="text-sm text-gray-500">This will permanently delete all your data and account information.</p>
              </div>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="mt-2 sm:mt-0">
                Delete Data
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-md">
              <div>
                <h3 className="font-medium">Pause My Account</h3>
                <p className="text-sm text-gray-500">Temporarily disable your account. You can reactivate it anytime.</p>
              </div>
              <Button variant="outline" onClick={() => setIsPauseDialogOpen(true)} className="mt-2 sm:mt-0">
                Pause Account
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-md">
              <div>
                <h3 className="font-medium">Suspend My Account</h3>
                <p className="text-sm text-gray-500">Suspend your account and all its activities.</p>
              </div>
              <Button variant="outline" onClick={() => setIsSuspendDialogOpen(true)} className="mt-2 sm:mt-0">
                Suspend Account
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Need help? Contact us at <a href="mailto:info@eatmeetclub.com" className="text-brand-500 hover:underline">info@eatmeetclub.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              This will delete all your personal information, event history, tickets, and other data associated with your account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Account Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-amber-500" />
              Pause Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to pause your account?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              While your account is paused, you won't be able to access events or make reservations. You can reactivate your account at any time.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPauseDialogOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handlePauseAccount}>Pause Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Account Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-red-500" />
              Suspend Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend your account?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Suspending your account will deactivate all functionality and hide your profile. To reactivate, you'll need to contact customer support.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleSuspendAccount}>Suspend Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyAccount;
