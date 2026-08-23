import { motion } from "framer-motion";
import { Check, Building2, Briefcase, Users2 } from "lucide-react";
import type { AccountType } from "@/lib/accountTypes";
import type { AccountRole } from "@/contexts/SimpleAuthContext";

const ICONS: Record<AccountRole, typeof Users2> = {
  recruiter: Users2,
  company: Building2,
  jobseeker: Briefcase,
  admin: Building2,
};

interface AccountTypeCardProps {
  accountType: AccountType;
  selected: boolean;
  onSelect: (id: AccountRole) => void;
}

const AccountTypeCard = ({ accountType, selected, onSelect }: AccountTypeCardProps) => {
  const Icon = ICONS[accountType.id];

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(accountType.id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected
          ? "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-500/10"
          : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
          selected ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-500"
        }`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${selected ? "text-cyan-900" : "text-slate-900"}`}>
          {accountType.title}
        </p>
        {accountType.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{accountType.description}</p>
        )}
      </div>

      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          selected ? "border-cyan-500 bg-cyan-500" : "border-slate-300 bg-white"
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </div>
    </motion.button>
  );
};

export default AccountTypeCard;
