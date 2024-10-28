# TaskTide

**Sync, Focus, Achieve**
Streamline teamwork and solo efforts to peak efficiency with our task organizer

A task management tool offering private and shared spaces for solo and collaborative work. It provides a structured approach to organizing tasks, with features for setting deadlines, tracking progress, task assignment, and tagging. Potentially includes a Pomodoro-inspired 'Tide Clock' for time tracking and focus enhancement.


We have implemented all basic and extra requirements. Here is the checklist: 

### **Frontend (Responsive Vue.js with Vue Router)**

- [x]  A Vue form with at least 4 fields (excluding login)
- [x]  Responsive design with usability at both desktop and mobile screen sizes
- [x]  Vue Router for navigation
- [x]  Video demonstrates usability in desktop and mobile modes

### **Backend (Node.js with MongoDB)**

- [x]  Node.js backend with Express.js
- [x]  MongoDB database for storing non-trivial state
- [x]  REST API && Socket.IO-based server
- [x]  Authenticated users support
- [x]  Admin user role and RBAC for non-admin users, Basic && Premium 👑
- [x]  Load balanced backend with REST or GraphQL API, demonstrating no obvious dependency on global variables
- [x]  Concurrency handling for safe operations
- [x]  Scale-out Socket.IO server layer

### **Authentication and User Management**

- [x]  Multiple authenticated users
- [x]  Admin and non-admin user roles with role-based access control
- [x]  Video demo shows two different user roles logging in and significant features present for one role but absent for another

### **Testing and Concurrency**

- [x]  Basic End-to-End (E2E) test suite demonstrating a basic user flow
- [x]  Video shows a command-line utility trying to hack into the app using **`curl`** (unsuccessfully)
- [x]  Video demonstrates concurrent use by at least two users working properly
- [x]  E2E test demonstrating a fail condition in CI/CD pipeline
- [x]  Correct use of Git commits (commit messages, structured history)

### **CI/CD and Deployment**

- [x]  GitLab CI/CD pipeline to build Docker images of the app
- [x]  CI/CD demonstrates enabling a feature change (such as wording on a page)
- [x]  Video demo shows CI/CD doing a Docker build and pushing to a registry

### **Additional Features (GraphQL, Socket.IO, and Non-trivial Changes)**

- [x]  Backend server exposes a GraphQL endpoint  /api/graphql
- [x]  Frontend source code includes at least two calls to the GraphQL backend **`user`** **`quickTask`**
- [x]  Video demo demonstrates load balancing (scale-out backend is used)
- [x]  Codebase shows non-trivial changes over and above class-provided example code

### **Video Demonstrations**

- [x]  All team members speak for at least 10 seconds
- [x]  Video has a good explanation of key parts of the code
- [x]  Video has a good explanation of how concurrency is handled
- [x]  Video demo demonstrates concurrent use by at least two users working properly
- [x]  Video shows logs from separate backend servers demonstrating that load balancing is working (while doing REST)

###