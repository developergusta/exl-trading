"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Chart: any;
  }
}

export function MonteCarloSimulator() {
  const [initialCapital, setInitialCapital] = useState("10000");
  const [winRate, setWinRate] = useState("50");
  const [avgWin, setAvgWin] = useState("2");
  const [avgLoss, setAvgLoss] = useState("1");
  const [numTrades, setNumTrades] = useState("100");
  const [numSims, setNumSims] = useState("500");
  const [maxCurves, setMaxCurves] = useState("20");
  const [results, setResults] = useState<any>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const curvesChartRef = useRef<HTMLCanvasElement>(null);
  const histChartRef = useRef<HTMLCanvasElement>(null);
  const curvesChartInstance = useRef<any>(null);
  const histChartInstance = useRef<any>(null);

  useEffect(() => {
    // Load Chart.js
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => {
      // Chart.js loaded
    };
    document.head.appendChild(script);

    return () => {
      if (curvesChartInstance.current) {
        curvesChartInstance.current.destroy();
      }
      if (histChartInstance.current) {
        histChartInstance.current.destroy();
      }
    };
  }, []);

  const runMonteCarlo = () => {
    if (!window.Chart) {
      setAlertOpen(true);
      return;
    }

    const C0 = Number.parseFloat(initialCapital);
    const p = Number.parseFloat(winRate) / 100;
    const gw = Number.parseFloat(avgWin) / 100;
    const gl = Number.parseFloat(avgLoss) / 100;
    const T = Number.parseInt(numTrades);
    const N = Number.parseInt(numSims);
    const K = Number.parseInt(maxCurves);

    const finalCaps: number[] = [];
    const curveSamples: number[][] = [];
    let globalMaxDrawdown = 0;

    for (let s = 0; s < N; s++) {
      let cap = C0;
      const curve = [cap];
      let peak = cap;
      let maxDrawdown = 0;

      for (let t = 1; t <= T; t++) {
        cap = Math.random() < p ? cap * (1 + gw) : cap * (1 - gl);
        curve.push(cap);
        if (cap > peak) peak = cap;
        const dd = peak - cap;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }

      finalCaps.push(cap);
      if (s < K) curveSamples.push(curve);
      if (maxDrawdown > globalMaxDrawdown) globalMaxDrawdown = maxDrawdown;
    }

    const meanCap = finalCaps.reduce((a, b) => a + b, 0) / N;
    const sortedCaps = finalCaps.slice().sort((a, b) => a - b);
    const medianCap = sortedCaps[Math.floor(N / 2)];
    const worstCap = Math.min(...finalCaps);
    const bestCap = Math.max(...finalCaps);

    const meanPnl = meanCap - C0;
    const medianPnl = medianCap - C0;
    const worstPnl = worstCap - C0;
    const bestPnl = bestCap - C0;

    setResults({
      meanCap,
      meanPnl,
      medianCap,
      medianPnl,
      bestCap,
      bestPnl,
      worstCap,
      worstPnl,
      globalMaxDrawdown,
    });

    // Render curves chart
    const labels = Array.from({ length: T + 1 }, (_, i) => i);
    const datasetsCurves = curveSamples.map((curve, i) => ({
      label: `Sim ${i + 1}`,
      data: curve,
      borderColor: "#BBF717",
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
    }));

    if (curvesChartInstance.current) {
      curvesChartInstance.current.destroy();
    }

    if (curvesChartRef.current) {
      curvesChartInstance.current = new window.Chart(curvesChartRef.current, {
        type: "line",
        data: { labels, datasets: datasetsCurves },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: "Número de Trades", color: "#FFF" },
              ticks: { color: "#FFF" },
            },
            y: {
              title: { display: true, text: "Capital (R$)", color: "#FFF" },
              ticks: { color: "#FFF" },
            },
          },
        },
      });
    }

    // Render histogram
    const bins = 30;
    const min = Math.min(...finalCaps);
    const max = Math.max(...finalCaps);
    const binWidth = (max - min) / bins;
    const counts = Array(bins).fill(0);

    finalCaps.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
      counts[idx]++;
    });

    const histLabels = counts.map((_, i) => (min + binWidth * i).toFixed(0));

    if (histChartInstance.current) {
      histChartInstance.current.destroy();
    }

    if (histChartRef.current) {
      histChartInstance.current = new window.Chart(histChartRef.current, {
        type: "bar",
        data: {
          labels: histLabels,
          datasets: [
            { label: "Frequência", data: counts, backgroundColor: "#BBF717" },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Capital Final (R$)",
                color: "#FFF",
              },
              ticks: { color: "#FFF" },
            },
            y: {
              title: { display: true, text: "Frequência", color: "#FFF" },
              ticks: { color: "#FFF" },
            },
          },
          plugins: { legend: { labels: { color: "#FFF" } } },
        },
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Simulador Monte Carlo</h1>
        <p className="text-gray-400">
          Simule cenários futuros baseados em estatísticas
        </p>
      </div>

      {/* Input Parameters */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <div className="flex flex-wrap gap-5 mb-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">
              Valor Inicial da Carteira (R$)
            </label>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Taxa de Acerto (%)</label>
            <Input
              type="number"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              step="0.1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Ganho Médio (%)</label>
            <Input
              type="number"
              value={avgWin}
              onChange={(e) => setAvgWin(e.target.value)}
              step="0.1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Perda Média (%)</label>
            <Input
              type="number"
              value={avgLoss}
              onChange={(e) => setAvgLoss(e.target.value)}
              step="0.1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">
              Número de Trades por Simulação
            </label>
            <Input
              type="number"
              value={numTrades}
              onChange={(e) => setNumTrades(e.target.value)}
              step="1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Número de Simulações</label>
            <Input
              type="number"
              value={numSims}
              onChange={(e) => setNumSims(e.target.value)}
              step="1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Traçar Curvas (máx)</label>
            <Input
              type="number"
              value={maxCurves}
              onChange={(e) => setMaxCurves(e.target.value)}
              step="1"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>
        </div>

        <Button
          onClick={runMonteCarlo}
          className="bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold px-5 py-2.5 mt-2.5 rounded-sm"
        >
          Executar Simulação
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-2.5 mb-5">
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Média Capital Final:</strong>{" "}
            {formatCurrency(results.meanCap)}
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Média P/L:</strong>{" "}
            <span
              className={
                results.meanPnl < 0 ? "text-[#FF4C4C]" : "text-[#BBF717]"
              }
            >
              {results.meanPnl >= 0 ? "+" : ""}
              {formatCurrency(results.meanPnl)}
            </span>
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Mediana Capital Final:</strong>{" "}
            {formatCurrency(results.medianCap)}
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Mediana P/L:</strong>{" "}
            <span
              className={
                results.medianPnl < 0 ? "text-[#FF4C4C]" : "text-[#BBF717]"
              }
            >
              {results.medianPnl >= 0 ? "+" : ""}
              {formatCurrency(results.medianPnl)}
            </span>
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Melhor Capital Final:</strong>{" "}
            {formatCurrency(results.bestCap)}
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Melhor P/L:</strong>{" "}
            <span className="text-[#BBF717]">
              +{formatCurrency(results.bestPnl)}
            </span>
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Pior Capital Final:</strong>{" "}
            {formatCurrency(results.worstCap)}
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Pior P/L:</strong>{" "}
            <span className="text-[#FF4C4C]">
              {formatCurrency(results.worstPnl)}
            </span>
          </div>
          <div className="bg-black p-2.5 rounded-sm">
            <strong>Drawdown Máximo:</strong>{" "}
            {formatCurrency(results.globalMaxDrawdown)}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-5">
        <div className="bg-[#2A2B2A] p-5 rounded">
          <h2 className="text-xl font-bold text-[#BBF717] mb-3">
            Curvas de Equity (amostragem)
          </h2>
          <div className="bg-black p-4 rounded" style={{ height: "400px" }}>
            <canvas ref={curvesChartRef} className="w-full h-full"></canvas>
          </div>
        </div>

        <div className="bg-[#2A2B2A] p-5 rounded">
          <h2 className="text-xl font-bold text-[#BBF717] mb-3">
            Distribuição de Capital Final
          </h2>
          <div className="bg-black p-4 rounded" style={{ height: "400px" }}>
            <canvas ref={histChartRef} className="w-full h-full"></canvas>
          </div>
        </div>
      </div>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description="Chart.js ainda está carregando. Tente novamente em alguns segundos."
      />
    </div>
  );
}
