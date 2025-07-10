# Flowchart Game

**Flowchart Game** is an interactive web-based application developed using **Next.js** and **Tailwind CSS**, designed to help users learn and assess their understanding of processes or systems through flowchart construction. The project consists of two parts:

- `flowchartgame`: The main interface where users solve flowchart-based questions.
- `queryflowchartgame`: A supporting module for managing and querying question data.

---

## User Flow

1. **Display of Available Questions**  
   A list of available questions is presented to the user. (Two sample questions are provided initially.)

2. **Question Selection**  
   Upon selection, the full question and its related components are displayed.

3. **Component Display**  
   Draggable components (representing steps in a process) are shown on either side of the interface.

4. **Flowchart Construction**  
   Users drag and drop components into a designated area to build a flowchart based on the question.

5. **Submission and Evaluation**  
   After completing the flowchart, users can click **"Check My Workflow"** to submit their solution for evaluation.

6. **Feedback and Scoring**  
   The application compares the user’s flowchart with the correct solution and provides feedback along with an accuracy score.

7. **Correct Solution Display **  
   A "Show Correct Solution" button may be used to display the correct flowchart.

---

## Technologies Used

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Flowchart Rendering**: React Flow
- **Animations**: Framer Motion
- **Audio Feedback**: Howler.js
- **Visual Effects**: Canvas Confetti
- **State Management**: React Hooks
- **Drag and Drop**: Native HTML5 Drag and Drop API

---

### Installation

Install dependencies by running the following command in both `flowchartgame` and `queryflowchartgame` directories:

```bash
npm install react react-dom next reactflow framer-motion uuid howler canvas-confetti
```

---

## Getting Started

1. Navigate to the `flowchartgame` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Repeat these steps for `queryflowchartgame` 

---

## Features

- Drag-and-drop interactive flowchart building
- Real-time accuracy feedback and scoring
- Support for modular and customizable question sets
- Optional display of correct solution
- Responsive, extensible, and user-friendly design

