import { TrendingUp } from "lucide-react";

import GuestWarningBanner from "@/components/GuestWarningBanner";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
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
    rangeLabel,
    latestWeight,
    initialWeight,
    hasInitialFallback,
    target,
    targetDate,
    remaining,
    progress,
    delta7,
    delta30,
    deltaRange,
    weeklyAvg,
    rangeAvg,
    weightTrendData,
    sleepGoalData,
    sleepRangeAvg,
    sleepRangeMet,
    sleepRangeDays,
    nutritionGoals,
    nutritionRange,
    biofeedbackRangeSummary,
    latestMeasurement,
    weeklyReview,
    chartData,
    nutritionRangeData,
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
    <div className="app-shell min-h-screen px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        {isGuest ? <GuestWarningBanner /> : null}

        <AppPageIntro
          eyebrow="Analisis de progreso"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          title="Progreso"
          description="Analisis longitudinal, tendencias y revision semanal en un solo contexto."
        />

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
          rangeLabel={rangeLabel}
          latestWeight={latestWeight}
          delta7={delta7}
          deltaRange={deltaRange}
          movingAvg7={weightTrendData?.movingAvg7}
          trendLabel={trendLabel(weightTrendData?.trend ?? null)}
          sleepGoalHours={(sleepGoalData.sleep_goal_minutes / 60).toFixed(1)}
          sleepRangeAvgHours={(sleepRangeAvg / 60).toFixed(1)}
          sleepRangeMet={sleepRangeMet}
          sleepRangeDays={sleepRangeDays}
          nutritionRangeCalories={nutritionRange?.averages.calories ?? 0}
          nutritionRangeProtein={nutritionRange?.averages.protein_g ?? 0}
          nutritionRangeCarbs={nutritionRange?.averages.carbs_g ?? 0}
          nutritionRangeFat={nutritionRange?.averages.fat_g ?? 0}
          nutritionGoalCalories={nutritionGoals?.calorie_goal ?? 2000}
          nutritionGoalProtein={nutritionGoals?.protein_goal_g ?? 150}
          nutritionGoalCarbs={nutritionGoals?.carb_goal_g ?? 250}
          nutritionGoalFat={nutritionGoals?.fat_goal_g ?? 70}
          biofeedbackRange={biofeedbackRangeSummary}
          latestMeasurement={latestMeasurement}
          weeklyReview={weeklyReview}
          delta30={delta30}
          weeklyAvg={weeklyAvg}
          rangeAvg={rangeAvg}
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
          rangeLabel={rangeLabel}
          nutritionRangeData={nutritionRangeData}
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
    </div>
  );
};

export default Stats;
