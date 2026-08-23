import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { accountTypes } from "@/lib/accountTypes";
import type { AccountRole } from "@/contexts/SimpleAuthContext";
import AccountTypeCard from "./AccountTypeCard";

interface AccountTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (accountType: AccountRole) => void;
}

const AccountTypeSelector = ({ open, onOpenChange, onContinue }: AccountTypeSelectorProps) => {
  const [selected, setSelected] = useState<AccountRole | null>(null);
  const [showError, setShowError] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Closing without completing selection must not leave stale state behind.
      setSelected(null);
      setShowError(false);
    }
    onOpenChange(nextOpen);
  };

  const handleContinue = () => {
    if (!selected) {
      setShowError(true);
      return;
    }
    onContinue(selected);
    setSelected(null);
    setShowError(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What type of account are you creating?</DialogTitle>
          <DialogDescription>
            Choose the option that best describes you. You can review your details on the next step.
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="Account type" className="space-y-3 py-1">
          {accountTypes
            .filter((type) => type.enabled)
            .map((type) => (
              <AccountTypeCard
                key={type.id}
                accountType={type}
                selected={selected === type.id}
                onSelect={(id) => {
                  setSelected(id);
                  setShowError(false);
                }}
              />
            ))}
        </div>

        {showError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Please select an account type to continue.
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 sm:w-auto"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountTypeSelector;
