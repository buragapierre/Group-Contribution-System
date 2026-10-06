# Synora — Use Case Diagram

---

## Overview

Four actors interact with the system: Admin, Professor, Student, and Leader. (Leader is a student with extra privileges — they can do everything a Student can, plus manage their group.)

```text
usecase-beta

actor Admin("Admin")
actor Professor("Professor")
actor Student("Student")
actor Leader("Leader")

Login("Sign Up / Log In")
CompleteProfile("Complete Profile")
ManageUsers("Manage Users")
VerifyProfessor("Verify Professor Account")
CreateClass("Create Class")
CreateProject("Create Project")
CreateGroup("Create Group")
MonitorContributions("Monitor Contributions")
ViewReports("View Reports")
JoinClass("Join Class")
ViewTasks("View Tasks")
SubmitTask("Submit Task")
PeerEvaluation("Peer Evaluation")
ViewActivity("View Activity")
CreateAssignTask("Create & Assign Task")
AddRemoveMembers("Add / Remove Members")
ReviewSubmission("Review Submission")

Admin --> Login
Admin --> ManageUsers
ManageUsers --> VerifyProfessor

Professor --> Login
Professor --> CreateClass
Professor --> CreateProject
Professor --> CreateGroup
Professor --> MonitorContributions
Professor --> ViewReports

Student --> Login
Student --> CompleteProfile
Student --> JoinClass
Student --> ViewTasks
Student --> SubmitTask
Student --> PeerEvaluation
Student --> ViewActivity

Leader --> Login
Leader --> CompleteProfile
Leader --> JoinClass
Leader --> ViewTasks
Leader --> SubmitTask
Leader --> PeerEvaluation
Leader --> ViewActivity
Leader --> CreateAssignTask
Leader --> AddRemoveMembers
Leader --> ReviewSubmission
```

---

## Overall Use Case Explanation

The Use Case Diagram of the Group Contribution Monitoring System, locally known as Synora, illustrates the functional requirements of the system by showing what each type of user can do and how the system responds to their requests. In UML modeling, a **use case** represents a specific function or service that the system provides, while an **actor** represents any external entity — typically a user role — that interacts with the system. In this diagram, there are four (4) actors and seventeen (17) use cases that collectively define the scope of the system's functionality.

The first actor is the **Administrator**, who is responsible for the overall management of the system. The administrator performs the *Sign Up / Log In* use case, which is common to all users, and has two exclusive responsibilities: *Manage Users*, which allows the administrator to view, update, promote, or remove user accounts, and *Verify Professor Account*, which is included in the user management process and is performed whenever a professor registers and requires approval before gaining full access.

The second actor is the **Professor**, who serves as the academic authority of the system. Aside from logging in, the professor performs five core functions: *Create Class*, *Create Project*, *Create Group*, *Monitor Contributions*, and *View Reports*. Through these use cases, the professor organizes classes, assigns projects, forms groups with a designated leader, tracks the contribution percentage of every student, and reviews the overall statistics of the class or project.

The third actor is the **Student**, who is the primary end user of the system. The student begins by logging in and completing the *Complete Profile* use case, which requires the course, year level, and section before accessing the main system. The student then performs *Join Class* using the class code given by the professor, *View Tasks* to see the tasks assigned by the group leader, *Submit Task* to upload files and comments for evaluation, *Peer Evaluation* to rate the contributions of fellow group members, and *View Activity* to review the history of their recorded actions in the system.

The fourth actor is the **Group Leader**, who is a student entrusted with additional leadership privileges. The leader performs all the use cases available to a regular student, plus three exclusive functions: *Create & Assign Task*, which allows the leader to create tasks and assign them to specific members; *Add / Remove Members*, which allows the leader to manage the membership of the group; and *Review Submission*, through which the leader verifies, requests revision from, or rejects the work submitted by a member. These three use cases differentiate the leader from an ordinary student and reflect the leadership role assigned by the professor during group creation.

In summary, the Use Case Diagram demonstrates that every functionality of the Group Contribution Monitoring System is clearly associated with a specific user role. The diagram serves as the functional blueprint of the system, guiding the development of the interface and business rules while ensuring that each actor is granted only the appropriate level of access and responsibility.

---

## Use Cases by Actor

| Actor | Use Cases |
|-------|-----------|
| **Admin** | Sign Up / Log In, Manage Users, Verify Professor Account |
| **Professor** | Sign Up / Log In, Create Class, Create Project, Create Group, Monitor Contributions, View Reports |
| **Student** | Sign Up / Log In, Complete Profile, Join Class, View Tasks, Submit Task, Peer Evaluation, View Activity |
| **Leader** | All Student use cases, plus Create & Assign Task, Add / Remove Members, Review Submission |

---

## Brief Descriptions

| Use Case | Description |
|----------|-------------|
| Sign Up / Log In | Any user creates an account or logs in |
| Complete Profile | Student sets course, year level, and section |
| Manage Users | Admin views users, promotes students, deletes accounts |
| Verify Professor Account | Admin approves professor sign-up requests |
| Create Class | Professor sets up a class and gets a class code |
| Create Project | Professor adds a project to a class |
| Create Group | Professor creates a group and picks a leader |
| Monitor Contributions | Professor tracks student contribution percentages |
| View Reports | Professor views class and project statistics |
| Join Class | Student joins a class using the class code |
| View Tasks | Student sees assigned tasks and their status |
| Submit Task | Student uploads files and submits work for review |
| Peer Evaluation | Student rates group members' contributions |
| View Activity | Student views their recorded activity timeline |
| Create & Assign Task | Leader creates a task and assigns it to a member |
| Add / Remove Members | Leader manages group membership |
| Review Submission | Leader verifies, requests revision, or rejects a submission |
