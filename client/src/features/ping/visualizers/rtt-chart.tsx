import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { PingReplyDto } from "@netvizlab/shared";

interface RttChartProps {
  readonly replies: readonly PingReplyDto[];
}

export const RttChart = ({ replies }: RttChartProps) => {
  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 40, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: "category",
        data: replies.map((r) => r.sequence),
        axisLine: { lineStyle: { color: "#1E2230" } },
        axisLabel: {
          color: "#5A6172",
          fontFamily: "JetBrains Mono",
          fontSize: 11,
        },
        name: "sequence",
        nameTextStyle: { color: "#5A6172", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "ms",
        nameTextStyle: { color: "#5A6172", fontSize: 11 },
        axisLabel: {
          color: "#5A6172",
          fontFamily: "JetBrains Mono",
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: "#1E2230", type: "dashed" } },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#171B24",
        borderColor: "#1E2230",
        textStyle: {
          color: "#E6E9F0",
          fontFamily: "JetBrains Mono",
          fontSize: 12,
        },
        formatter: (params: Array<{ value: number; dataIndex: number }>) => {
          const point = params[0];
          if (!point) return "";
          return `seq ${replies[point.dataIndex]?.sequence} — ${point.value}ms`;
        },
      },
      series: [
        {
          type: "line",
          data: replies.map((r) => r.rttMs),
          smooth: 0.3,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: "#4FD1FF", width: 2 },
          itemStyle: { color: "#4FD1FF" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(79, 209, 255, 0.25)" },
                { offset: 1, color: "rgba(79, 209, 255, 0)" },
              ],
            },
          },
        },
      ],
    }),
    [replies],
  );

  if (replies.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center font-mono text-xs text-ink-faint">
        waiting for replies…
      </div>
    );
  }

  return <ReactECharts option={option} style={{ height: 192 }} notMerge />;
};
