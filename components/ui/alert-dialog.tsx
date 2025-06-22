import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: "info" | "danger";
  children?: ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  title = "Aviso",
  description,
  confirmText = "OK",
  cancelText = "Cancelar",
  onConfirm,
  variant = "info",
  children,
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1C1C1C] border-[#2C2C2C] text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#2A2B2A] text-white hover:bg-[#3A3B3A] border-[#555]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              variant === "danger"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#BBF717] text-black hover:bg-[#9FD615]"
            }
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
