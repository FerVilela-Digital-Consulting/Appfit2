import { TrendingUp } from "lucide-react";

import GuestWarningBanner from "@/components/GuestWarningBanner";
import { StatsGoalSummaryCard } from "@/pages/stats/components/StatsGoalSummaryCard";
import { StatsSummaryCards } from "@/pages/stats/components/StatsSummaryCards";
import { StatsTrendChartsGrid } from "@/pages/stats/components/StatsTrendChartsGrid";
import { StatsWeeklyReviewCard } from "@/pages/stats/components/StatsWeeklyReviewCard";
import { StatsWeightChartCard } from "@/pages/stats/components/StatsWeightChartCard";
import { formatChartDate, formatNumber, trendLabel, useStatsPageState } from "@/pages/stats/useStatsPageState";

const Stats = () => {
  const {
    isGuest,
    range,
    setRange,
    latestWeight,
    initialWeight,
    hasInitialFallback,
    target,
    targetDate,
    remaining,
    progress,
    delta7,
    delta30,
    weeklyAvg,
    weightTrendData,
    sleepGoalData,
    sleepWeekAvg,
    sleepMonthAvg,
    sleepWeekMet,
    nutritionGoals,
    nutrition7d,
    nutrition30d,
    biofeedbackWeek,
    latestMeasurement,
    weeklyReview,
    chartData,
    nutrition7dData,
    nutrition30dData,
    biofeedbackChartData,
    bodyFatChartData,
    weightChartHeight,
    secondaryChartHeight,
    chartMargin,
    yAxisWidth,
    isMobile,
    hydrationState,
    setHydrationState,
    trainingPerformance,
    setTrainingPerformance,
    weeklyNotes,
    setWeeklyNotes,
    saveWeeklyReviewMutation,
  } = useStatsPageState();

  return (
    <div className="container max-w-6xl space-y-5 py-6 md:space-y-6 md:py-8">
      {isGuest ? <GuestWarningBanner /> : null}

      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Progreso</h1>
          <p className="text-sm text-muted-foreground">Analisis longitudinal, tendencias y revision semanal en un solo contexto.</p>
        </div>
      </div>

      <StatsGoalSummaryCard
        latestWeight={latestWeight}
        initialWeight={initialWeight}
        hasInitialFallback={hasInitialFallback}
        target={target}
        targetDate={targetDate}
        remaining={remaining}
        progress={progress}
        formatNumber={formatNumber}
      />

      <StatsSummaryCards
        latestWeight={latestWeight}
        delta7={delta7}
        movingAvg7={weightTrendData?.movingAvg7}
        trendLabel={trendLabel(weightTrendData?.trend ?? null)}
        sleepGoalHours={(sleepGoalData.sleep_goal_minutes / 60).toFixed(1)}
        sleepWeekAvgHours={(sleepWeekAvg / 60).toFixed(1)}
        sleepMonthAvgHours={(sleepMonthAvg / 60).toFixed(1)}
        sleepWeekMet={sleepWeekMet}
        nutrition7dCalories={nutrition7d?.averages.calories ?? 0}
        nutrition7dProtein={nutrition7d?.averages.protein_g ?? 0}
        nutrition30dCarbs={nutrition30d?.averages.carbs_g ?? 0}
        nutrition30dFat={nutrition30d?.averages.fat_g ?? 0}
        nutritionGoalCalories={nutritionGoals?.calorie_goal ?? 2000}
        nutritionGoalProtein={nutritionGoals?.protein_goal_g ?? 150}
        nutritionGoalCarbs={nutritionGoals?.carb_goal_g ?? 250}
        nutritionGoalFat={nutritionGoals?.fat_goal_g ?? 70}
        biofeedbackWeek={biofeedbackWeek}
        latestMeasurement={latestMeasurement}
        weeklyReview={weeklyReview}
        delta30={delta30}
        weeklyAvg={weeklyAvg}
        prevMovingAvg7={weightTrendData?.prevMovingAvg7}
        formatNumber={formatNumber}
        trendLabelForValue={trendLabel}
      />

      <StatsWeightChartCard
        range={range}
        onRangeChange={setRange}
        chartData={chartData}
        chartHeight={weightChartHeight}
        chartMargin={chartMargin}
        isMobile={isMobile}
        yAxisWidth={yAxisWidth}
        formatChartDate={formatChartDate}
      />

      <StatsTrendChartsGrid
        nutrition7dData={nutrition7dData}
        nutrition30dData={nutrition30dData}
        biofeedbackChartData={biofeedbackChartData}
        bodyFatChartData={bodyFatChartData}
        chartHeight={secondaryChartHeight}
        chartMargin={chartMargin}
        isMobile={isMobile}
        yAxisWidth={yAxisWidth}
        formatChartDate={formatChartDate}
      />

      <StatsWeeklyReviewCard
        weeklyReview={weeklyReview}
        hydrationState={hydrationState}
        onHydrationStateChange={setHydrationState}
        trainingPerformance={trainingPerformance}
        onTrainingPerformanceChange={setTrainingPerformance}
        weeklyNotes={weeklyNotes}
        onWeeklyNotesChange={setWeeklyNotes}
        isPending={saveWeeklyReviewMutation.isPending}
        onSave={() => saveWeeklyReviewMutation.mutate()}
      />
    </div>
  );
};

export default Stats;
