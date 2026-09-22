# Synora — Grading Criteria Plan (Set Aside)

## Overview
Professors define custom grading criteria for individual student evaluation.
Group leaders evaluate their own members on manual criteria.
System auto-calculates objective criteria from task data.

---

## The Concept

| Criterion | Type | Who Sets Score |
|-----------|------|----------------|
| Task Completion (40%) | Auto | System calculates |
| Punctuality (20%) | Auto | System calculates |
| Participation (20%) | Manual | Leader inputs |
| Quality of Work (20%) | Manual | Leader inputs |

---

## Database Design

```sql
-- Professor defines criteria per class
CREATE TABLE grading_criteria (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,           -- e.g. "Task Completion"
  weight INT NOT NULL,          -- percentage, e.g. 40
  type TEXT NOT NULL,           -- 'auto' or 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leader evaluates members on manual criteria
CREATE TABLE leader_evaluations (
  id BIGSERIAL PRIMARY KEY,
  criteria_id BIGINT REFERENCES grading_criteria(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  score INT NOT NULL,           -- 0-100
  UNIQUE(criteria_id, student_id)
);

-- Computed individual grades per student per class
CREATE TABLE individual_grades (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
  final_grade INT DEFAULT 0,    -- weighted average 0-100
  breakdown JSONB DEFAULT '{}', -- {"Task Completion": 90, "Punctuality": 85, ...}
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);
```

---

## Services — `src/services/grading.js`

- `fetchCriteriaByClass(classId)` — get all criteria for a class
- `createCriteria(data)` — add a criterion
- `updateCriteria(id, updates)` — edit a criterion
- `deleteCriteria(id)` — remove a criterion
- `upsertEvaluation(data)` — leader saves a score for a student on a manual criterion
- `fetchEvaluationsByGroup(groupId)` — get all evaluations for a group
- `calculateIndividualGrade(studentId, classId)` — compute final grade from criteria + auto data + manual evaluations
- `fetchIndividualGrade(studentId, classId)` — get stored grade

---

## Professor UI — Grading Criteria Management

**Where:** ProfessorClassDetail page, add "Grading Criteria" card in sidebar (below Class Code).

**What it shows:**
- List of criteria with name, weight%, type (auto/manual badge)
- Total weight displayed (must equal 100%)
- "+ Add Criterion" button opens a modal
- Each criterion has edit/delete actions

**Add/Edit Modal:**
- Name: text input (e.g. "Task Completion")
- Weight: number input (e.g. 40)
- Type: dropdown (Auto / Manual)
- Auto criteria info text: "Calculated from task data"
- Manual criteria info text: "Leader evaluates each member"

**Default criteria (pre-filled when prof first opens):**
- Task Completion — 40% — Auto
- Punctuality — 20% — Auto
- Participation — 20% — Manual
- Quality of Work — 20% — Manual

---

## Leader UI — Evaluate Members

**Where:** New page `/leader/evaluate?group=ID` or a tab in GroupWorkspace.

**What it shows:**
- Table/grid: rows = group members, columns = manual criteria
- Each cell = number input (0-100)
- Auto criteria shown as read-only with calculated values
- "Save Evaluations" button
- Final grade displayed per member

**Auto calculation logic:**
- **Task Completion** = `(tasks_completed / tasks_assigned) * 100` or `0` if no tasks
- **Punctuality** = `(on_time_completions / tasks_completed) * 100` or `0`

---

## Student UI — View Individual Grade

**Where:** Update MyContribution page to show the grading breakdown.

**What it shows:**
- Final grade (big number/ring)
- Breakdown per criterion: name, weight%, score, weighted contribution
- Auto criteria show the data source (e.g. "8/10 tasks completed")
- Manual criteria show "Evaluated by leader"

---

## Options Considered

### Option A — Auto-Calculated Criteria (Per Class)
- Prof defines weighted criteria per class, system auto-calculates each student's grade
- **Pros:** No manual work for prof, grades update automatically
- **Cons:** Less flexible, only works with measurable data (~50-60% accurate)

### Option B — Manual Criteria (Per Class)
- Prof defines criteria with weights, then manually inputs each student's score per criterion
- **Pros:** Full control, can include subjective factors
- **Cons:** More work for prof

### Option C — Hybrid (Per Class) ⭐ RECOMMENDED
- Some criteria auto-calculate, some are manual
- **Pros:** Best of both worlds, prof chooses what's auto vs manual
- **Cons:** Slightly more complex UI

### Option D — Per-Project Criteria
- Each project can have its own set of criteria
- **Pros:** Different subjects need different evaluation methods
- **Cons:** More setup if many projects

---

## Recommendation: Option C (Hybrid)

**Why:**
- About 50-60% of student performance can be accurately auto-calculated (tasks, punctuality)
- The rest requires human judgment (quality, participation)
- Leader does the manual grading (not prof) since they see the actual work
- Prof sets the criteria and weights, leader evaluates

---

## Auto-Calculation Accuracy

### What CAN be auto-calculated accurately:
- Task Completion rate (tasks completed / tasks assigned)
- Punctuality (on-time submissions / total submissions)
- Submission rate (submitted vs not submitted)
- Progress (based on task progress values)

### What CANNOT be auto-calculated:
- Quality of work — needs human judgment
- Participation — how active they are
- Research depth — subjective
- Presentation skills — subjective

---

## Routes to Add

- `/professor/classes/:id/grading` — Grading criteria management
- `/leader/evaluate` — Leader evaluation page

---

## Build Order

1. Database schema + migration SQL
2. Grading service (`grading.js`)
3. Professor grading criteria management UI
4. Leader evaluation UI
5. Student grade view
6. Build & lint verification

---

## ALSO SET ASIDE: Weighted Progress Formula

### Current Formula (Problematic)
```
progress = (verified tasks / total tasks) × 100
```
- Only "verified" tasks count
- "Submitted" tasks (student finished, waiting for review) count as 0%
- Doesn't reflect actual effort

### Recommended: Weighted Formula

| Status | Weight | Reasoning |
|--------|--------|-----------|
| Verified | 100% | Fully approved by leader. Done. |
| Submitted | 80% | Student finished it. Most get verified. |
| Under Review | 80% | Being reviewed. Same as submitted. |
| In Progress | 50% | Actively working. Half credit. |
| Needs Revision | 30% | Did work but needs redo. Some credit. |
| Assigned | 0% | Nothing done yet. |

### Example Comparison

5 tasks: 2 verified, 1 submitted, 1 in progress, 1 assigned

| Formula | Result |
|---------|--------|
| Current (verified only) | 2/5 = **40%** |
| Weighted | (100+100+80+50+0)/5 = **66%** |

### Where to Apply
1. Project Details — group progress
2. Class Detail — project progress
3. Dashboard stats — overall progress

### Status: SET ASIDE (waiting for decision)

---

## Status: SET ASIDE
Waiting for further decision before implementation.
