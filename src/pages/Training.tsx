import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { TrainingCustomExerciseDialog } from "@/modules/training/ui/components/TrainingCustomExerciseDialog";
import { TrainingDeleteWorkoutDialog } from "@/modules/training/ui/components/TrainingDeleteWorkoutDialog";
import { TrainingHistorySection } from "@/modules/training/ui/components/TrainingHistorySection";
import { TrainingLibrarySection } from "@/modules/training/ui/components/TrainingLibrarySection";
import { TrainingPlanningScheduleSection } from "@/modules/training/ui/components/TrainingPlanningScheduleSection";
import { TrainingProgressSection } from "@/modules/training/ui/components/TrainingProgressSection";
import { TrainingRoutinesSection } from "@/modules/training/ui/components/TrainingRoutinesSection";
import { TrainingTodaySection } from "@/modules/training/ui/components/TrainingTodaySection";
import { TrainingWorkoutDialog } from "@/modules/training/ui/components/TrainingWorkoutDialog";
import { formatDateTime, formatRest, prLabelMap } from "@/modules/training/ui/trainingConstants";
import { useTrainingPageState } from "@/modules/training/ui/useTrainingPageState";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "motion/react";

const TRAINING_TAB_ORDER = ["train", "plan", "library", "progress"] as const;

const Training = () => {
  const isMobile = useIsMobile();
  const {
    copy,
    tab,
    handleTabChange,
    filters,
    setFilters,
    selectedExerciseId,
    setSelectedExerciseId,
    workoutDialogOpen,
    setWorkoutDialogOpen,
    customExerciseOpen,
    setCustomExerciseOpen,
    editingWorkoutId,
    workoutName,
    setWorkoutName,
    workoutDescription,
    setWorkoutDescription,
    workoutExercises,
    setWorkoutExercises,
    exercisePickerId,
    setExercisePickerId,
    customExerciseForm,
    setCustomExerciseForm,
    noteDrafts,
    setNoteDrafts,
    setDrafts,
    finishNotes,
    setFinishNotes,
    deleteWorkoutId,
    setDeleteWorkoutId,
    workouts,
    templates,
    schedule,
    activeSession,
    scheduledWorkout,
    isRestDayToday,
    exerciseLibrary,
    isTrainingLoading,
    trainingError,
    trainingErrorMessage,
    activeProgress,
    restRemaining,
    history,
    exerciseHistory,
    exerciseProgress,
    exercisePrs,
    formatExerciseName,
    localizeText,
    getWorkoutPreviewText,
    getSetDraft,
    getExerciseDraftCount,
    renderPlaceholder,
    saveSet,
    openCreateRoutine,
    openEditRoutine,
    saveWorkoutFromDraft,
    saveWorkoutMutation,
    deleteWorkoutMutation,
    duplicateTemplateMutation,
    saveScheduleMutation,
    saveCustomExerciseMutation,
    startSessionMutation,
    saveSetMutation,
    deleteSetMutation,
    saveSessionNoteMutation,
    finishSessionMutation,
  } = useTrainingPageState();

  return (
    <div className="app-shell min-h-screen px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <div data-tour="training-hero">
          <AppPageIntro eyebrow="Bitácora de entrenamiento" title={copy.title} description={isMobile ? undefined : copy.subtitle} />
        </div>

        {isTrainingLoading ? <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{copy.loading}</div> : null}
        {trainingError ? <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{copy.failedLoad}: {trainingErrorMessage}</div> : null}

        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-5">
        <div data-tour="training-tabs" className="app-surface-panel rounded-[20px] p-2 sm:rounded-[24px]">
          <TabsList className="relative grid h-auto w-full grid-cols-4 bg-transparent p-0">
            <motion.span
              aria-hidden
              className="absolute bottom-1 left-1 top-1 rounded-xl bg-primary"
              style={{ width: "calc((100% - 0.5rem) / 4)" }}
              animate={{ x: `${TRAINING_TAB_ORDER.findIndex((tabKey) => tabKey === tab) * 100}%` }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            />
            <TabsTrigger
              data-tour="training-tab-train"
              className="relative z-10 min-w-0 rounded-xl bg-transparent px-2 text-xs font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:text-sm"
              value="train"
            >
              {copy.tabs.train}
            </TabsTrigger>
            <TabsTrigger
              data-tour="training-tab-plan"
              className="relative z-10 min-w-0 rounded-xl bg-transparent px-2 text-xs font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:text-sm"
              value="plan"
            >
              {copy.tabs.plan}
            </TabsTrigger>
            <TabsTrigger
              data-tour="training-tab-library"
              className="relative z-10 min-w-0 rounded-xl bg-transparent px-2 text-xs font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:text-sm"
              value="library"
            >
              {copy.tabs.library}
            </TabsTrigger>
            <TabsTrigger
              data-tour="training-tab-progress"
              className="relative z-10 min-w-0 rounded-xl bg-transparent px-2 text-xs font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:text-sm"
              value="progress"
            >
              {copy.tabs.progress}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="train" className="space-y-5">
          <div data-tour="training-train-section">
            <TrainingTodaySection
            copy={copy}
            activeSession={activeSession}
            scheduledWorkout={scheduledWorkout}
            isRestDayToday={isRestDayToday}
            schedule={schedule}
            workouts={workouts}
            activeProgress={activeProgress}
            restRemaining={restRemaining}
            finishNotes={finishNotes}
            noteDrafts={noteDrafts}
            renderPlaceholder={renderPlaceholder}
            formatDateTime={formatDateTime}
            formatRest={formatRest}
            formatExerciseName={formatExerciseName}
            getSetDraft={getSetDraft}
            getExerciseDraftCount={getExerciseDraftCount}
            onFinishNotesChange={setFinishNotes}
            onNoteDraftsChange={setNoteDrafts}
            onDraftsChange={setDrafts}
            onStartWorkout={(workoutId) => startSessionMutation.mutate(workoutId)}
            onFinishSession={(payload) => finishSessionMutation.mutate(payload)}
            onSaveExerciseNote={(payload) => saveSessionNoteMutation.mutate(payload)}
            onSaveSet={saveSet}
            onDeleteSet={(payload) => deleteSetMutation.mutate(payload)}
            onOpenPlanning={() => handleTabChange("plan")}
            isStartPending={startSessionMutation.isPending}
            isFinishPending={finishSessionMutation.isPending}
            isSaveSessionNotePending={saveSessionNoteMutation.isPending}
            isSaveSetPending={saveSetMutation.isPending}
            isDeleteSetPending={deleteSetMutation.isPending}
            />
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-5">
          <div data-tour="training-plan-section">
            <TrainingPlanningScheduleSection
            copy={copy}
            schedule={schedule}
            workouts={workouts}
            isSaveSchedulePending={saveScheduleMutation.isPending}
            onSaveScheduleDay={(payload) => saveScheduleMutation.mutate(payload)}
            />
          </div>
          <div data-tour="training-routines-section">
            <TrainingRoutinesSection
            copy={copy}
            workouts={workouts}
            templates={templates}
            hasActiveSession={Boolean(activeSession)}
            isStartPending={startSessionMutation.isPending}
            isSavePending={saveWorkoutMutation.isPending}
            isDeletePending={deleteWorkoutMutation.isPending}
            isDuplicatePending={duplicateTemplateMutation.isPending}
            renderPlaceholder={renderPlaceholder}
            getWorkoutPreviewText={getWorkoutPreviewText}
            localizeText={localizeText}
            onCreateRoutine={openCreateRoutine}
            onStartWorkout={(workoutId) => startSessionMutation.mutate(workoutId)}
            onEditWorkout={openEditRoutine}
            onDeleteWorkout={setDeleteWorkoutId}
            onDuplicateTemplate={(templateId) => duplicateTemplateMutation.mutate(templateId)}
            />
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-5">
          <div data-tour="training-library-section">
            <TrainingLibrarySection
              copy={copy}
              filters={filters}
              exerciseLibrary={exerciseLibrary}
              formatExerciseName={formatExerciseName}
              onOpenCustomExercise={() => setCustomExerciseOpen(true)}
              onFiltersChange={setFilters}
              onSelectExercise={setSelectedExerciseId}
            />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-5">
          <div data-tour="training-progress-section" className="space-y-5">
            <TrainingProgressSection
            copy={copy}
            selectedExerciseId={selectedExerciseId}
            exerciseLibrary={exerciseLibrary}
            prs={exercisePrs}
            progress={exerciseProgress}
            history={exerciseHistory}
            prLabelMap={prLabelMap}
            formatDateTime={formatDateTime}
            formatExerciseName={formatExerciseName}
            onSelectExercise={setSelectedExerciseId}
            />
            <TrainingHistorySection
            copy={copy}
            history={history}
            renderPlaceholder={renderPlaceholder}
            formatDateTime={formatDateTime}
            />
          </div>
        </TabsContent>
        </Tabs>

        <TrainingWorkoutDialog
        copy={copy}
        open={workoutDialogOpen}
        editingWorkoutId={editingWorkoutId}
        workoutName={workoutName}
        workoutDescription={workoutDescription}
        exercisePickerId={exercisePickerId}
        exerciseLibrary={exerciseLibrary}
        workoutExercises={workoutExercises}
        isPending={saveWorkoutMutation.isPending}
        formatExerciseName={formatExerciseName}
        onOpenChange={setWorkoutDialogOpen}
        onWorkoutNameChange={setWorkoutName}
        onWorkoutDescriptionChange={setWorkoutDescription}
        onExercisePickerChange={setExercisePickerId}
        onWorkoutExercisesChange={setWorkoutExercises}
        onSave={saveWorkoutFromDraft}
        />

        <TrainingCustomExerciseDialog
        copy={copy}
        open={customExerciseOpen}
        form={customExerciseForm}
        isPending={saveCustomExerciseMutation.isPending}
        onOpenChange={setCustomExerciseOpen}
        onFormChange={setCustomExerciseForm}
        onSave={() => saveCustomExerciseMutation.mutate(customExerciseForm)}
        />

        <TrainingDeleteWorkoutDialog
        copy={copy}
        workoutId={deleteWorkoutId}
        onOpenChange={(open) => !open && setDeleteWorkoutId(null)}
        onConfirm={(workoutId) => deleteWorkoutMutation.mutate(workoutId)}
        />
      </div>
    </div>
  );
};

export default Training;
