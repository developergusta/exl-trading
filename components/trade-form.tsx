"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrades } from "@/hooks/use-trades";
import { useState } from "react";

export function TradeForm() {
  const [date, setDate] = useState("");
  const [pl, setPl] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { addTrade } = useTrades();

  const handleSubmit = async () => {
    if (!date || pl === "") {
      setAlertMessage("Insira a data e o P&L.");
      setAlertOpen(true);
      return;
    }

    await addTrade({
      date,
      pl,
    });

    // Reset form
    setDate("");
    setPl("");

    setAlertMessage("Salvo com sucesso!");
    setAlertOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#1C1C1C] p-5 rounded-lg">
      <h2 className="text-2xl font-bold text-[#BBF717] mb-5">
        Inserir Operação
      </h2>

      <div className="space-y-4">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 text-white"
        />

        <Input
          type="number"
          placeholder="Resultado líquido do dia (ex: 350 ou -120)"
          value={pl}
          onChange={(e) => setPl(e.target.value)}
          className="w-full p-2 text-white"
        />

        <Button
          onClick={handleSubmit}
          className="w-full bg-[#BBF717] text-[#0E0E0E] hover:bg-[#9FD615] font-bold text-lg py-3 mt-4"
        >
          Salvar
        </Button>
      </div>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={alertMessage}
      />
    </div>
  );
}
