                                                                                # Input - Process - Output (IPO)
## Group Contribution Monitoring System (Synora)

---

## Overall System IPO

| Input | Process | Output |
|-------|---------|--------|
| The system receives user registration data from students, professors, and admins. | The system authenticates the user and assigns the appropriate role based on their account type. | A user account is created with the assigned role. |
| The professor enters class details such as subject, section, and semester. | The system generates a unique join code for the class. | A class record is created with a unique join code. |
| The student enters the class join code to enroll in a class. | The system validates the join code and enrolls the student in the class. | The student is successfully enrolled in the class. |
| The professor enters project details such as title, description, and deadline. | The system links the project to the selected class. | A project record is created and linked to the class. |
| The professor enters group details and selects a leader from the students. | The system assigns the selected student as the leader of the group. | A group record is created with the assigned leader. |
| The leader selects students to add to the group. | The system updates the group membership with the selected students. | The group members list is updated with the new members. |
| The leader enters task details such as title, description, assignee, and deadline. | The system schedules the task with the specified deadline. | Task records are created with assigned deadlines. |
| The student submits their task with content and files. | The system validates the submission and stores it in the database. | The submission is recorded with a timestamp. |
| The leader reviews the submitted task and provides feedback. | The system approves or rejects the submission based on the leader's review. | The submission status is updated with the feedback. |
| The professor reviews the submission and verifies the work. | The system verifies and approves the final submission status. | The final submission status is updated to verified. |
| The system tracks all task activities and submissions from users. | The system calculates the contribution percentage based on tasks completed. | A contribution report is generated for each student. |
| The system monitors the overall progress of groups and projects. | The system aggregates data from tasks, submissions, and contributions. | A progress dashboard is displayed with updated metrics. |

---

## Simple IPO (Summary)

| Input | Process | Output |
|-------|---------|--------|
| Students submit their tasks, leaders create and assign tasks, professors create projects and groups, and administrators manage users. | The system authenticates users with role-based access, schedules deadlines, validates data, and calculates contributions. | The system automatically records contributions and tasks, updates progress, and generates reports. |

---

*Document Version: 1.0*
*Last Updated: September 23, 2026*
