import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useTheme } from "@mui/material/styles";

export default function CategorySalesPieChart({ categorySales }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const { palette } = theme;
  const isDark = palette.mode === "dark";
  const primaryColor = palette.primary.main;

  const chartWidth = isSmallScreen ? 220 : 400;
  const chartHeight = isSmallScreen ? 220 : 331;

  const formattedData = categorySales.map((item, index) => ({
    id: index,
    value: Number(item.total_sales) || 0,
    label: item.category_name,
  }));

  const totalSales = formattedData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Paper
      sx={{ p: 3, mb: 4, borderRadius: 3, border: `1px solid ${primaryColor}` }}
    >
      {formattedData.length === 0 ? (
        <Typography>No data found.</Typography>
      ) : (
        <PieChart
          series={[
            {
              data: formattedData,
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              valueFormatter: ({ value }) => {
                const percentage = totalSales
                  ? ((value / totalSales) * 100).toFixed(1)
                  : "0.0";
                return `₹${value.toFixed(2)} (${percentage}%)`;
              },
            },
          ]}
          width={chartWidth}
          height={chartHeight}
        />
      )}
    </Paper>
  );
}
